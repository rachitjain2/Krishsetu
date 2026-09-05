#!/usr/bin/env python3
"""
Standalone CLI Benchmark & Test Script for KrishiSetu Quality-Verified Batch Score.

Run:
  python3 quality_batch_score/standalone_demo.py
"""

import sys
import os
from datetime import date, timedelta

# Ensure parent directory is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from quality_batch_score.freshness import calculate_freshness_score
from quality_batch_score.reliability import calculate_reliability_score
from quality_batch_score.image_analyzer import analyze_crop_image
from quality_batch_score.scoring import calculate_final_score


def run_demo():
    print("=" * 70)
    print("🌾 KRISHISETU: QUALITY-VERIFIED BATCH SCORE BENCHMARK")
    print("=" * 70)

    test_cases = [
        {
            "name": "Case 1: Prime Sharbati Wheat (Ultra Fresh, Top Farmer)",
            "farmer_id": "farmer_ramesh_01",
            "harvest_days_ago": 1,
            "peer_rating": 95.0,
            "mock_img_score": 92.0,
        },
        {
            "name": "Case 2: Hybrid Tomatoes (2 Days Old, Minor Dispute)",
            "farmer_id": "farmer_suresh_02",
            "harvest_days_ago": 2,
            "peer_rating": 84.0,
            "mock_img_score": 80.0,
        },
        {
            "name": "Case 3: Red Potatoes (5 Days Old, High Complaints)",
            "farmer_id": "farmer_rajesh_03",
            "harvest_days_ago": 5,
            "peer_rating": 68.0,
            "mock_img_score": 65.0,
        },
        {
            "name": "Case 4: New Farmer Baseline (No History)",
            "farmer_id": "new_farmer_999",
            "harvest_days_ago": 0,
            "peer_rating": 80.0,
            "mock_img_score": 88.0,
        },
    ]

    for tc in test_cases:
        print(f"\n▶ {tc['name']}")
        print("-" * 60)
        
        # 1. Freshness Score
        h_date = date.today() - timedelta(days=tc["harvest_days_ago"])
        f_score, f_exp = calculate_freshness_score(h_date, date.today())
        print(f"  [Freshness (25%)]    : {f_score:>5.1f} / 100  -> {f_exp}")

        # 2. Reliability Score
        r_score, r_exp, r_stats = calculate_reliability_score(tc["farmer_id"])
        print(f"  [Reliability (30%)]  : {r_score:>5.1f} / 100  -> {r_exp}")

        # 3. Peer Rating Score
        p_score = tc["peer_rating"]
        print(f"  [Peer Rating (20%)]  : {p_score:>5.1f} / 100  -> Verified community feedback")

        # 4. Image Quality Score
        i_score = tc["mock_img_score"]
        print(f"  [Image Vision (25%)] : {i_score:>5.1f} / 100  -> AI Vision surface inspection")

        # 5. Composite Final Score
        final_score, grade, raw_val = calculate_final_score(f_score, r_score, p_score, i_score)
        print("  " + "." * 56)
        print(f"  ★ FINAL BATCH SCORE  : {final_score}/100 [Grade {grade}] (Raw: {raw_val})")


if __name__ == "__main__":
    run_demo()
