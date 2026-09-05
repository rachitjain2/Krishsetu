"""
Farmer Reliability Score Calculator for KrishiSetu Quality-Verified Batch Score.

Judges FAQ: How is Farmer Reliability calculated?
==================================================
Wholesale buyers need assurance that the farmer honors trade agreements,
delivers produce on time, and minimizes disputes.

Formula:
  Reliability = (on_time_deliveries / total_deliveries * 70) + max(0, 30 - quality_complaints * 5)

Explanation of Components:
- On-time delivery rate (0 to 70 points): Rewards consistent logistical discipline.
- Quality Complaint deduction (0 to 30 points): Starts with 30 bonus points;
  each complaint deducts 5 points (down to a minimum of 0).
- New Farmers with no history: Default to 60.0 (neutral baseline, avoiding cold-start penalties).
"""

from typing import Dict, Any, Tuple

# Mock historical database of farmers for demonstration & benchmarking
MOCK_FARMER_HISTORY: Dict[str, Dict[str, Any]] = {
    "farmer_ramesh_01": {
        "name": "Ramesh Patel",
        "total_deliveries": 32,
        "on_time_deliveries": 31,
        "quality_complaints": 0,
        "region": "Ujjain, MP",
    },
    "farmer_suresh_02": {
        "name": "Suresh Verma",
        "total_deliveries": 18,
        "on_time_deliveries": 15,
        "quality_complaints": 1,
        "region": "Nashik, MH",
    },
    "farmer_rajesh_03": {
        "name": "Rajesh Meena",
        "total_deliveries": 10,
        "on_time_deliveries": 7,
        "quality_complaints": 3,
        "region": "Kota, RJ",
    },
    "farmer_mukesh_04": {
        "name": "Mukesh Dhakad",
        "total_deliveries": 45,
        "on_time_deliveries": 44,
        "quality_complaints": 1,
        "region": "Indore, MP",
    },
}


def calculate_reliability_score(farmer_id: str) -> Tuple[float, str, Dict[str, Any]]:
    """
    Calculates the Farmer Reliability Score (0-100) based on historical delivery logs.
    
    Args:
        farmer_id: Unique identifier for the farmer
        
    Returns:
        Tuple of (score: float, explanation: str, raw_stats: dict)
    """
    history = MOCK_FARMER_HISTORY.get(farmer_id)
    
    # Cold-start case: New farmer with zero verified delivery history
    if not history or history.get("total_deliveries", 0) <= 0:
        score = 60.0
        explanation = "New seller baseline (60/100) - First season on KrishiSetu"
        raw_stats = {
            "total_deliveries": 0,
            "on_time_deliveries": 0,
            "quality_complaints": 0,
            "is_new_farmer": True,
        }
        return score, explanation, raw_stats

    total = float(history["total_deliveries"])
    on_time = float(history["on_time_deliveries"])
    complaints = float(history["quality_complaints"])

    # Core Formula Implementation
    on_time_component = (on_time / total) * 70.0
    complaint_penalty_component = max(0.0, 30.0 - (complaints * 5.0))
    
    score = round(min(100.0, max(0.0, on_time_component + complaint_penalty_component)), 1)
    
    on_time_pct = int(round((on_time / total) * 100))
    explanation = f"{on_time_pct}% on-time deliveries ({int(on_time)}/{int(total)}) with {int(complaints)} past dispute{'s' if complaints != 1 else ''}"
    
    raw_stats = {
        "total_deliveries": int(total),
        "on_time_deliveries": int(on_time),
        "quality_complaints": int(complaints),
        "on_time_ratio": round(on_time / total, 3),
        "is_new_farmer": False,
    }
    return score, explanation, raw_stats
