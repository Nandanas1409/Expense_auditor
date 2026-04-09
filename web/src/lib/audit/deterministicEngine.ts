import policyRules from "@/data/policy-rules.json";

export type AuditStatus = "APPROVED" | "FLAGGED" | "REJECTED";

type Operator = "eq" | "gt" | "gte" | "lt" | "lte" | "in" | "includes";

type Condition = {
  field: string;
  op: Operator;
  value: boolean | number | string | string[];
};

type Rule = {
  id: string;
  title: string;
  description: string;
  severity: "warn" | "fail";
  when: Condition[];
  checks: Condition[];
  onFail: string;
};

type PolicyConfig = {
  version: string;
  statuses: {
    pass: AuditStatus;
    warn: AuditStatus;
    fail: AuditStatus;
  };
  rules: Rule[];
  locationTiers: Record<string, string[]>;
};

export type AuditFacts = {
  amount: number;
  category: string;
  location: string;
  seniority: string;
  receiptReadable: boolean;
  dateMatchesClaim: boolean;
  containsAlcohol: boolean;
  containsPremiumTransport: boolean;
  isClientDinner: boolean;
  businessPurposeContains: string;
  receiptDayOfWeek: string;
  lineItemCount: number;
  locationTier: string;
};

export type RuleEvaluation = {
  ruleId: string;
  title: string;
  passed: boolean;
  severity: "warn" | "fail";
  message: string;
};

export type DeterministicAuditResult = {
  status: AuditStatus;
  policyVersion: string;
  ruleResults: RuleEvaluation[];
  failedRules: RuleEvaluation[];
};

const config = policyRules as PolicyConfig;

function toUpperValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item.toUpperCase() : item));
  }
  return value;
}

function evaluateCondition(condition: Condition, facts: Record<string, unknown>) {
  const factValue = facts[condition.field];
  const left = toUpperValue(factValue);
  const right = toUpperValue(condition.value);

  switch (condition.op) {
    case "eq":
      return left === right;
    case "gt":
      return Number(left) > Number(right);
    case "gte":
      return Number(left) >= Number(right);
    case "lt":
      return Number(left) < Number(right);
    case "lte":
      return Number(left) <= Number(right);
    case "in":
      return Array.isArray(right) && right.includes(left as never);
    case "includes":
      return String(left ?? "").includes(String(right ?? ""));
    default:
      return false;
  }
}

function resolveLocationTier(location: string) {
  const normalized = location.toUpperCase().replace(/[^A-Z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const highCost = config.locationTiers.HIGH_COST || [];

  if (highCost.some((city) => normalized.includes(city))) {
    return "HIGH_COST";
  }

  return "STANDARD";
}

export function buildAuditFacts(input: Omit<AuditFacts, "locationTier">): AuditFacts {
  return {
    ...input,
    locationTier: resolveLocationTier(input.location || ""),
  };
}

export function runDeterministicAudit(facts: AuditFacts): DeterministicAuditResult {
  const factRecord: Record<string, unknown> = {
    ...facts,
    category: facts.category.toUpperCase(),
    seniority: facts.seniority.toUpperCase(),
    businessPurposeContains: facts.businessPurposeContains.toUpperCase(),
    receiptDayOfWeek: facts.receiptDayOfWeek.toUpperCase(),
  };

  const ruleResults: RuleEvaluation[] = [];

  for (const rule of config.rules) {
    const shouldApply = rule.when.every((condition) => evaluateCondition(condition, factRecord));
    if (!shouldApply) {
      continue;
    }

    const passed = rule.checks.every((condition) => evaluateCondition(condition, factRecord));
    ruleResults.push({
      ruleId: rule.id,
      title: rule.title,
      passed,
      severity: rule.severity,
      message: passed ? "Compliant" : rule.onFail,
    });
  }

  const failedRules = ruleResults.filter((rule) => !rule.passed);

  let status: AuditStatus = config.statuses.pass;
  if (failedRules.some((rule) => rule.severity === "fail")) {
    status = config.statuses.fail;
  } else if (failedRules.some((rule) => rule.severity === "warn")) {
    status = config.statuses.warn;
  }

  return {
    status,
    policyVersion: config.version,
    ruleResults,
    failedRules,
  };
}
