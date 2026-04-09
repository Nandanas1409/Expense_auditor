from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_dummy_policy(filename, num_pages=40):
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Generic policy intro
    policy_text = """
    CORPORATE TRAVEL AND EXPENSE POLICY
    
    1. GENERAL RULES
    All expenses must be necessary and reasonable. Receipts are required for all expenses.
    
    2. MEALS AND ENTERTAINMENT
    - Breakfast: Max $25/day
    - Lunch: Max $35/day
    - Dinner: Max $75/day
    - Client Dinners: Max $150 per person, approval required.
    Alcohol is only permitted during client entertainment events.
    
    3. TRANSPORTATION
    - Flights: Economy class only for domestic flights. Business class permitted for international flights over 8 hours.
    - Ground Transport: Uber/Lyft X or Standard ONLY. Uber Black is strictly prohibited.
    
    4. LODGING
    - Hotel: Max $250/night in standard cities. Max $400/night in high-cost cities (NY, SF, London).
    
    5. SUBSCRIPTIONS AND SOFTWARE
    - Any software purchase over $50/month requires IT approval.
    """
    
    for page in range(num_pages):
        c.drawString(72, height - 72, f"Corporate Policy Document - Page {page + 1}")
        
        y = height - 100
        for line in policy_text.strip().split('\n'):
            c.drawString(72, y, line)
            y -= 20
            
        c.drawString(72, 72, f"Confidential Internal Document - Page {page + 1}")
        c.showPage()
        
    c.save()

if __name__ == "__main__":
    create_dummy_policy("dummy_policy.pdf")
    print("Created dummy_policy.pdf")
