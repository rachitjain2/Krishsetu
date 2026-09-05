"""
FastAPI Server for KrishiSetu Quality-Verified Batch Score.

Endpoints:
1. POST /listings/{listing_id}/upload-image
   - Accepts image file (multipart/form-data)
   - Runs analyze_crop_image()
   - Updates image_quality_score & re-calculates composite final score
2. GET /listings/{listing_id}/quality-score
   - Returns full breakdown of the 4 metrics + letter grade
3. POST /demo/generate-score
   - Generates realistic mock metrics for any listing_id instantly for judges / demo

Run locally:
  uvicorn quality_batch_score.main:app --reload --port 8000
"""

import os
from datetime import date, datetime, timedelta
from typing import Dict, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .models import QualityScore, ScoreBreakdown, GenerateScoreRequest, UploadImageResponse
from .freshness import calculate_freshness_score
from .reliability import calculate_reliability_score
from .image_analyzer import analyze_crop_image
from .scoring import calculate_final_score

app = FastAPI(
    title="KrishiSetu Quality-Verified Batch Score API",
    description="Automated trust & quality verification engine for agricultural produce listings.",
    version="1.0.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory database storing calculated batch quality scores
# Pre-seeded with 4 realistic demo crop listings
SCORES_DB: Dict[str, QualityScore] = {}


def _seed_initial_demo_data():
    """Initializes realistic batch scores for instant testing."""
    samples = [
        {
            "listing_id": "lot-wheat-sharbati-01",
            "farmer_id": "farmer_ramesh_01",
            "crop_name": "MP Sharbati Wheat (Grade-A Golden)",
            "harvest_days_ago": 1,
            "peer_rating": 94.0,
            "peer_exp": "4.8/5.0 stars from 22 wholesale buyers",
            "image_score": 92.0,
            "image_exp": "AI Vision Pass: 95% grain uniformity, zero fungal rot detected",
        },
        {
            "listing_id": "lot-tomato-nashik-02",
            "farmer_id": "farmer_suresh_02",
            "crop_name": "Nashik Hybrid Tomatoes",
            "harvest_days_ago": 2,
            "peer_rating": 88.0,
            "peer_exp": "4.5/5.0 stars from 14 mandi purchasers",
            "image_score": 86.0,
            "image_exp": "Firm skin, vibrant red pigment, 88% visual consistency",
        },
        {
            "listing_id": "lot-potato-kolar-03",
            "farmer_id": "farmer_rajesh_03",
            "crop_name": "Kolar Red Potatoes (Bulk Lot)",
            "harvest_days_ago": 5,
            "peer_rating": 74.0,
            "peer_exp": "3.9/5.0 stars from 8 buyers (minor sizing disputes)",
            "image_score": 72.0,
            "image_exp": "Minor skin abrasions detected on 6% of tubers",
        },
    ]

    for s in samples:
        harvest_dt = date.today() - timedelta(days=s["harvest_days_ago"])
        f_score, f_exp = calculate_freshness_score(harvest_dt, date.today())
        r_score, r_exp, _ = calculate_reliability_score(s["farmer_id"])
        p_score = s["peer_rating"]
        p_exp = s["peer_exp"]
        i_score = s["image_score"]
        i_exp = s["image_exp"]

        final_score, grade, _ = calculate_final_score(f_score, r_score, p_score, i_score)

        SCORES_DB[s["listing_id"]] = QualityScore(
            listing_id=s["listing_id"],
            farmer_id=s["farmer_id"],
            crop_name=s["crop_name"],
            freshness_score=f_score,
            farmer_reliability_score=r_score,
            peer_rating_score=p_score,
            image_quality_score=i_score,
            final_score=final_score,
            letter_grade=grade,
            score_breakdown=ScoreBreakdown(
                freshness=f_score,
                reliability=r_score,
                peer_rating=p_score,
                image_quality=i_score,
                freshness_explanation=f_exp,
                reliability_explanation=r_exp,
                peer_rating_explanation=p_exp,
                image_quality_explanation=i_exp,
            ),
            updated_at=datetime.utcnow().isoformat(),
        )


_seed_initial_demo_data()


# ----------------------------------------------------------------------
# 1. POST /listings/{listing_id}/upload-image
# ----------------------------------------------------------------------
@app.post("/listings/{listing_id}/upload-image", response_model=UploadImageResponse)
async def upload_crop_image(listing_id: str, file: UploadFile = File(...)):
    """
    Accepts an uploaded crop batch photograph, analyzes color/defects,
    updates image_quality_score, and recalculates the final grade.
    """
    contents = await file.read()
    
    # Run the vision inspection module
    img_score, defect_detected, summary, metrics = analyze_crop_image(contents)

    # Fetch existing listing or create default
    existing = SCORES_DB.get(listing_id)
    if existing:
        farmer_id = existing.farmer_id
        f_score = existing.freshness_score
        f_exp = existing.score_breakdown.freshness_explanation
        r_score = existing.farmer_reliability_score
        r_exp = existing.score_breakdown.reliability_explanation
        p_score = existing.peer_rating_score
        p_exp = existing.score_breakdown.peer_rating_explanation
        crop_name = existing.crop_name
    else:
        # Default starting values for new listing
        farmer_id = "farmer_ramesh_01"
        crop_name = "Fresh Produce Batch"
        f_score, f_exp = calculate_freshness_score(date.today() - timedelta(days=1), date.today())
        r_score, r_exp, _ = calculate_reliability_score(farmer_id)
        p_score = 90.0
        p_exp = "4.6/5.0 stars from verified community transactions"

    # Re-calculate final composite score
    new_final_score, new_grade, _ = calculate_final_score(f_score, r_score, p_score, img_score)

    updated_record = QualityScore(
        listing_id=listing_id,
        farmer_id=farmer_id,
        crop_name=crop_name,
        freshness_score=f_score,
        farmer_reliability_score=r_score,
        peer_rating_score=p_score,
        image_quality_score=img_score,
        final_score=new_final_score,
        letter_grade=new_grade,
        score_breakdown=ScoreBreakdown(
            freshness=f_score,
            reliability=r_score,
            peer_rating=p_score,
            image_quality=img_score,
            freshness_explanation=f_exp,
            reliability_explanation=r_exp,
            peer_rating_explanation=p_exp,
            image_quality_explanation=summary,
        ),
        updated_at=datetime.utcnow().isoformat(),
    )

    SCORES_DB[listing_id] = updated_record

    return UploadImageResponse(
        listing_id=listing_id,
        image_quality_score=img_score,
        defect_detected=defect_detected,
        defect_summary=summary,
        updated_final_score=new_final_score,
        updated_letter_grade=new_grade,
        score_breakdown=updated_record.score_breakdown,
    )


# ----------------------------------------------------------------------
# 2. GET /listings/{listing_id}/quality-score
# ----------------------------------------------------------------------
@app.get("/listings/{listing_id}/quality-score", response_model=QualityScore)
async def get_quality_score(listing_id: str):
    """
    Returns the complete QualityScore object and detailed breakdown for a produce listing.
    """
    record = SCORES_DB.get(listing_id)
    if not record:
        # If not present, auto-generate a realistic score on the fly
        auto_gen = await generate_score_for_demo(GenerateScoreRequest(listing_id=listing_id))
        return auto_gen

    return record


# ----------------------------------------------------------------------
# 3. POST /demo/generate-score
# ----------------------------------------------------------------------
@app.post("/demo/generate-score", response_model=QualityScore)
async def generate_score_for_demo(req: GenerateScoreRequest):
    """
    Generates realistic mock values for all 4 components (Freshness, Reliability,
    Peer Rating, Image Quality) and returns the final composite score instantly.
    """
    lid = req.listing_id or "lot-wheat-sharbati-01"
    fid = req.farmer_id or "farmer_ramesh_01"
    crop_name = req.crop_name or "MP Sharbati Wheat (Grade-A)"

    # 1. Freshness Score
    if req.harvest_date:
        f_score, f_exp = calculate_freshness_score(req.harvest_date, req.listing_date or date.today())
    else:
        # Standard fresh 1-day harvest
        f_score, f_exp = calculate_freshness_score(date.today() - timedelta(days=1), date.today())

    # 2. Reliability Score
    r_score, r_exp, _ = calculate_reliability_score(fid)

    # 3. Peer Rating Score
    p_score = 92.0
    p_exp = "4.7/5.0 stars based on 19 previous wholesale dispatches"

    # 4. Image Quality Score
    if req.custom_image_score is not None:
        i_score = req.custom_image_score
        i_exp = f"Computer vision analysis score: {i_score}/100"
    else:
        i_score = 90.0
        i_exp = "AI Vision Pass: 94% color uniformity, no surface blemishes detected"

    final_score, grade, _ = calculate_final_score(f_score, r_score, p_score, i_score)

    result = QualityScore(
        listing_id=lid,
        farmer_id=fid,
        crop_name=crop_name,
        freshness_score=f_score,
        farmer_reliability_score=r_score,
        peer_rating_score=p_score,
        image_quality_score=i_score,
        final_score=final_score,
        letter_grade=grade,
        score_breakdown=ScoreBreakdown(
            freshness=f_score,
            reliability=r_score,
            peer_rating=p_score,
            image_quality=i_score,
            freshness_explanation=f_exp,
            reliability_explanation=r_exp,
            peer_rating_explanation=p_exp,
            image_quality_explanation=i_exp,
        ),
        updated_at=datetime.utcnow().isoformat(),
    )

    SCORES_DB[lid] = result
    return result


@app.get("/")
def root():
    return {
        "service": "KrishiSetu Quality-Verified Batch Score API",
        "version": "1.0.0",
        "weights": {
            "freshness": "25%",
            "farmer_reliability": "30%",
            "peer_rating": "20%",
            "image_quality": "25%",
        },
        "endpoints": [
            "POST /listings/{listing_id}/upload-image",
            "GET /listings/{listing_id}/quality-score",
            "POST /demo/generate-score",
        ],
    }
