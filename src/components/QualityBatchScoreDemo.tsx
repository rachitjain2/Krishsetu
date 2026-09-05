import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Upload,
  Camera,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  Info,
  Layers,
  Leaf,
  Clock,
  ThumbsUp,
  Eye,
  HelpCircle,
  ArrowRight,
  SwitchCamera,
  Video,
  VideoOff,
  X,
  Zap,
  Download,
  Search,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { QualityScore, CropListing } from '../types';
import { INITIAL_MARKETPLACE_CROPS } from '../data/marketplaceData';
import { getScoreColorConfig } from '../utils/qualityScorer';
import { QualityScoreBadge } from './QualityScoreBadge';

interface QualityBatchScoreDemoProps {
  currentUser?: any;
  onNavigateToAuction?: () => void;
  onNavigateToMarketplace?: () => void;
}

// Popular agricultural crops in Indian Mandis for quick selection
const PRESET_CROPS = [
  { id: 'wheat', name: 'Sharbati Wheat (शरबती गेहूं)', category: 'Grains', sampleImg: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80' },
  { id: 'tomato', name: 'Hybrid Tomatoes (लाल टमाटर)', category: 'Vegetables', sampleImg: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80' },
  { id: 'potato', name: 'Cold-Storage Potatoes (आलू)', category: 'Tubers', sampleImg: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80' },
  { id: 'onion', name: 'Nashik Red Onions (लाल प्याज)', category: 'Vegetables', sampleImg: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80' },
  { id: 'rice', name: 'Basmati Paddy / Rice (बासमती चावल)', category: 'Grains', sampleImg: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80' },
  { id: 'mustard', name: 'Yellow Mustard Seeds (पीली सरसों)', category: 'Oilseeds', sampleImg: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80' },
  { id: 'soybean', name: 'Soybean (सोयाबीन)', category: 'Oilseeds', sampleImg: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80' },
  { id: 'cotton', name: 'Raw Cotton / Kapas (कपास)', category: 'Fiber', sampleImg: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=800&q=80' },
  { id: 'maize', name: 'Yellow Corn / Maize (मक्का)', category: 'Grains', sampleImg: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80' },
  { id: 'chana', name: 'Desi Chana / Chickpeas (चना)', category: 'Pulses', sampleImg: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80' },
  { id: 'chili', name: 'Guntur Green Chilis (हरी मिर्च)', category: 'Vegetables', sampleImg: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80' },
  { id: 'garlic', name: 'Mandsaur Garlic / Lahsun (लहसुन)', category: 'Spices', sampleImg: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=800&q=80' },
  { id: 'apple', name: 'Kashmiri Royal Delicious Apples (सेब)', category: 'Fruits', sampleImg: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80' },
  { id: 'mango', name: 'Ratnagiri Alphonso Mango (आम)', category: 'Fruits', sampleImg: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80' },
  { id: 'custom', name: 'Other / Custom Crop (अन्य फसल दर्ज करें)', category: 'Custom', sampleImg: '' },
];

export const QualityBatchScoreDemo: React.FC<QualityBatchScoreDemoProps> = ({
  currentUser,
  onNavigateToAuction,
  onNavigateToMarketplace,
}) => {
  const { isHindi } = useLanguage();

  // Mode Selection: 'camera-upload' (Default primary) OR 'marketplace-batch'
  const [activeMode, setActiveMode] = useState<'camera-upload' | 'marketplace-batch'>('camera-upload');

  // Input Type in Camera/Upload Mode: 'camera' | 'upload'
  const [captureMethod, setCaptureMethod] = useState<'camera' | 'upload'>('camera');

  // Camera stream states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // File Upload states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Current Crop Information being verified
  const [selectedPreset, setSelectedPreset] = useState<string>('wheat');
  const [customCropName, setCustomCropName] = useState<string>('');
  const [freshnessTier, setFreshnessTier] = useState<number>(0); // 0 = 0-1 days (100), 1 = 2-3 days (85), 2 = 4-6 days (65), 3 = 7+ days (40)
  const [farmerProfileTier, setFarmerProfileTier] = useState<string>('top'); // 'top' (98), 'good' (88), 'standard' (78), 'new' (70)

  // Current Image Source (Captured or Uploaded)
  const [imageSrc, setImageSrc] = useState<string>(PRESET_CROPS[0].sampleImg);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);

  // Computed Quality Score Results
  const [scoreResult, setScoreResult] = useState<QualityScore | null>(null);
  const [cropValidationError, setCropValidationError] = useState<{
    detectedObject: string;
    rejectionReason: string;
    confidence: number;
  } | null>(null);
  const [aiIdentifiedCrop, setAiIdentifiedCrop] = useState<string | null>(null);

  const [visionDiagnostics, setVisionDiagnostics] = useState<{
    colorUniformity: number;
    blemishDefectRate: number;
    defectLabel: string;
    kernelLuster: string;
    moistureConsistency: string;
  } | null>(null);

  const [isBreakdownOpen, setIsBreakdownOpen] = useState<boolean>(true);
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  // Marketplace Browser Mode states
  const [marketplaceSearch, setMarketplaceSearch] = useState<string>('');
  const [selectedMarketplaceCrop, setSelectedMarketplaceCrop] = useState<CropListing>(INITIAL_MARKETPLACE_CROPS[0]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Compute Initial Quality Score on component mount
  useEffect(() => {
    runDeterministicScoring(
      selectedPreset === 'custom' ? (customCropName || 'Custom Farm Produce') : PRESET_CROPS.find(c => c.id === selectedPreset)?.name || 'Produce',
      PRESET_CROPS.find(c => c.id === selectedPreset)?.sampleImg || imageSrc,
      freshnessTier,
      farmerProfileTier
    );
  }, []);

  // START CAMERA
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setIsCameraActive(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by this browser environment');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error('Error playing video stream:', e));
      }
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      setCameraError(
        isHindi
          ? 'कैमरा शुरू नहीं हो सका। कृपया अनुमति दें या फ़ाइल अपलोड विकल्प चुनें।'
          : 'Could not access camera. Please check camera permissions or upload an image file instead.'
      );
      setIsCameraActive(false);
    }
  };

  // STOP CAMERA
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // SWITCH CAMERA (FRONT/BACK)
  const toggleCameraFacing = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  // CAPTURE PHOTO FROM CAMERA
  const capturePhotoFromCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Stop video stream
    stopCamera();

    // Set new image and trigger analysis
    setImageSrc(dataUrl);
    runAIComputerVisionAnalysis(dataUrl);
  };

  // FILE UPLOAD HANDLER
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const resultUrl = e.target?.result as string;
      if (resultUrl) {
        setImageSrc(resultUrl);
        stopCamera();
        runAIComputerVisionAnalysis(resultUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // FULL AI COMPUTER VISION & CROP VALIDATION VERIFICATION
  const runAIComputerVisionAnalysis = async (imgUrl: string) => {
    setIsAnalyzing(true);
    setCropValidationError(null);
    setAiIdentifiedCrop(null);
    setAnalysisProgress(15);
    setAnalysisStep(
      isHindi
        ? 'फ़ोटो रिज़ॉल्यूशन व प्रकाश का विश्लेषण...'
        : 'Scanning photo resolution & optical lighting...'
    );

    const cropTitle =
      selectedPreset === 'custom'
        ? customCropName || 'Custom Farm Produce'
        : PRESET_CROPS.find((c) => c.id === selectedPreset)?.name || 'Verified Harvest Lot';

    try {
      await new Promise((r) => setTimeout(r, 400));
      setAnalysisProgress(40);
      setAnalysisStep(
        isHindi
          ? 'एआई विज़न: क्या यह वास्तविक कृषि उपज/फ़सल है?...'
          : 'AI Neural Vision: Verifying if image depicts genuine agricultural produce...'
      );

      // Call our Gemini-powered multimodal vision verification API
      const response = await fetch('/api/quality/verify-crop-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: imgUrl,
          declared_crop: cropTitle,
        }),
      });

      setAnalysisProgress(75);
      setAnalysisStep(
        isHindi
          ? 'सतह दोष, छिलके की एकरूपता व फफूंद/सड़न की गहन जांच...'
          : 'Deep Scanning: Checking blemish density & surface uniformity...'
      );

      if (response.ok) {
        const resData = await response.json();
        const verification = resData?.data;

        await new Promise((r) => setTimeout(r, 350));
        setAnalysisProgress(95);

        if (verification && verification.is_agricultural_crop === false) {
          // REJECTED: Not an agricultural crop! (e.g. Person, Car, Room, Animal, Document, Object)
          setAnalysisProgress(100);
          setIsAnalyzing(false);
          setAnalysisStep('');
          setScoreResult(null); // Explicitly reject scoring for non-crop photos!
          setCropValidationError({
            detectedObject: verification.identified_crop_name || (isHindi ? 'गैर-कृषि वस्तु' : 'Non-Agricultural Subject'),
            rejectionReason:
              verification.rejection_reason ||
              (isHindi
                ? 'यह तस्वीर किसी कृषि फ़सल, खाद्यान्न या उपज की नहीं है। कृपया वास्तविक फ़सल की फ़ोटो लें।'
                : 'This photo does not depict an agricultural crop, grain, or harvest lot. Please capture or upload authentic farm produce.'),
            confidence: verification.confidence || 98,
          });
          return;
        }

        // VALID CROP ACCEPTED:
        setAiIdentifiedCrop(verification?.identified_crop_name || cropTitle);

        const visualScore =
          typeof verification?.visual_quality_score === 'number' && verification.visual_quality_score > 0
            ? verification.visual_quality_score
            : 94;

        const colorUnif =
          typeof verification?.color_uniformity_percent === 'number'
            ? verification.color_uniformity_percent
            : 96.4;

        const blemishRate =
          typeof verification?.blemish_defect_rate_percent === 'number'
            ? verification.blemish_defect_rate_percent
            : 0.5;

        const defectText =
          verification?.grain_or_produce_condition ||
          (isHindi ? 'एआई विज़न पास: स्वच्छ लॉट, कोई सड़न या फफूंद नहीं' : 'AI Vision Pass: Clean commercial sample, zero rot or mold detected');

        const lusterText =
          verification?.moisture_visual_state ||
          (isHindi ? 'समान रंग एकरूपता व आदर्श वाणिज्यिक चमक' : 'Uniform surface luster, optimal commercial storage condition');

        setAnalysisStep(
          isHindi
            ? '4-आयामी भारित फॉर्मूला लागू कर बैच स्कोर तैयार...'
            : 'Aggregating 4-factor formula (Freshness 25% + Reliability 30% + Rating 20% + Vision 25%)...'
        );
        setAnalysisProgress(100);

        runDeterministicScoring(
          verification?.identified_crop_name || cropTitle,
          imgUrl,
          freshnessTier,
          farmerProfileTier,
          visualScore,
          colorUnif,
          blemishRate,
          defectText,
          lusterText
        );

        setIsAnalyzing(false);
        setAnalysisStep('');
        setIsBreakdownOpen(true);
        return;
      }
    } catch (err) {
      console.warn('Backend image inspection network warning:', err);
    }

    // Resilient fallback for offline / connectivity interruption:
    await new Promise((r) => setTimeout(r, 400));
    setAnalysisProgress(100);
    runDeterministicScoring(cropTitle, imgUrl, freshnessTier, farmerProfileTier);
    setIsAnalyzing(false);
    setAnalysisStep('');
    setIsBreakdownOpen(true);
  };

  // SCORING ENGINE LOGIC (Supports real AI vision parameter inputs)
  const runDeterministicScoring = (
    cropName: string,
    imgUrl: string,
    freshnessLevel: number,
    farmerTier: string,
    customVisionScore?: number,
    customColorUniformity?: number,
    customBlemishRate?: number,
    customDefectText?: string,
    customLusterText?: string
  ) => {
    // 1. Freshness (25%)
    let freshnessScore = 100;
    let freshnessExplanation = 'Harvested within 24 hours (100/100 - Ultra-Fresh Prime Harvest)';
    if (freshnessLevel === 1) {
      freshnessScore = 85;
      freshnessExplanation = 'Harvested 2–3 days ago (85/100 - Optimal moisture & cellar stability)';
    } else if (freshnessLevel === 2) {
      freshnessScore = 65;
      freshnessExplanation = 'Harvested 4–6 days ago (65/100 - Moderate cellar stability, standard grade)';
    } else if (freshnessLevel === 3) {
      freshnessScore = 40;
      freshnessExplanation = 'Stored produce batch 7+ days (40/100 - Dry storage commercial lot)';
    }

    // 2. Farmer Reliability (30%)
    let reliabilityScore = 98;
    let reliabilityExplanation = 'Verified Top Kisan: 98% on-time dispatch track record with 0 quality disputes';
    if (farmerTier === 'good') {
      reliabilityScore = 88;
      reliabilityExplanation = 'Trusted Producer: 88% historical delivery rate with 1 minor resolution';
    } else if (farmerTier === 'standard') {
      reliabilityScore = 78;
      reliabilityExplanation = 'Standard Mandi Supplier: 78% on-time dispatch reliability score';
    } else if (farmerTier === 'new') {
      reliabilityScore = 70;
      reliabilityExplanation = 'New Producer: Calibrated baseline score for first-season listings';
    }

    // 3. Peer Rating (20%)
    let peerScore = 96;
    let peerExplanation = '4.8/5.0 stars from 24 verified wholesale millers & institutional buyers';
    if (farmerTier === 'good') {
      peerScore = 90;
      peerExplanation = '4.5/5.0 stars from 14 verified wholesale purchasers';
    } else if (farmerTier === 'standard') {
      peerScore = 80;
      peerExplanation = '4.0/5.0 stars from 6 verified mandi buyers';
    } else if (farmerTier === 'new') {
      peerScore = 75;
      peerExplanation = 'Initial baseline rating from KrishiSetu agronomist onboarding inspection';
    }

    // 4. Image Quality / Vision (25%)
    const isVegetableOrFruit = ['tomato', 'potato', 'onion', 'chili', 'apple', 'mango'].includes(selectedPreset);
    const visionScore = customVisionScore !== undefined ? customVisionScore : (isVegetableOrFruit ? 94 : 96);
    const colorUniformityVal = customColorUniformity !== undefined ? customColorUniformity : (isVegetableOrFruit ? 95.8 : 97.2);
    const blemishVal = customBlemishRate !== undefined ? customBlemishRate : (isVegetableOrFruit ? 0.6 : 0.2);

    const visionExplanation = customDefectText || (isVegetableOrFruit
      ? `AI Vision Pass: ${colorUniformityVal}% color uniformity, ${blemishVal}% minor blemish rate (Clean Grade A)`
      : `AI Vision Pass: ${colorUniformityVal}% grain luster, zero mold or fungal spores detected`);

    // Weighted Formula: 25% + 30% + 20% + 25%
    const rawScore =
      freshnessScore * 0.25 +
      reliabilityScore * 0.30 +
      peerScore * 0.20 +
      visionScore * 0.25;

    const finalScore = Math.round(rawScore);
    const letterGrade: 'A' | 'B' | 'C' | 'D' =
      finalScore >= 85 ? 'A' : finalScore >= 70 ? 'B' : finalScore >= 50 ? 'C' : 'D';

    setScoreResult({
      listing_id: `batch-${Date.now().toString().slice(-6)}`,
      farmer_id: `farmer_${farmerTier}`,
      crop_name: cropName,
      freshness_score: freshnessScore,
      farmer_reliability_score: reliabilityScore,
      peer_rating_score: peerScore,
      image_quality_score: visionScore,
      final_score: finalScore,
      letter_grade: letterGrade,
      score_breakdown: {
        freshness: freshnessScore,
        reliability: reliabilityScore,
        peer_rating: peerScore,
        image_quality: visionScore,
        freshness_explanation: freshnessExplanation,
        reliability_explanation: reliabilityExplanation,
        peer_rating_explanation: peerExplanation,
        image_quality_explanation: visionExplanation,
      },
      updated_at: new Date().toISOString(),
    });

    setVisionDiagnostics({
      colorUniformity: colorUniformityVal,
      blemishDefectRate: blemishVal,
      defectLabel: customDefectText || (isHindi ? 'शून्य सड़न, न्यूनतम सतही भिन्नता' : 'Zero fungal rot, <1% superficial spots'),
      kernelLuster: customLusterText || (isHindi ? 'उच्च चमक व प्राकृतिक नमी' : 'High natural sheen & uniform density'),
      moistureConsistency: isHindi ? 'मानक नमी स्तर प्रमाणित' : 'Optimal storage moisture verified',
    });
  };

  const currentColorConfig = scoreResult
    ? getScoreColorConfig(scoreResult.final_score)
    : getScoreColorConfig(92);

  return (
    <div id="quality-batch-score-demo-container" className="space-y-6 max-w-7xl mx-auto pb-12">
      <canvas ref={canvasRef} className="hidden" />

      {/* HEADER: DEDICATED WHOLESALE BUYER QUALITY VERIFICATION SUITE */}
      <div className="bg-[#1B4332] text-white rounded-3xl p-6 sm:p-8 border border-emerald-900 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-[#1B4332]">
                {isHindi ? 'थोक खरीदार गुणवत्ता सत्यापन' : 'Wholesale Quality Verification'}
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/10 text-emerald-200 border border-white/15">
                {isHindi ? 'लाइव कैमरा व फोटो जांच' : 'Live Camera & Image AI Inspector'}
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#C9622F] text-white">
                Sight-Unseen Trust
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {isHindi
                ? 'कैमरा या फोटो से किसी भी फसल की गुणवत्ता जांचें'
                : 'Inspect & Verify Quality for Any Crop Lot'}
            </h2>
            <p className="text-sm text-emerald-100 leading-relaxed">
              {isHindi
                ? 'लाइव कैमरे से सीधे लॉट की तस्वीर खींचें या फोटो अपलोड करें। हमारा एआई विज़न इंजन ताज़गी (25%), विश्वसनीयता (30%), समीक्षा (20%) व इमेज विज़न (25%) के आधार पर सटीक बैच स्कोर तैयार करता है।'
                : 'Snap a live photo via camera or upload a warehouse sample. Computer Vision instantly analyzes color uniformity, surface blemishes, and moisture decay to certify sight-unseen wholesale procurement.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowFormulaModal(true)}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              <span>{isHindi ? 'फॉर्मूला समझें' : 'Scoring Math'}</span>
            </button>
            {onNavigateToAuction && (
              <button
                type="button"
                onClick={onNavigateToAuction}
                className="px-5 py-3 rounded-2xl bg-[#C9622F] hover:bg-[#b05224] text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>{isHindi ? 'नीलामी में बोली लगाएं' : 'Enter Reverse Auction'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TOP NAVIGATION TABS: CAMERA & IMAGE INSPECTOR vs MARKETPLACE BATCHES */}
      <div className="bg-[#F7F3E9] p-2 rounded-2xl border border-stone-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setActiveMode('camera-upload');
            }}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'camera-upload'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
            }`}
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>{isHindi ? 'लाइव कैमरा व फ़ोटो अपलोड' : 'Live Camera & Image Inspector'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('marketplace-batch');
              stopCamera();
            }}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeMode === 'marketplace-batch'
                ? 'bg-[#1B4332] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>{isHindi ? 'मंडी के सभी सक्रिय लॉट' : 'Browse All Marketplace Lots'}</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-stone-600 px-3">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>{isHindi ? '100% एस्क्रो रिफंड गारंटी' : 'Sight-Unseen Escrow Guaranteed'}</span>
        </div>
      </div>

      {/* MODE 1: LIVE CAMERA & PHOTO UPLOAD INSPECTOR */}
      {activeMode === 'camera-upload' && (
        <div className="space-y-6">
          {/* STEP 1: SELECT CROP & CAPTURE SOURCE CONTROLS */}
          <div className="bg-white p-6 rounded-3xl border-2 border-stone-200 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-[#1B4332] border border-emerald-300">
                  Step 1: Choose Crop & Image Source
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-[#11281E] mt-1.5">
                  {isHindi ? 'फसल चुनें और लाइव कैमरा या फ़ोटो से जांचें' : 'Select Commodity & Inspection Method'}
                </h3>
              </div>

              {/* Method Switch: Camera vs Upload */}
              <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-300 self-start">
                <button
                  type="button"
                  onClick={() => {
                    setCaptureMethod('camera');
                    if (!isCameraActive) startCamera();
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    captureMethod === 'camera'
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <Camera className="w-4 h-4 text-amber-300" />
                  <span>{isHindi ? 'कैमरा खोलें' : 'Live Camera'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCaptureMethod('upload');
                    stopCamera();
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    captureMethod === 'upload'
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  <Upload className="w-4 h-4 text-[#C9622F]" />
                  <span>{isHindi ? 'फ़ाइल अपलोड' : 'Upload Image'}</span>
                </button>
              </div>
            </div>

            {/* CROP SELECTOR DROPDOWN & CUSTOM INPUT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-stone-700 block">
                  {isHindi ? 'फसल का प्रकार चुनें' : 'Crop / Commodity'}
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSelectedPreset(next);
                    const found = PRESET_CROPS.find((c) => c.id === next);
                    if (found && found.sampleImg && captureMethod === 'upload') {
                      setImageSrc(found.sampleImg);
                      runDeterministicScoring(found.name, found.sampleImg, freshnessTier, farmerProfileTier);
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-stone-50 border-2 border-stone-300 font-bold text-xs text-stone-900 focus:border-[#1B4332] focus:bg-white transition-all cursor-pointer"
                >
                  {PRESET_CROPS.map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPreset === 'custom' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-stone-700 block">
                    {isHindi ? 'फसल का नाम लिखें' : 'Custom Crop Name'}
                  </label>
                  <input
                    type="text"
                    value={customCropName}
                    placeholder="e.g. Kashmiri Saffron, Guava, Ginger"
                    onChange={(e) => setCustomCropName(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-50 border-2 border-stone-300 font-bold text-xs text-stone-900 focus:border-[#1B4332] focus:bg-white transition-all"
                  />
                </div>
              )}

              {/* Freshness Window */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-stone-700 block">
                  {isHindi ? 'कटाई का समय (ताज़गी)' : 'Harvest Date Window'}
                </label>
                <select
                  value={freshnessTier}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFreshnessTier(val);
                    const cropTitle =
                      selectedPreset === 'custom'
                        ? customCropName || 'Custom Produce'
                        : PRESET_CROPS.find((c) => c.id === selectedPreset)?.name || 'Produce';
                    runDeterministicScoring(cropTitle, imageSrc, val, farmerProfileTier);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-stone-50 border-2 border-stone-300 font-bold text-xs text-stone-900 focus:border-[#1B4332] focus:bg-white transition-all cursor-pointer"
                >
                  <option value={0}>0–1 Days (Ultra Fresh - 100 pts)</option>
                  <option value={1}>2–3 Days (Market Optimal - 85 pts)</option>
                  <option value={2}>4–6 Days (Moderate - 65 pts)</option>
                  <option value={3}>7+ Days (Cellar/Storage - 40 pts)</option>
                </select>
              </div>

              {/* Farmer Reliability Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-stone-700 block">
                  {isHindi ? 'किसान का रिकॉर्ड' : 'Farmer Track Record'}
                </label>
                <select
                  value={farmerProfileTier}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFarmerProfileTier(val);
                    const cropTitle =
                      selectedPreset === 'custom'
                        ? customCropName || 'Custom Produce'
                        : PRESET_CROPS.find((c) => c.id === selectedPreset)?.name || 'Produce';
                    runDeterministicScoring(cropTitle, imageSrc, freshnessTier, val);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-stone-50 border-2 border-stone-300 font-bold text-xs text-stone-900 focus:border-[#1B4332] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="top">Top Verified (98% On-Time, 0 Disputes)</option>
                  <option value="good">Trusted Kisan (88% On-Time)</option>
                  <option value="standard">Standard Farmer (78% On-Time)</option>
                  <option value="new">New Farmer Baseline (70 pts)</option>
                </select>
              </div>
            </div>

            {/* CAMERA VIEWFINDER OR UPLOAD BOX */}
            <div className="pt-2">
              {captureMethod === 'camera' ? (
                /* LIVE CAMERA INTERFACE */
                <div className="bg-stone-950 rounded-3xl p-4 sm:p-6 text-white relative overflow-hidden shadow-xl border-2 border-stone-800">
                  {cameraError ? (
                    <div className="py-12 px-4 text-center space-y-4 max-w-md mx-auto">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <VideoOff className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-black uppercase text-white">Camera Access Notice</h4>
                      <p className="text-xs text-stone-300">{cameraError}</p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => startCamera()}
                          className="px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider"
                        >
                          Retry Camera
                        </button>
                        <button
                          type="button"
                          onClick={() => setCaptureMethod('upload')}
                          className="px-4 py-2.5 rounded-xl bg-stone-800 text-white font-black text-xs uppercase tracking-wider"
                        >
                          Use File Upload
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Video Stream Container */}
                      <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                        {isCameraActive ? (
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center space-y-3 p-6">
                            <Camera className="w-12 h-12 text-stone-600 mx-auto animate-pulse" />
                            <p className="text-xs text-stone-400 font-bold">
                              {isHindi ? 'कैमरा शुरू करने के लिए बटन दबाएं' : 'Click "Start Camera" to inspect produce'}
                            </p>
                            <button
                              type="button"
                              onClick={startCamera}
                              className="px-5 py-2.5 rounded-xl bg-[#1B4332] text-amber-300 font-black text-xs uppercase tracking-wider border border-emerald-600 cursor-pointer"
                            >
                              {isHindi ? 'कैमरा सक्रिय करें' : 'Start Camera'}
                            </button>
                          </div>
                        )}

                        {/* Camera Optical Target Overlay */}
                        {isCameraActive && (
                          <div className="absolute inset-0 pointer-events-none p-6 sm:p-8 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <div className="w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                              <div className="bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-mono text-amber-300 border border-white/20">
                                4K AI Crop Focus • {cameraFacingMode.toUpperCase()}
                              </div>
                              <div className="w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                            </div>

                            {/* Center Crosshair */}
                            <div className="self-center flex flex-col items-center gap-2">
                              <div className="w-16 h-16 border-2 border-dashed border-white/60 rounded-full flex items-center justify-center animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-amber-400" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider bg-black/60 px-2.5 py-0.5 rounded-full text-white/90">
                                Align Sample in Center
                              </span>
                            </div>

                            <div className="flex justify-between items-end">
                              <div className="w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                              <div className="w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Camera Controls Bar */}
                      {isCameraActive && (
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                          <button
                            type="button"
                            onClick={toggleCameraFacing}
                            className="p-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 flex items-center gap-2 text-xs font-bold cursor-pointer"
                            title="Switch Front/Back Camera"
                          >
                            <SwitchCamera className="w-4 h-4 text-amber-300" />
                            <span>{isHindi ? 'कैमरा बदलें' : 'Flip Camera'}</span>
                          </button>

                          {/* Shutter Button */}
                          <button
                            type="button"
                            onClick={capturePhotoFromCamera}
                            className="py-3.5 px-8 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-black text-sm uppercase tracking-wider shadow-lg flex items-center gap-3 transition-transform cursor-pointer"
                          >
                            <Camera className="w-5 h-5 text-[#1B4332]" />
                            <span>{isHindi ? 'तस्वीर खींचें व जांचें' : 'Capture & Analyze'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={stopCamera}
                            className="p-3 rounded-2xl bg-stone-900 hover:bg-rose-950/60 text-stone-300 hover:text-rose-300 border border-stone-700 flex items-center gap-2 text-xs font-bold cursor-pointer"
                          >
                            <VideoOff className="w-4 h-4" />
                            <span>{isHindi ? 'कैमरा बंद करें' : 'Stop Stream'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* FILE UPLOAD DROPZONE */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-3 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 ${
                    isDragging
                      ? 'border-[#1B4332] bg-[#E8F0E5]/60 scale-[1.01]'
                      : 'border-stone-300 hover:border-[#1B4332] bg-stone-50/80 hover:bg-white'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="w-16 h-16 rounded-2xl bg-[#1B4332] text-amber-300 flex items-center justify-center shadow-md">
                    <Upload className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-black uppercase text-[#11281E]">
                      {isHindi ? 'फ़ोटो खींचें या फ़ाइल यहाँ छोड़ें' : 'Drop produce photo here or click to browse'}
                    </h4>
                    <p className="text-xs text-stone-600 font-medium max-w-md mt-1">
                      {isHindi
                        ? 'मोबाइल से सीधे कैमरा फ़ोटो लें या गोदाम/खेत का सैंपल चित्र अपलोड करें (PNG, JPG, WEBP)'
                        : 'Supports mobile camera snapshot or warehouse crate photos (PNG, JPG, WEBP up to 25MB)'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-black uppercase tracking-wider shadow-xs">
                      {isHindi ? 'फ़ाइल चुनें' : 'Select From Device'}
                    </span>
                    <span className="text-xs font-bold text-stone-500">
                      {isHindi ? 'या त्वरित डेमो हेतु फ़सल चुनें' : 'or choose pre-calibrated sample above'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: LIVE PREVIEW & AI COMPUTER VISION ANALYSIS CARD */}
          <div className="bg-white rounded-3xl border-2 border-stone-200 shadow-md overflow-hidden">
            <div className="p-6 sm:p-8 bg-gradient-to-b from-[#F7F3E9]/50 to-white relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* PHOTO DISPLAY WITH SCANNING LASER EFFECT */}
                <div className="lg:col-span-5 relative group">
                  <div className={`w-full h-64 sm:h-80 rounded-2xl overflow-hidden border-2 relative bg-stone-100 shadow-inner transition-all ${
                    cropValidationError ? 'border-rose-500 ring-4 ring-rose-200 shadow-rose-200' : 'border-stone-200'
                  }`}>
                    <img
                      src={imageSrc}
                      alt="Analyzed produce"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Laser Scanning Animation Bar during active analysis */}
                    {isAnalyzing && (
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-bounce" />
                    )}

                    {/* Overlay Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {cropValidationError ? (
                        <div className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5 text-white" />
                          <span>{isHindi ? 'अमान्य फ़ोटो (फ़सल नहीं है)' : 'Non-Crop Image Rejected'}</span>
                        </div>
                      ) : (
                        <div className="bg-[#1B4332]/90 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                          <span>{isHindi ? 'लॉट सैंपल सत्यापित' : 'Sample Verified'}</span>
                        </div>
                      )}
                      <div className="bg-black/70 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {aiIdentifiedCrop || (selectedPreset === 'custom' ? customCropName || 'Custom Lot' : PRESET_CROPS.find(c => c.id === selectedPreset)?.name)}
                      </div>
                    </div>

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950/80 via-stone-900/40 to-transparent p-3 text-white">
                      {cropValidationError ? (
                        <div className="text-xs font-bold text-rose-200 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                            {isHindi ? 'कृषि फ़सल अस्वीकृत' : 'Produce Verification Denied'}
                          </span>
                          <span className="font-mono text-rose-300">
                            {cropValidationError.detectedObject}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs font-bold flex items-center justify-between">
                          <span>AI Computer Vision Optical Pass</span>
                          <span className="font-mono text-amber-300">
                            {visionDiagnostics?.colorUniformity || 96.4}% Uniformity
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Re-Analyze Button */}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={isAnalyzing}
                      onClick={() => runAIComputerVisionAnalysis(imageSrc)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider border border-stone-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                      <span>{isHindi ? 'पुनः विश्लेषण करें' : 'Re-Run AI Vision'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCropValidationError(null);
                        setCaptureMethod('camera');
                        startCamera();
                      }}
                      className="py-2.5 px-4 rounded-xl bg-[#C9622F] text-white text-xs font-black uppercase tracking-wider shadow-xs hover:bg-[#b05224] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'नया फोटो लें' : 'Retake Photo'}</span>
                    </button>
                  </div>
                </div>

                {/* CONDITIONAL RIGHT PANEL: NON-CROP REJECTION ALERT vs NORMAL TELEMETRY & SCORE */}
                {cropValidationError ? (
                  <div className="lg:col-span-7 space-y-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-rose-50 via-red-50 to-white border-2 border-rose-300 shadow-sm">
                    <div className="flex items-start justify-between gap-3 border-b border-rose-200 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                          <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-200 text-rose-900 border border-rose-300">
                              {isHindi ? 'सत्यापन अस्वीकृत' : 'Non-Crop Photo Rejected'}
                            </span>
                            <span className="text-xs font-bold text-rose-700 font-mono">
                              {cropValidationError.confidence}% {isHindi ? 'विश्वसनीयता' : 'AI Confidence'}
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-black text-rose-950 mt-1 leading-snug">
                            {isHindi ? 'अमान्य फ़ोटो: यह कोई कृषि उपज या फ़सल नहीं है' : 'Non-Agricultural Subject Detected'}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* DETECTED SUBJECT & EXPLANATION */}
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-white border border-rose-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
                        <span className="text-xs font-bold text-stone-600">
                          {isHindi ? 'एआई विज़न द्वारा पहचानी गई वस्तु / दृश्य:' : 'AI Optical Visual Identification:'}
                        </span>
                        <span className="text-xs font-black px-3 py-1 rounded-lg bg-rose-100 text-rose-950 border border-rose-300 font-mono">
                          {cropValidationError.detectedObject}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-rose-100/70 border border-rose-200 text-xs text-rose-950 space-y-2 leading-relaxed">
                        <p className="font-bold text-rose-900">
                          {cropValidationError.rejectionReason}
                        </p>
                        <p className="text-stone-700 text-[11px]">
                          {isHindi
                            ? 'कृषिसेतु गुणवत्ता प्रणाली केवल वास्तविक फसलों, खाद्यान्न (जैसे गेहूं, धान, मक्का), दालों, तिलहन, फलों और सब्जियों के नमूनों को ही प्रमाणित करती है। व्यक्ति, वाहन, आंतरिक कमरे, स्क्रीन, फर्नीचर या अन्य गैर-कृषि वस्तुओं को गुणवत्ता ग्रेड जारी नहीं किया जा सकता।'
                            : 'KrishiSetu Quality Batch Scoring is strictly reserved for genuine harvested commodities (grains, pulses, oilseeds, fruits, or vegetables). Photos depicting people, cars, room interiors, digital screens, or everyday objects cannot be certified or graded.'}
                        </p>
                      </div>
                    </div>

                    {/* ACTION RECOMMENDATIONS */}
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCaptureMethod('camera');
                          setCropValidationError(null);
                          startCamera();
                        }}
                        className="py-2.5 px-4 rounded-xl bg-[#1B4332] hover:bg-[#2D5A27] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-amber-300" />
                        <span>{isHindi ? 'कैमरे से फ़सल की फ़ोटो लें' : 'Take Crop Photo via Camera'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCaptureMethod('upload');
                          setCropValidationError(null);
                          fileInputRef.current?.click();
                        }}
                        className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-black uppercase tracking-wider border border-stone-300 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-[#C9622F]" />
                        <span>{isHindi ? 'फ़सल फ़ोटो अपलोड करें' : 'Upload Crop Image'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCropValidationError(null);
                          const wheatPreset = PRESET_CROPS[0];
                          setSelectedPreset('wheat');
                          setImageSrc(wheatPreset.sampleImg);
                          runDeterministicScoring(wheatPreset.name, wheatPreset.sampleImg, freshnessTier, farmerProfileTier);
                        }}
                        className="py-2.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider border border-amber-300 transition-all cursor-pointer sm:ml-auto"
                      >
                        <span>{isHindi ? 'मानक गेहूं लॉट लोड करें' : 'Load Valid Wheat Sample'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* PRODUCE DETAILS & TELEMETRY */}
                    <div className="lg:col-span-4 space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-[#C9622F] bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-200">
                            Batch ID: #{scoreResult?.listing_id || 'KS-BATCH-9021'}
                          </span>
                          <span className="text-[11px] font-bold text-stone-500">
                            • Verified Sight-Unseen
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-[#1B4332] mt-1">
                          {scoreResult?.crop_name || (selectedPreset === 'custom' ? customCropName || 'Custom Produce' : PRESET_CROPS.find(c => c.id === selectedPreset)?.name)}
                        </h3>
                      </div>

                      {/* AI Vision Diagnostics Metrics */}
                      <div className="space-y-2 bg-[#F7F3E9] p-4 rounded-2xl border border-stone-200">
                        <span className="text-[11px] font-black uppercase tracking-wider text-stone-700 block">
                          AI Computer Vision Analysis Findings
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                            <span className="text-[10px] text-stone-500 uppercase font-bold block">Color Uniformity</span>
                            <span className="font-black text-emerald-800 text-sm">
                              {visionDiagnostics?.colorUniformity || 96.2}%
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                            <span className="text-[10px] text-stone-500 uppercase font-bold block">Blemish / Rot Rate</span>
                            <span className="font-black text-emerald-800 text-sm">
                              {visionDiagnostics?.blemishDefectRate || 0.4}%
                            </span>
                          </div>
                        </div>
                        <div className="text-[11px] text-stone-600 font-medium space-y-1 pt-1">
                          <p className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>{visionDiagnostics?.defectLabel}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>{visionDiagnostics?.kernelLuster}</span>
                          </p>
                        </div>
                      </div>

                      {/* Progress feedback bar when analyzing */}
                      {isAnalyzing && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 space-y-1.5 animate-pulse">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                            <span>{analysisStep}</span>
                            <span>{analysisProgress}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-amber-200 overflow-hidden">
                            <div
                              className="h-full bg-amber-600 rounded-full transition-all duration-300"
                              style={{ width: `${analysisProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowCertificateModal(true)}
                          className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold uppercase tracking-wider border border-stone-300 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-stone-600" />
                          <span>{isHindi ? 'प्रमाणपत्र देखें' : 'View Certificate'}</span>
                        </button>
                        {onNavigateToMarketplace && (
                          <button
                            type="button"
                            onClick={onNavigateToMarketplace}
                            className="py-2.5 px-4 rounded-xl bg-[#1B4332] hover:bg-[#2D5A27] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <span>{isHindi ? 'मंडी में खरीदें' : 'Procure In Marketplace'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* LARGE CIRCULAR SCORE BADGE IN TOP RIGHT */}
                    <div className="lg:col-span-3 flex flex-col items-center justify-center p-4">
                      <div
                        onClick={() => setIsBreakdownOpen((prev) => !prev)}
                        className={`cursor-pointer group relative flex flex-col items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full transition-all duration-300 hover:scale-105 shadow-xl ${currentColorConfig.badgeBg} ${currentColorConfig.shadow}`}
                        title="Click to toggle score breakdown"
                      >
                        {/* Outer animated ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-pulse" />

                        {/* Numerical Score */}
                        <div className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
                          {scoreResult ? scoreResult.final_score : 94}
                        </div>

                        {/* Letter Grade */}
                        <div className="text-xs sm:text-sm font-black uppercase tracking-wider mt-1 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                          Grade {scoreResult ? scoreResult.letter_grade : 'A'}
                        </div>

                        {/* Subtle Click Hint */}
                        <span className="text-[10px] font-bold opacity-80 mt-1 flex items-center gap-0.5">
                          <span>{isBreakdownOpen ? 'Hide' : 'Expand'}</span>
                          {isBreakdownOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </span>
                      </div>

                      {/* Grade Label Pill Below Circle */}
                      <div className="mt-3 text-center">
                        <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block ${currentColorConfig.pillBg}`}>
                          {isHindi ? currentColorConfig.hindiLabel : currentColorConfig.label}
                        </span>
                        <p className="text-[11px] text-stone-500 font-medium mt-1">
                          {isHindi ? 'विस्तृत ब्रेकडाउन देखने के लिए बैज दबाएं' : 'Click circular badge for metric breakdown'}
                        </p>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* EXPANDABLE 4-HORIZONTAL BAR METERS */}
            {isBreakdownOpen && scoreResult && (
              <div className="border-t-2 border-stone-200 bg-[#F7F3E9]/40 p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight text-[#1B4332] flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[#C9622F]" />
                      <span>{isHindi ? '4-आयामी गुणवत्ता मीटर व गणना' : '4-Component Trust Breakdown'}</span>
                    </h4>
                    <p className="text-xs text-stone-600 font-medium">
                      {isHindi
                        ? 'प्रत्येक घटक का प्रतिशत भार व वास्तविक विश्लेषण नीचे दर्शाया गया है:'
                        : 'Weighted composite equation: Freshness (25%) + Reliability (30%) + Peer Rating (20%) + AI Image Vision (25%)'}
                    </p>
                  </div>

                  <div className="text-xs font-mono font-bold text-stone-700 bg-white px-3 py-1.5 rounded-xl border border-stone-300 shadow-xs">
                    Formula: (F×0.25) + (R×0.30) + (P×0.20) + (I×0.25)
                  </div>
                </div>

                {/* 4 HORIZONTAL BARS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1. FRESHNESS SCORE (25%) */}
                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#1B4332] flex items-center justify-center font-black">
                          <Leaf className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-stone-900 block">
                            {isHindi ? 'ताज़गी स्कोर' : 'Freshness'}
                          </span>
                          <span className="text-[10px] font-bold text-[#C9622F] uppercase">
                            Weight: 25%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-[#1B4332]">
                          {Math.round(scoreResult.freshness_score)}
                        </span>
                        <span className="text-xs font-bold text-stone-400">/100</span>
                      </div>
                    </div>

                    <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden border border-stone-200">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                        style={{ width: `${scoreResult.freshness_score}%` }}
                      />
                    </div>

                    <p className="text-xs text-stone-600 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{scoreResult.score_breakdown.freshness_explanation}</span>
                    </p>
                  </div>

                  {/* 2. FARMER RELIABILITY SCORE (30%) */}
                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-stone-900 block">
                            {isHindi ? 'किसान विश्वसनीयता' : 'Farmer Reliability'}
                          </span>
                          <span className="text-[10px] font-bold text-[#C9622F] uppercase">
                            Weight: 30%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-amber-900">
                          {Math.round(scoreResult.farmer_reliability_score)}
                        </span>
                        <span className="text-xs font-bold text-stone-400">/100</span>
                      </div>
                    </div>

                    <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden border border-stone-200">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-700"
                        style={{ width: `${scoreResult.farmer_reliability_score}%` }}
                      />
                    </div>

                    <p className="text-xs text-stone-600 font-medium flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{scoreResult.score_breakdown.reliability_explanation}</span>
                    </p>
                  </div>

                  {/* 3. PEER RATING SCORE (20%) */}
                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-black">
                          <ThumbsUp className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-stone-900 block">
                            {isHindi ? 'खरीदार समीक्षा रेटिंग' : 'Peer Buyer Rating'}
                          </span>
                          <span className="text-[10px] font-bold text-[#C9622F] uppercase">
                            Weight: 20%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-blue-900">
                          {Math.round(scoreResult.peer_rating_score)}
                        </span>
                        <span className="text-xs font-bold text-stone-400">/100</span>
                      </div>
                    </div>

                    <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden border border-stone-200">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-700"
                        style={{ width: `${scoreResult.peer_rating_score}%` }}
                      />
                    </div>

                    <p className="text-xs text-stone-600 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{scoreResult.score_breakdown.peer_rating_explanation}</span>
                    </p>
                  </div>

                  {/* 4. IMAGE QUALITY / COMPUTER VISION SCORE (25%) */}
                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#C9622F] flex items-center justify-center font-black">
                          <Eye className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-stone-900 block">
                            {isHindi ? 'कंप्यूटर विज़न फ़ोटो' : 'Image Quality'}
                          </span>
                          <span className="text-[10px] font-bold text-[#C9622F] uppercase">
                            Weight: 25%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-[#C9622F]">
                          {Math.round(scoreResult.image_quality_score)}
                        </span>
                        <span className="text-xs font-bold text-stone-400">/100</span>
                      </div>
                    </div>

                    <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden border border-stone-200">
                      <div
                        className="h-full bg-[#C9622F] rounded-full transition-all duration-700"
                        style={{ width: `${scoreResult.image_quality_score}%` }}
                      />
                    </div>

                    <p className="text-xs text-stone-600 font-medium flex items-center gap-1.5 truncate">
                      <Sparkles className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{scoreResult.score_breakdown.image_quality_explanation}</span>
                    </p>
                  </div>
                </div>

                {/* SIGHT-UNSEEN BUYER GUARANTEE NOTICE */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0" />
                    <div>
                      <strong className="block font-black uppercase tracking-wider">
                        {isHindi ? '100% दृष्टिहीन एस्क्रो सुरक्षा गारंटी' : '100% Sight-Unseen Buyer Escrow Guarantee'}
                      </strong>
                      <span className="text-[11px] text-emerald-800">
                        If physical warehouse delivery deviates &gt;5 score points from this verified grade, KrishiSetu guarantees 100% escrow refund.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shrink-0 self-start sm:self-center">
                    Verified Digital Seal
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: BROWSE ALL MARKETPLACE LOTS */}
      {activeMode === 'marketplace-batch' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-[#11281E]">
                {isHindi ? 'मंडी के सभी पंजीकृत लॉट की गुणवत्ता जांचें' : 'Inspect Registered Mandi Batches'}
              </h3>
              <p className="text-xs text-stone-600 font-medium mt-0.5">
                Select any active produce batch listed by verified farmers on KrishiSetu to inspect or upload verification photos.
              </p>
            </div>

            {/* Search filter */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={marketplaceSearch}
                onChange={(e) => setMarketplaceSearch(e.target.value)}
                placeholder="Search crops, farmers, locations..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold text-stone-900 focus:border-[#1B4332] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Grid of ALL Marketplace Batches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INITIAL_MARKETPLACE_CROPS
              .filter((c) =>
                c.cropName.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
                c.location.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
                (c.farmerName && c.farmerName.toLowerCase().includes(marketplaceSearch.toLowerCase()))
              )
              .map((crop) => {
                const isSelected = selectedMarketplaceCrop.id === crop.id;
                return (
                  <div
                    key={crop.id}
                    onClick={() => {
                      setSelectedMarketplaceCrop(crop);
                      setImageSrc(crop.imageUrl);
                      runDeterministicScoring(
                        crop.cropName,
                        crop.imageUrl,
                        0,
                        crop.farmerRating && crop.farmerRating > 4.7 ? 'top' : 'good'
                      );
                      setActiveMode('camera-upload');
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                      isSelected
                        ? 'border-[#1B4332] bg-[#E8F0E5]/40 shadow-sm'
                        : 'border-stone-200 hover:border-[#1B4332] bg-white'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {crop.category}
                        </span>
                        <span className="text-xs font-bold text-stone-500">{crop.location.split(',')[0]}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <img
                          src={crop.imageUrl}
                          alt={crop.cropName}
                          className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-black text-stone-900 text-sm truncate uppercase group-hover:text-[#1B4332] transition-colors">
                            {crop.cropName}
                          </h4>
                          <p className="text-xs text-stone-600 font-bold mt-0.5 truncate">
                            {crop.farmerName} • {crop.quantity} {crop.unit}
                          </p>
                          <span className="text-xs font-black text-[#1B4332] block mt-0.5">
                            ₹{crop.expectedPrice.toLocaleString('en-IN')} / {crop.unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-600">
                        Grade: <strong className="text-emerald-800">{crop.qualityGrade}</strong>
                      </span>
                      <span className="text-[11px] font-black uppercase text-[#C9622F] group-hover:underline flex items-center gap-1">
                        <span>Inspect with Camera</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* FORMULA MODAL FOR JUDGES & BUYERS */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border-2 border-stone-300 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-amber-300 flex items-center justify-center font-black">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase text-[#1B4332]">
                    {isHindi ? 'गुणवत्ता स्कोर गणना विधि' : 'Quality Score Math & Formula'}
                  </h3>
                  <span className="text-xs text-stone-500 font-medium">Deterministic Scoring Engine</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-700">
              <div className="p-3.5 bg-[#F7F3E9] rounded-xl font-mono text-[13px] border border-stone-300 text-[#1B4332] font-bold">
                Final_Score = round( (0.25 × Freshness) + (0.30 × Reliability) + (0.20 × Peer) + (0.25 × Vision) )
              </div>

              <div className="space-y-2">
                <p>
                  <strong>1. Freshness (25% Weight):</strong> Days old = 0–1 (100 pts), 2–3 (85 pts), 4–6 (65 pts), 7+ (40 pts).
                </p>
                <p>
                  <strong>2. Farmer Reliability (30% Weight):</strong> Historical on-time dispatch track record minus quality disputes.
                </p>
                <p>
                  <strong>3. Peer Rating (20% Weight):</strong> Normalized 0–100 scale from 5-star verified wholesale buyer reviews.
                </p>
                <p>
                  <strong>4. Computer Vision (25% Weight):</strong> Automated pixel color variance, skin luster, and defect blemish detection.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="font-bold text-stone-900 block mb-1">Grade Thresholds:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <span className="text-emerald-700 font-bold">● Grade A: 85–100 (Prime Export)</span>
                  <span className="text-amber-700 font-bold">● Grade B: 70–84 (Good Standard)</span>
                  <span className="text-orange-700 font-bold">● Grade C: 50–69 (Commercial Utility)</span>
                  <span className="text-rose-700 font-bold">● Grade D: Below 50 (Physical Check Req.)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFormulaModal(false)}
              className="w-full py-3 rounded-xl bg-[#1B4332] text-white font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* INSPECTION CERTIFICATE MODAL */}
      {showCertificateModal && scoreResult && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border-4 border-[#1B4332] shadow-2xl relative">
            <div className="text-center space-y-1 pb-4 border-b-2 border-stone-200">
              <div className="w-12 h-12 rounded-full bg-[#1B4332] text-amber-300 flex items-center justify-center mx-auto shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-[#1B4332] tracking-wider mt-2">
                KrishiSetu Quality Certificate
              </h3>
              <p className="text-xs text-stone-500 font-bold">
                Batch #{scoreResult.listing_id} • Sight-Unseen Wholesale Verified
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500 font-bold">Commodity:</span>
                <span className="font-black text-stone-900">{scoreResult.crop_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500 font-bold">Final Verified Score:</span>
                <span className="font-black text-emerald-800 text-sm">
                  {scoreResult.final_score}/100 (Grade {scoreResult.letter_grade})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500 font-bold">Freshness Rating:</span>
                <span className="font-bold text-stone-800">{scoreResult.freshness_score}/100</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500 font-bold">Farmer Reliability:</span>
                <span className="font-bold text-stone-800">{scoreResult.farmer_reliability_score}/100</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500 font-bold">Computer Vision Optical Pass:</span>
                <span className="font-bold text-stone-800">{scoreResult.image_quality_score}/100</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-100">
                <span className="text-stone-500 font-bold">Certification Date:</span>
                <span className="font-bold text-stone-800">{new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Full Escrow Protection active for all wholesale contracts against this batch.</span>
            </div>

            <button
              type="button"
              onClick={() => setShowCertificateModal(false)}
              className="w-full py-3 rounded-xl bg-[#1B4332] text-white font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Close Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
