import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Award,
  ShieldCheck,
  Phone,
  MessageSquare,
  DollarSign,
  ShoppingBag,
  IndianRupee,
  Layers,
  Sparkles,
  CheckCircle2,
  Share2,
  Clock,
  Truck,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Send,
  Building,
  Scale
} from 'lucide-react';
import { CropListing, UserProfile } from '../types';

interface CropDetailsProps {
  crop: CropListing;
  currentUser: UserProfile | null;
  onBack: () => void;
  onMakeOffer: (cropId: string, offeredPrice: number, quantity: number, notes: string) => void;
  onPlaceOrder: (cropId: string, quantity: number, deliveryAddress: string) => void;
}

export const CropDetails: React.FC<CropDetailsProps> = ({
  crop,
  currentUser,
  onBack,
  onMakeOffer,
  onPlaceOrder,
}) => {
  // Modal states
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Make Offer form state
  const [offerPrice, setOfferPrice] = useState<string>(crop.expectedPrice.toString());
  const [offerQuantity, setOfferQuantity] = useState<string>(crop.quantity.toString());
  const [offerNotes, setOfferNotes] = useState(
    `Looking for immediate procurement of ${crop.quantity} ${crop.unit}. Quality inspection upon arrival at farm.`
  );
  const [offerSubmitted, setOfferSubmitted] = useState(false);

  // Place Order form state
  const [orderQuantity, setOrderQuantity] = useState<string>(crop.quantity.toString());
  const [deliveryAddress, setDeliveryAddress] = useState(
    currentUser?.location || 'Central Agro Warehouse, Industrial Area, Sector 4'
  );
  const [transportNeeded, setTransportNeeded] = useState(true);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Contact chat message state
  const [contactMessage, setContactMessage] = useState(
    `Namaste ${crop.farmerName || 'Farmer'}, I am interested in procuring your ${crop.cropName} (Batch ${crop.id}). Is the moisture level certified below 11%?`
  );
  const [messageSent, setMessageSent] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setIsContactModalOpen(false);
      showToast(`Direct message sent to ${crop.farmerName}! You will receive an SMS reply.`);
    }, 1200);
  };

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(offerPrice);
    const qtyNum = parseFloat(offerQuantity);
    if (isNaN(priceNum) || priceNum <= 0 || isNaN(qtyNum) || qtyNum <= 0) return;

    onMakeOffer(crop.id, priceNum, qtyNum, offerNotes);
    setOfferSubmitted(true);
    setTimeout(() => {
      setOfferSubmitted(false);
      setIsOfferModalOpen(false);
      showToast(`Offer of ₹${priceNum.toLocaleString('en-IN')} / ${crop.unit ? crop.unit.replace(/s$/, '') : 'Qtl'} submitted to ${crop.farmerName}!`);
    }, 1200);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseFloat(orderQuantity);
    if (isNaN(qtyNum) || qtyNum <= 0) return;

    onPlaceOrder(crop.id, qtyNum, deliveryAddress);
    setOrderConfirmed(true);
    setTimeout(() => {
      setOrderConfirmed(false);
      setIsOrderModalOpen(false);
      showToast(`Escrow Order confirmed for ${qtyNum} ${crop.unit} of ${crop.cropName}!`);
    }, 1200);
  };

  const totalOfferVal = (parseFloat(offerPrice) || 0) * (parseFloat(offerQuantity) || 0);
  const totalOrderVal = crop.expectedPrice * (parseFloat(orderQuantity) || 0);
  const unitSingular = crop.unit ? crop.unit.replace(/s$/, '') : 'Quintal';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#E8F0E5] border-2 border-[#1B4332] flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#1B4332] shrink-0" />
            <p className="text-xs sm:text-sm font-black text-[#11281E]">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage('')} className="text-[#4D6B53] hover:text-[#11281E] p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-[28px] border-2 border-[#1B4332]/15 shadow-xs">
        <button
          id="btn-back-to-marketplace"
          onClick={onBack}
          className="py-2 px-4 rounded-full bg-[#F8FAF5] hover:bg-[#E8F0E5] text-[#11281E] text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-[#1B4332]/20 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1B4332]" />
          <span>Back to Marketplace (वापस मंडी जाएं)</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-[#E8F0E5] text-[#1B4332] px-3 py-1 rounded-full border border-[#1B4332]/20">
            Batch #{crop.id}
          </span>
          <button
            onClick={() => showToast(`Direct verified link for ${crop.cropName} (#${crop.id}) copied!`)}
            className="p-2 rounded-full text-[#4D6B53] hover:text-[#11281E] hover:bg-[#F8FAF5] border border-[#1B4332]/15 transition-all"
            title="Share Batch Link"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Crop Details Layout (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image, Badges, & Farmer Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Crop Image */}
          <div className="bg-white rounded-[32px] border-2 border-[#1B4332]/20 overflow-hidden shadow-xs">
            <div className="relative h-72 sm:h-80 w-full bg-[#E8F0E5]">
              <img
                src={crop.imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'}
                alt={crop.cropName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* Status and Category Badge */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-xs ${
                    crop.status === 'Sold'
                      ? 'bg-gray-800 text-gray-200 border-gray-600'
                      : crop.status === 'Under Offer'
                      ? 'bg-[#FAF3E0] text-[#8C6228] border-[#E8D5B5]'
                      : 'bg-[#1B4332] text-white border-[#1B4332]'
                  }`}
                >
                  {crop.status === 'Sold' ? 'Sold Out' : crop.status === 'Under Offer' ? '⚡ Negotiation Active' : '● Live on Exchange'}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/90 text-[#11281E] px-3 py-1 rounded-full border border-white/40">
                  {crop.category}
                </span>
              </div>

              {crop.distanceKm !== undefined && (
                <div className="absolute bottom-4 left-4">
                  <span className="text-[11px] font-black uppercase tracking-wider bg-[#11281E]/80 backdrop-blur-xs text-[#E8D5B5] px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E8D5B5]" />
                    <span>~{crop.distanceKm} km from your registered Mandi</span>
                  </span>
                </div>
              )}
            </div>

            {/* Quality Certifications Strip */}
            <div className="p-4 bg-[#F8FAF5] border-t-2 border-[#1B4332]/10 flex items-center justify-between text-xs font-bold text-[#4D6B53]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                <span className="text-[#11281E] font-black">Quality Verified</span>
              </div>
              <span className="text-[11px] text-[#2D5A27] font-black bg-[#E8F0E5] px-2.5 py-0.5 rounded-full border border-[#1B4332]/20">
                {crop.qualityGrade}
              </span>
            </div>
          </div>

          {/* Farmer Information Card */}
          <div className="bg-white p-6 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1B4332]/10">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#1B4332]" />
                <h3 className="font-black uppercase tracking-tight text-base text-[#11281E]">
                  Verified Farmer Details
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F0E5] text-[#1B4332] text-[10px] font-black uppercase tracking-widest border border-[#1B4332]/20">
                <CheckCircle2 className="w-3 h-3 text-[#2D5A27]" />
                <span>Kisan ID Verified</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center font-black text-xl border-2 border-[#1B4332] shadow-xs shrink-0">
                {(crop.farmerName || 'Farmer')[0]}
              </div>
              <div>
                <h4 className="text-lg font-black uppercase tracking-tight text-[#11281E]">
                  {crop.farmerName || 'Ramesh Patel'}
                </h4>
                <p className="text-xs text-[#4D6B53] font-bold">
                  {crop.farmerExperience || '18 Years Progressive Farming'} • {crop.farmSize || '12.5 Acres Holding'}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs font-black text-[#8C6228] bg-[#FAF3E0] px-2 py-0.5 rounded-md border border-[#E8D5B5]">
                    ⭐ {crop.farmerRating || 4.9} / 5.0 Rating (38 Orders)
                  </span>
                </div>
              </div>
            </div>

            {/* Farmer Farm Specs */}
            <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/15 space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-[#4D6B53]">Farm Location / Cluster:</span>
                <span className="text-[#11281E] font-black">{crop.clusterLocation || crop.location}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-[#4D6B53]">Govt Kisan ID:</span>
                <span className="text-[#11281E] font-mono">MP-UJJ-2026-FARM-9941</span>
              </div>
              {crop.certification && (
                <div className="flex justify-between font-bold pt-1 border-t border-[#1B4332]/10">
                  <span className="text-[#4D6B53]">Certification:</span>
                  <span className="text-[#2D5A27] font-black text-right">{crop.certification}</span>
                </div>
              )}
            </div>

            {/* Contact Farmer Button */}
            <button
              id="btn-contact-farmer-top"
              onClick={() => setIsContactModalOpen(true)}
              className="w-full py-3 px-4 rounded-full bg-[#F8FAF5] hover:bg-[#E8F0E5] text-[#11281E] hover:text-[#1B4332] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#1B4332]/25 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#2D5A27]" />
              <span>Contact Farmer ({crop.farmerName || 'Farmer'})</span>
            </button>
          </div>
        </div>

        {/* Right Column: Crop Info, Pricing, Specs & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#1B4332] bg-[#E8F0E5] px-3 py-1 rounded-full border border-[#1B4332]/20">
                  {crop.category}
                </span>
                {crop.variety && (
                  <span className="text-xs font-bold text-[#8C6228] bg-[#FAF3E0] px-3 py-1 rounded-full border border-[#E8D5B5]">
                    Variety: {crop.variety}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#11281E] leading-snug">
                {crop.cropName}
              </h1>
              {crop.hindiName && (
                <p className="text-sm text-[#4D6B53] font-bold mt-1">{crop.hindiName}</p>
              )}
            </div>

            {/* Pricing Box Highlight */}
            <div className="p-6 rounded-[28px] bg-[#F8FAF5] border-2 border-[#1B4332]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#4D6B53] block">
                  Asking Base Price (किसान का भाव)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-[#1B4332]">
                    ₹{crop.expectedPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#4D6B53]">
                    / {unitSingular}
                  </span>
                </div>
                {crop.mandiBenchmarkPrice && (
                  <p className="text-xs text-[#8FA396] font-bold mt-1 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Mandi MSP Benchmark: ₹{crop.mandiBenchmarkPrice.toLocaleString('en-IN')} / Qtl</span>
                  </p>
                )}
              </div>

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-[#1B4332]/10">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#4D6B53] block">
                  Total Available Volume
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#11281E] mt-1">
                  {crop.quantity} {crop.unit || 'Quintals'}
                </div>
                <span className="text-[11px] font-black text-[#2D5A27] block">
                  ≈ Total Value: ₹{(crop.quantity * crop.expectedPrice).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Key Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1B4332]/15">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#2D5A27]" />
                  <span>Location</span>
                </span>
                <p className="text-xs font-black text-[#11281E] mt-1 truncate">
                  {crop.location}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1B4332]/15">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#2D5A27]" />
                  <span>Harvest Date</span>
                </span>
                <p className="text-xs font-black text-[#11281E] mt-1">
                  {crop.harvestDate}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1B4332]/15">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] flex items-center gap-1">
                  <Award className="w-3 h-3 text-[#8C6228]" />
                  <span>Quality Grade</span>
                </span>
                <p className="text-xs font-black text-[#11281E] mt-1 truncate">
                  {crop.qualityGrade}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1B4332]/15">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#2D5A27]" />
                  <span>Moisture Level</span>
                </span>
                <p className="text-xs font-black text-[#11281E] mt-1">
                  {crop.moisturePercent ? `${crop.moisturePercent}% Moisture` : 'Tested < 11%'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1B4332]/15">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#2D5A27]" />
                  <span>Packaging Type</span>
                </span>
                <p className="text-xs font-black text-[#11281E] mt-1">
                  50kg Standard Jute Bags
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1B4332]/15">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#2D5A27]" />
                  <span>Payment Security</span>
                </span>
                <p className="text-xs font-black text-[#2D5A27] mt-1">
                  100% Escrow Protected
                </p>
              </div>
            </div>

            {/* Description Box */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#11281E] flex items-center gap-1.5">
                <span>Crop Description & Farm Harvest Notes</span>
              </h4>
              <p className="text-xs sm:text-sm text-[#4D6B53] font-medium leading-relaxed bg-[#F8FAF5] p-4 rounded-2xl border border-[#1B4332]/15">
                {crop.description ||
                  'Naturally cultivated harvest stored under optimal humidity and moisture controls. Rigorously cleaned and machine sorted to ensure uniform grain size and minimum extraneous matter.'}
              </p>
            </div>

            {/* ACTION BUTTONS (Contact Farmer, Make Offer, Place Order) */}
            <div className="pt-4 border-t-2 border-[#1B4332]/10 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Contact Farmer Button */}
                <button
                  id="btn-contact-farmer"
                  onClick={() => setIsContactModalOpen(true)}
                  className="py-3.5 px-4 rounded-full bg-white hover:bg-[#E8F0E5] text-[#11281E] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#1B4332]/30 shadow-xs transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#2D5A27]" />
                  <span>Contact Farmer</span>
                </button>

                {/* 2. Make Offer Button */}
                <button
                  id="btn-make-offer"
                  onClick={() => setIsOfferModalOpen(true)}
                  className="py-3.5 px-4 rounded-full bg-[#FAF3E0] hover:bg-[#E8D5B5] text-[#8C6228] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#E8D5B5] shadow-xs transition-all cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Make Offer (मोलभाव)</span>
                </button>

                {/* 3. Place Order Button */}
                <button
                  id="btn-place-order"
                  onClick={() => setIsOrderModalOpen(true)}
                  className="py-3.5 px-4 rounded-full bg-[#1B4332] hover:bg-[#2D5A27] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-[#1B4332] shadow-md transition-all cursor-pointer group"
                >
                  <ShoppingBag className="w-4 h-4 text-[#E8D5B5] group-hover:scale-110 transition-transform" />
                  <span>Place Order (खरीदें)</span>
                </button>
              </div>

              {/* Escrow Assurance Sub-strip */}
              <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-[#4D6B53] pt-1 text-center">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                <span>KrishiSetu Escrow Guarantee: Payment is released to farmer only after mandi weighbridge & quality verification.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CONTACT FARMER DIALOG                                            */}
      {/* ========================================================================= */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11281E]/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-[32px] border-2 border-[#1B4332] shadow-2xl p-6 sm:p-8 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#1B4332]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center border border-[#1B4332]/20">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-[#11281E]">
                    Contact {crop.farmerName || 'Farmer'}
                  </h3>
                  <p className="text-xs text-[#4D6B53] font-bold">
                    Direct Kisan Communication • Batch #{crop.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="p-1.5 text-[#4D6B53] hover:text-[#11281E] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Quick Call & Phone Info */}
              <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/15 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
                    Verified Mobile Number
                  </span>
                  <span className="text-sm font-black text-[#11281E]">
                    {crop.farmerPhone || '+91 98260 12345'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    showToast(`Connecting direct call with ${crop.farmerName}...`);
                    setIsContactModalOpen(false);
                  }}
                  className="py-2 px-3.5 bg-[#1B4332] text-white hover:bg-[#2D5A27] rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </button>
              </div>

              {/* Instant Chat Message Form */}
              <form onSubmit={handleSendContact} className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-[#11281E]">
                  Send Direct Inquiry Message
                </label>
                <textarea
                  rows={3}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full p-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                  required
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(false)}
                    className="py-2.5 px-4 rounded-full border border-[#1B4332]/20 text-xs font-black uppercase tracking-wider text-[#4D6B53]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={messageSent}
                    className="py-2.5 px-5 rounded-full bg-[#1B4332] text-white hover:bg-[#2D5A27] text-xs font-black uppercase tracking-wider flex items-center gap-2"
                  >
                    {messageSent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                    <span>{messageSent ? 'Sent!' : 'Send Inquiry'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MAKE OFFER (PRICE & QUANTITY PROPOSAL)                           */}
      {/* ========================================================================= */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11281E]/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-[32px] border-2 border-[#1B4332] shadow-2xl p-6 sm:p-8 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#1B4332]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF3E0] text-[#8C6228] flex items-center justify-center border border-[#E8D5B5]">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-[#11281E]">
                    Make Price Offer (मोलभाव प्रस्ताव)
                  </h3>
                  <p className="text-xs text-[#4D6B53] font-bold">
                    Propose custom terms directly to {crop.farmerName || 'Farmer'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="p-1.5 text-[#4D6B53] hover:text-[#11281E] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOffer} className="mt-4 space-y-4">
              <div className="p-3 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/15 text-xs font-bold text-[#4D6B53] flex justify-between">
                <span>Farmer's Asking Rate:</span>
                <span className="text-[#11281E] font-black">
                  ₹{crop.expectedPrice.toLocaleString('en-IN')} / {unitSingular}
                </span>
              </div>

              {/* Offered Price & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1">
                    Your Offered Price (₹ / {unitSingular}) *
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-[#4D6B53] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      min="1"
                      className="w-full pl-9 pr-3 py-2.5 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1">
                    Quantity Required ({crop.unit}) *
                  </label>
                  <input
                    type="number"
                    value={offerQuantity}
                    onChange={(e) => setOfferQuantity(e.target.value)}
                    min="1"
                    max={crop.quantity}
                    className="w-full p-2.5 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                    required
                  />
                </div>
              </div>

              {/* Total Offer Calculation */}
              <div className="p-3 rounded-2xl bg-[#FAF3E0] border border-[#E8D5B5] flex items-center justify-between text-xs">
                <span className="font-bold text-[#8C6228]">Total Proposal Value:</span>
                <span className="text-base font-black text-[#8C6228]">
                  ₹{totalOfferVal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Proposal Notes */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1">
                  Terms / Special Notes for Farmer
                </label>
                <textarea
                  rows={2}
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="py-2.5 px-4 rounded-full border border-[#1B4332]/20 text-xs font-black uppercase tracking-wider text-[#4D6B53]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={offerSubmitted}
                  className="py-2.5 px-5 rounded-full bg-[#1B4332] text-white hover:bg-[#2D5A27] text-xs font-black uppercase tracking-wider flex items-center gap-2"
                >
                  {offerSubmitted ? <Check className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                  <span>{offerSubmitted ? 'Offer Sent!' : 'Submit Price Offer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PLACE ORDER (DIRECT PROCUREMENT ESCROW CHECKOUT)                 */}
      {/* ========================================================================= */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11281E]/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-[32px] border-2 border-[#1B4332] shadow-2xl p-6 sm:p-8 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#1B4332]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center border border-[#1B4332]">
                  <ShoppingBag className="w-5 h-5 text-[#E8D5B5]" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-[#11281E]">
                    Confirm Escrow Order (ऑर्डर पुष्टि)
                  </h3>
                  <p className="text-xs text-[#4D6B53] font-bold">
                    Batch #{crop.id} • {crop.cropName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1.5 text-[#4D6B53] hover:text-[#11281E] rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="mt-4 space-y-4">
              {/* Order Quantity */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1">
                  Order Quantity ({crop.unit}) *
                </label>
                <input
                  type="number"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  min="1"
                  max={crop.quantity}
                  className="w-full p-2.5 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                  required
                />
                <span className="text-[10px] text-[#4D6B53] font-bold mt-1 block">
                  Available in stock: {crop.quantity} {crop.unit}
                </span>
              </div>

              {/* Delivery Destination */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1">
                  Delivery Destination / Warehouse Address *
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                  required
                />
              </div>

              {/* Transport logistics toggle */}
              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/15 cursor-pointer">
                <input
                  type="checkbox"
                  checked={transportNeeded}
                  onChange={(e) => setTransportNeeded(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1B4332] accent-[#1B4332]"
                />
                <div className="text-xs">
                  <span className="font-black text-[#11281E] block">Request KrishiSetu Verified Transport Pickup</span>
                  <span className="text-[#4D6B53] font-medium text-[11px]">GPS-tracked truck with digital weighbridge integration</span>
                </div>
              </label>

              {/* Total Order Cost Summary */}
              <div className="p-4 rounded-2xl bg-[#E8F0E5] border border-[#1B4332]/20 space-y-1 text-xs">
                <div className="flex justify-between font-bold text-[#4D6B53]">
                  <span>Produce Cost ({orderQuantity} {crop.unit} @ ₹{crop.expectedPrice}):</span>
                  <span className="text-[#11281E] font-black">₹{totalOrderVal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-[#4D6B53]">
                  <span>Mandatory Escrow Fee (0% Promotional):</span>
                  <span className="text-[#2D5A27] font-black">₹0 (FREE)</span>
                </div>
                <div className="flex justify-between font-black text-sm text-[#11281E] pt-2 border-t border-[#1B4332]/15">
                  <span>Total Escrow Authorization:</span>
                  <span className="text-base text-[#1B4332]">₹{totalOrderVal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="py-2.5 px-4 rounded-full border border-[#1B4332]/20 text-xs font-black uppercase tracking-wider text-[#4D6B53]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderConfirmed}
                  className="py-2.5 px-5 rounded-full bg-[#1B4332] text-white hover:bg-[#2D5A27] text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm"
                >
                  {orderConfirmed ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  <span>{orderConfirmed ? 'Order Placed!' : 'Authorize & Place Order'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
