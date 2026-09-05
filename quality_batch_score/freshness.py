"""
Freshness Score Calculator for KrishiSetu Quality-Verified Batch Score.

Judges FAQ: How is Freshness Score calculated?
==============================================
Farm produce loses moisture, nutritional value, and market appeal rapidly
after harvest. We calculate age in days between harvest_date and listing_date.

Threshold Rules:
- 0 to 1 days old:  100 (Peak freshness, farm-gate dispatch)
- 2 to 3 days old:  85  (Excellent freshness, ideal for distant transport)
- 4 to 6 days old:  65  (Moderate freshness, suitable for quick local processing)
- 7+ days old:      40  (Aged batch, requires immediate markdown)
"""

from datetime import date, datetime
from typing import Tuple, Union


def parse_date(d: Union[str, date, datetime]) -> date:
    """Helper to safely parse dates in ISO format (YYYY-MM-DD) or datetime objects."""
    if isinstance(d, datetime):
        return d.date()
    if isinstance(d, date):
        return d
    if isinstance(d, str):
        # Handle formats like '2026-09-04', '2026-09-04T00:00:00', etc.
        cleaned = d.split('T')[0].strip()
        return datetime.strptime(cleaned, "%Y-%m-%d").date()
    raise ValueError(f"Invalid date format: {d}")


def calculate_freshness_score(harvest_date: Union[str, date, datetime], listing_date: Union[str, date, datetime] = None) -> Tuple[float, str]:
    """
    Calculates the Freshness Score (0-100) based on age in days.
    
    Args:
        harvest_date: When the crop was harvested (YYYY-MM-DD or date object)
        listing_date: When the crop was listed on KrishiSetu (defaults to today)
        
    Returns:
        Tuple of (score: float, explanation: str)
    """
    if listing_date is None:
        listing_dt = date.today()
    else:
        listing_dt = parse_date(listing_date)
        
    harvest_dt = parse_date(harvest_date)
    
    age_days = (listing_dt - harvest_dt).days
    # Guard against future dates or typos
    if age_days < 0:
        age_days = 0

    if age_days <= 1:
        score = 100.0
        explanation = f"Harvested {age_days} day{'s' if age_days != 1 else ''} ago (Ultra-fresh harvest)"
    elif age_days <= 3:
        score = 85.0
        explanation = f"Harvested {age_days} days ago (Crisp farm-grade quality)"
    elif age_days <= 6:
        score = 65.0
        explanation = f"Harvested {age_days} days ago (Moderate freshness, best for immediate consumption)"
    else:
        score = 40.0
        explanation = f"Harvested {age_days} days ago (Aged stock, discounted batch)"

    return score, explanation
