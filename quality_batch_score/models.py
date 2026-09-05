"""
Data Models for KrishiSetu Quality-Verified Batch Score.

Defines the structure for batch quality scores, individual metric breakdowns,
and API request/response payloads.
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class ScoreBreakdown(BaseModel):
    """
    Detailed breakdown of the 4 individual score components (0-100 scale)
    along with their respective weights and plain-English explanations.
    """
    freshness: float = Field(..., ge=0, le=100, description="Freshness score based on harvest date (Weight: 25%)")
    reliability: float = Field(..., ge=0, le=100, description="Farmer reliability based on historical deliveries (Weight: 30%)")
    peer_rating: float = Field(..., ge=0, le=100, description="Average buyer peer rating (Weight: 20%)")
    image_quality: float = Field(..., ge=0, le=100, description="Computer vision crop photo quality score (Weight: 25%)")
    
    # Human-readable explanations for judges & buyers
    freshness_explanation: str = Field(..., description="E.g., 'Harvested 1 day ago (100/100)'")
    reliability_explanation: str = Field(..., description="E.g., '96% on-time delivery track record across 24 orders'")
    peer_rating_explanation: str = Field(..., description="E.g., '4.8/5.0 stars from 18 verified wholesale buyers'")
    image_quality_explanation: str = Field(..., description="E.g., 'No visible rot, 94% color uniformity'")


class QualityScore(BaseModel):
    """
    Complete Quality Score representation stored in database/in-memory cache.
    """
    listing_id: str
    farmer_id: str
    crop_name: Optional[str] = "Sharbati Wheat"
    freshness_score: float = Field(..., ge=0, le=100)
    farmer_reliability_score: float = Field(..., ge=0, le=100)
    peer_rating_score: float = Field(..., ge=0, le=100)
    image_quality_score: float = Field(..., ge=0, le=100)
    final_score: int = Field(..., ge=0, le=100, description="Weighted composite score rounded to integer")
    letter_grade: str = Field(..., description="A (85+), B (70-84), C (50-69), or D (<50)")
    score_breakdown: ScoreBreakdown
    updated_at: Optional[str] = None


class GenerateScoreRequest(BaseModel):
    """Payload to trigger automatic score generation for demo / evaluation."""
    listing_id: str
    farmer_id: Optional[str] = None
    crop_name: Optional[str] = None
    harvest_date: Optional[str] = None  # YYYY-MM-DD
    listing_date: Optional[str] = None  # YYYY-MM-DD
    custom_image_score: Optional[float] = None


class UploadImageResponse(BaseModel):
    """Response returned after processing crop batch photo."""
    listing_id: str
    image_quality_score: float
    defect_detected: bool
    defect_summary: str
    updated_final_score: int
    updated_letter_grade: str
    score_breakdown: ScoreBreakdown
