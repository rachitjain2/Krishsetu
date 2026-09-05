"""
Final Composite Score & Letter Grade Calculator for KrishiSetu.

Judges FAQ: What is the Weighting Logic?
========================================
We balance post-harvest biological reality with seller trust and visual verification:

1. Freshness Score (25% weight):
   Directly impacts shelf-life and perishability in the supply chain.
   
2. Farmer Reliability Score (30% weight):
   Highest weight. Protects buyers from non-delivery, late arrivals, and bait-and-switch.
   
3. Peer Rating Score (20% weight):
   Historical feedback rating from verified wholesale buyers who transacted before.
   
4. Image Quality Score (25% weight):
   Computer vision inspection ensuring the specific batch photo matches grade specifications.

Total Weights = 25% + 30% + 20% + 25% = 100%

Letter Grade System:
- Grade A: 85 - 100 (Prime wholesale standard; eligible for instant escrow release)
- Grade B: 70 - 84  (Standard commercial grade; reliable for retail mandis)
- Grade C: 50 - 69  (Fair/Discounted grade; recommended for local processing)
- Grade D: Below 50 (High-risk lot; mandatory manual inspection recommended)
"""

from typing import Tuple


def calculate_final_score(
    freshness: float,
    reliability: float,
    peer_rating: float,
    image_quality: float
) -> Tuple[int, str, float]:
    """
    Computes weighted final batch score and assigns official letter grade.
    
    Args:
        freshness: Freshness score (0-100)
        reliability: Farmer reliability score (0-100)
        peer_rating: Peer rating score (0-100)
        image_quality: Image vision analysis score (0-100)
        
    Returns:
        Tuple of (final_score: int, letter_grade: str, exact_float_score: float)
    """
    # Clamp inputs to [0, 100]
    f = max(0.0, min(100.0, float(freshness)))
    r = max(0.0, min(100.0, float(reliability)))
    p = max(0.0, min(100.0, float(peer_rating)))
    i = max(0.0, min(100.0, float(image_quality)))

    # Weighted Equation
    # 0.25 * Freshness + 0.30 * Reliability + 0.20 * Peer Rating + 0.25 * Image
    raw_final = (f * 0.25) + (r * 0.30) + (p * 0.20) + (i * 0.25)
    final_score = int(round(raw_final))

    # Letter Grade Classification
    if final_score >= 85:
        letter_grade = "A"
    elif final_score >= 70:
        letter_grade = "B"
    elif final_score >= 50:
        letter_grade = "C"
    else:
        letter_grade = "D"

    return final_score, letter_grade, round(raw_final, 2)
