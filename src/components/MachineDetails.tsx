import React from 'react';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Phone,
  User,
  Zap,
  Wrench,
  FileText,
  Calendar,
  AlertCircle,
  Tractor,
  Layers,
  Sparkles
} from 'lucide-react';
import { MachineItem } from '../types';

interface MachineDetailsProps {
  machine: MachineItem;
  onBack: () => void;
  onRequestRental: (machine: MachineItem) => void;
}

export const MachineDetails: React.FC<MachineDetailsProps> = ({
  machine,
  onBack,
  onRequestRental,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#1B4332] border-2 border-[#1B4332]/20 hover:border-[#1B4332] hover:bg-[#E8F0E5] rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Machinery (वापस सूची पर जाएं)</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#E8F0E5] text-[#1B4332] rounded-full text-xs font-black uppercase tracking-wider border border-[#1B4332]/20">
          <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
          <span>KrishiSetu Verified Implement</span>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs overflow-hidden">
        {/* Top Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 border-b-2 border-[#1B4332]/10">
          {/* Machine Photo */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#1B4332]/15 aspect-4/3 bg-[#F8FAF5] group">
              <img
                src={machine.imageUrl}
                alt={machine.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className="px-3 py-1 rounded-full bg-[#1B4332] text-[#E8D5B5] text-[10px] font-black uppercase tracking-wider shadow-sm">
                  {machine.type}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                    machine.availability === 'Available Now'
                      ? 'bg-[#2D5A27] text-white'
                      : machine.availability === 'Available Tomorrow'
                      ? 'bg-[#FAF3E0] text-[#8C6228] border border-[#E8D5B5]'
                      : 'bg-stone-800 text-stone-200'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {machine.availability}
                </span>
              </div>
            </div>

            {/* Quick Metrics Bar below photo */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="p-2.5 rounded-xl bg-[#F8FAF5] border border-[#1B4332]/10">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#8FA396] block">Distance</span>
                <span className="text-xs font-black text-[#11281E]">{machine.distanceKm} km away</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAF5] border border-[#1B4332]/10">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#8FA396] block">Bookings</span>
                <span className="text-xs font-black text-[#11281E]">{machine.totalBookings}+ Completed</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8FAF5] border border-[#1B4332]/10">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#8FA396] block">Rating</span>
                <span className="text-xs font-black text-[#11281E] flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {machine.rating} ({machine.reviewsCount})
                </span>
              </div>
            </div>
          </div>

          {/* Machine Header & Highlights */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#4D6B53]">
                <MapPin className="w-4 h-4 text-[#1B4332]" />
                <span>{machine.location}</span>
                <span>•</span>
                <span className="text-[#2D5A27] font-black">Verified Hub</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#11281E] mt-2">
                {machine.name}
              </h1>
              {machine.hindiName && (
                <p className="text-sm font-bold text-[#4D6B53] mt-0.5">{machine.hindiName}</p>
              )}

              <p className="text-xs sm:text-sm text-[#3E5C46] font-medium mt-3 leading-relaxed">
                {machine.description}
              </p>

              {/* Owner card info */}
              <div className="mt-5 p-4 rounded-2xl bg-[#F8FAF5] border-2 border-[#1B4332]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-black text-sm">
                    {machine.ownerName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">Equipment Owner</span>
                    <h4 className="text-sm font-black text-[#11281E] flex items-center gap-1.5">
                      {machine.ownerName}
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27]" />
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${machine.ownerPhone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#1B4332]/20 text-xs font-black text-[#1B4332] hover:bg-[#E8F0E5]"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{machine.ownerPhone}</span>
                  </a>
                  <div className="px-2.5 py-1.5 bg-[#FAF3E0] rounded-xl text-xs font-black text-[#8C6228] border border-[#E8D5B5] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{machine.ownerRating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & CTA Panel */}
            <div className="mt-6 pt-5 border-t-2 border-[#1B4332]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">Hourly Rental Rate (प्रति घंटा किराया)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-[#1B4332]">₹{machine.pricePerHour}</span>
                  <span className="text-xs font-bold text-[#4D6B53]">/{machine.rateUnit || 'hour'}</span>
                </div>
                <p className="text-[11px] font-bold text-[#2D5A27] mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{machine.specs.includedOperator ? 'Includes Certified Operator' : 'Self-Drive / Tractor Mount'}</span>
                </p>
              </div>

              <button
                onClick={() => onRequestRental(machine)}
                className="py-4 px-8 bg-[#1B4332] hover:bg-[#2D5A27] text-white rounded-2xl text-sm font-black uppercase tracking-wider cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[#E8D5B5]" />
                <span>Request Rental (किराया अनुरोध भेजें)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Specifications & Implements Grid */}
        <div className="p-6 sm:p-8 space-y-8 bg-[#FAFBF8]">
          {/* Technical Specs */}
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-[#1B4332]/10">
              <Wrench className="w-5 h-5 text-[#1B4332]" />
              <h3 className="text-lg font-black uppercase tracking-tight text-[#11281E]">
                Machine Specifications (तकनीकी विनिर्देश)
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 mt-4">
              {machine.specs.hp && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#1B4332]/15">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">Engine Power</span>
                  <span className="text-sm font-black text-[#11281E]">{machine.specs.hp}</span>
                </div>
              )}
              {machine.specs.workingWidth && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#1B4332]/15">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">Working Width</span>
                  <span className="text-sm font-black text-[#11281E]">{machine.specs.workingWidth}</span>
                </div>
              )}
              {machine.specs.capacity && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#1B4332]/15">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">Capacity / Hopper</span>
                  <span className="text-sm font-black text-[#11281E]">{machine.specs.capacity}</span>
                </div>
              )}
              {machine.specs.driveType && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#1B4332]/15">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">Drive / Transmission</span>
                  <span className="text-sm font-black text-[#11281E]">{machine.specs.driveType}</span>
                </div>
              )}
              {machine.specs.fuelType && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#1B4332]/15">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">Fuel Type</span>
                  <span className="text-sm font-black text-[#11281E]">{machine.specs.fuelType}</span>
                </div>
              )}
              {machine.specs.year && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#1B4332]/15">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">Model Year</span>
                  <span className="text-sm font-black text-[#11281E]">{machine.specs.year}</span>
                </div>
              )}
              <div className="p-3.5 rounded-2xl bg-white border border-[#1B4332]/15">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">Operator Support</span>
                <span className="text-sm font-black text-[#2D5A27]">
                  {machine.specs.includedOperator ? 'Driver Included' : 'Self-Operated'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-[#1B4332]/15">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">Fuel Policy</span>
                <span className="text-sm font-black text-[#11281E]">
                  {machine.specs.fuelIncluded ? 'Fuel Included' : 'Fuel by Farmer'}
                </span>
              </div>
            </div>
          </div>

          {/* Compatible Implements & Attachments */}
          {machine.attachments && machine.attachments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-[#1B4332]/10">
                <Layers className="w-5 h-5 text-[#1B4332]" />
                <h3 className="text-lg font-black uppercase tracking-tight text-[#11281E]">
                  Available Implements & Attachments (संलग्न उपकरण)
                </h3>
              </div>
              <div className="flex flex-wrap gap-2.5 mt-4">
                {machine.attachments.map((att, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#11281E] border border-[#1B4332]/20 text-xs font-black shadow-xs"
                  >
                    <Tractor className="w-3.5 h-3.5 text-[#1B4332]" />
                    <span>{att}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Advantages & Features */}
          {machine.features && machine.features.length > 0 && (
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-[#1B4332]/10">
                <Sparkles className="w-5 h-5 text-[#1B4332]" />
                <h3 className="text-lg font-black uppercase tracking-tight text-[#11281E]">
                  Key Machine Features (मुख्य विशेषताएं)
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {machine.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white border border-[#1B4332]/15">
                    <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-[#11281E] leading-relaxed">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          {machine.termsAndConditions && machine.termsAndConditions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-[#1B4332]/10">
                <FileText className="w-5 h-5 text-[#1B4332]" />
                <h3 className="text-lg font-black uppercase tracking-tight text-[#11281E]">
                  Rental Guidelines & Terms (किराया नियम व शर्तें)
                </h3>
              </div>
              <div className="space-y-2 mt-4">
                {machine.termsAndConditions.map((term, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-bold text-[#4D6B53]">
                    <span className="w-5 h-5 rounded-full bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center shrink-0 text-[10px] font-black">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{term}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
