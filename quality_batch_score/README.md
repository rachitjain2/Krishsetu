# KrishiSetu Quality-Verified Batch Score (Backend)

The **Quality-Verified Batch Score** generates a trust & verification rating (0-100 and Letter Grade A/B/C/D) for agricultural produce lots so bulk buyers, institutional millers, and processors can purchase with confidence without needing in-person physical inspections.

---

## 1. Mathematical Scoring Formula & Weights

The composite final score is a weighted aggregation of four core dimensions:

$$\text{Final Score} = (0.25 \times \text{Freshness}) + (0.30 \times \text{Reliability}) + (0.20 \times \text{Peer Rating}) + (0.25 \times \text{Image Quality})$$

| Component | Weight | Calculation Basis |
| :--- | :---: | :--- |
| **Freshness Score** | **25%** | Days since harvest: 0–1 days = 100, 2–3 days = 85, 4–6 days = 65, 7+ days = 40 |
| **Farmer Reliability** | **30%** | $(\frac{\text{On-Time Deliveries}}{\text{Total Deliveries}} \times 70) + \max(0, 30 - 5 \times \text{Complaints})$. New sellers start at neutral 60. |
| **Peer Rating Score** | **20%** | Normalized average of 5-star feedback from verified wholesale buyers. |
| **Image Quality Score** | **25%** | Computer vision analysis measuring color uniformity, exposure, and defect/blotch ratios. |

---

## 2. Letter Grade System

- **Grade A (85 – 100)**: Prime wholesale grade. Eligible for priority bidding and instant digital escrow settlement.
- **Grade B (70 – 84)**: Good commercial grade. Minor cosmetic deviations, fully compliant for retail mandis.
- **Grade C (50 – 69)**: Fair/processing grade. Suited for pulp, flour milling, or immediate processing.
- **Grade D (Below 50)**: High-risk batch. Requires manual re-grading or dispute resolution.

---

## 3. Directory Layout (One File Per Component)

```
quality_batch_score/
├── __init__.py
├── models.py            # Pydantic data schemas for QualityScore & breakdowns
├── freshness.py         # calculate_freshness_score(harvest_date, listing_date)
├── reliability.py       # calculate_reliability_score(farmer_id)
├── image_analyzer.py    # analyze_crop_image(image_path_or_bytes)
├── scoring.py           # calculate_final_score(freshness, reliability, peer, image)
├── main.py              # FastAPI application & REST endpoints
├── standalone_demo.py   # CLI test & benchmark script
└── requirements.txt     # Python dependencies
```

---

## 4. API Endpoints (FastAPI)

1. **`POST /listings/{listing_id}/upload-image`**
   - Uploads a batch photo (multipart/form-data).
   - Runs `analyze_crop_image()` to check blotches and color consistency.
   - Updates `image_quality_score` and recalculates final grade.

2. **`GET /listings/{listing_id}/quality-score`**
   - Returns full JSON breakdown of all 4 sub-scores, human explanations, and composite grade.

3. **`POST /demo/generate-score`**
   - Instant mock generator for rapid evaluator testing.

---

## 5. How to Run

### Standalone Benchmark (No dependencies needed):
```bash
python3 quality_batch_score/standalone_demo.py
```

### FastAPI Server:
```bash
pip install -r quality_batch_score/requirements.txt
uvicorn quality_batch_score.main:app --reload --port 8000
```
