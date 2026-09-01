import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Tractor,
  ShieldCheck,
  Calculator,
  Info
} from 'lucide-react';
import { MachineItem, RentalRequest, UserProfile } from '../types';

interface RentalRequestModalProps {
  isOpen: boolean;
  machine: MachineItem | null;
  currentUser: UserProfile | null;
  onClose: () => void;
  onSubmit: (newRental: RentalRequest) => void;
}

export const RentalRequestModal: React.FC<RentalRequestModalProps> = ({
  isOpen,
  machine,
  currentUser,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !machine) return null;

  // Defaults
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState<string>(todayStr);
  const [startTime, setStartTime] = useState<string>('08:00 AM');
  const [durationHours, setDurationHours] = useState<number>(4);
  const [farmerName, setFarmerName] = useState<string>(currentUser?.name || 'Rameshwar Patidar');
  const [farmerPhone, setFarmerPhone] = useState<string>(currentUser?.phone || '+91 98260 12345');
  const [location, setLocation] = useState<string>(
    currentUser?.location ? `Field Plot, ${currentUser.location}` : 'Field Plot #4, Village Tajpur, Ujjain'
  );
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  const estimatedCost = durationHours * machine.pricePerHour;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName.trim() || !farmerPhone.trim() || !location.trim() || !date || durationHours <= 0) {
      setError('Please fill all mandatory fields to submit the rental booking.');
      return;
    }

    const now = new Date();
    const formattedTimestamp = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newRequest: RentalRequest = {
      id: `RENT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      machineId: machine.id,
      machineName: machine.name,
      machineType: machine.type,
      machineImage: machine.imageUrl,
      ownerName: machine.ownerName,
      ownerPhone: machine.ownerPhone,
      farmerName: farmerName.trim(),
      farmerPhone: farmerPhone.trim(),
      farmerLocation: currentUser?.location || 'Ujjain',
      date,
      startTime,
      durationHours,
      pricePerHour: machine.pricePerHour,
      estimatedCost,
      location: location.trim(),
      status: 'Pending',
      requestedAt: formattedTimestamp,
      notes: notes.trim() || undefined,
      statusHistory: [
        {
          status: 'Pending',
          timestamp: formattedTimestamp,
          note: 'Rental request submitted by farmer. Awaiting owner confirmation.',
        },
      ],
    };

    onSubmit(newRequest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#11281E]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-[32px] border-2 border-[#1B4332] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="p-6 bg-[#1B4332] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Tractor className="w-5 h-5 text-[#E8D5B5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E8D5B5] block">Farm Equipment Booking</span>
              <h3 className="text-lg font-black uppercase tracking-tight">Request Machine Rental (किराया अनुरोध)</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-[#E8D5B5] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Machine Summary Banner */}
        <div className="p-4 bg-[#F8FAF5] border-b-2 border-[#1B4332]/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={machine.imageUrl}
              alt={machine.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-xl object-cover border border-[#1B4332]/20"
            />
            <div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E8F0E5] text-[#1B4332]">
                {machine.type}
              </span>
              <h4 className="text-sm font-black text-[#11281E] mt-0.5 truncate max-w-xs">{machine.name}</h4>
              <p className="text-[11px] text-[#4D6B53] font-bold">Owner: {machine.ownerName} • {machine.location}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-[#8FA396] block">Base Rate</span>
            <span className="text-lg font-black text-[#1B4332]">₹{machine.pricePerHour}/hr</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Farmer Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#11281E] flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#1B4332]" />
              <span>1. Farmer Contact Details (किसान संपर्क विवरण)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-[#4D6B53] block mb-1">
                  Farmer Name *
                </label>
                <input
                  type="text"
                  required
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full p-2.5 rounded-xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] focus:outline-none focus:border-[#1B4332]"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-[#4D6B53] block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={farmerPhone}
                  onChange={(e) => setFarmerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 rounded-xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] focus:outline-none focus:border-[#1B4332]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Schedule & Duration */}
          <div className="space-y-3 pt-3 border-t border-[#1B4332]/10">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#11281E] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#1B4332]" />
              <span>2. Schedule & Duration (दिनांक एवं समय)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-[#4D6B53] block mb-1">
                  Rental Date *
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] focus:outline-none focus:border-[#1B4332]"
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-[#4D6B53] block mb-1">
                  Start Time *
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] focus:outline-none focus:border-[#1B4332]"
                >
                  <option value="06:00 AM">06:00 AM (Early Morning)</option>
                  <option value="07:00 AM">07:00 AM</option>
                  <option value="08:00 AM">08:00 AM (Standard Morning)</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM (Afternoon)</option>
                  <option value="04:00 PM">04:00 PM (Evening)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-[#4D6B53] block mb-1">
                  Duration (Hours) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={24}
                    required
                    value={durationHours}
                    onChange={(e) => setDurationHours(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2.5 rounded-xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] focus:outline-none focus:border-[#1B4332]"
                  />
                  <span className="text-xs font-bold text-[#4D6B53] shrink-0">hrs</span>
                </div>
              </div>
            </div>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] self-center">Presets:</span>
              {[2, 4, 6, 8].map((hrs) => (
                <button
                  type="button"
                  key={hrs}
                  onClick={() => setDurationHours(hrs)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    durationHours === hrs
                      ? 'bg-[#1B4332] text-white'
                      : 'bg-[#E8F0E5] text-[#1B4332] hover:bg-[#1B4332]/20'
                  }`}
                >
                  {hrs} {hrs === 8 ? 'hrs (Full Day)' : 'hrs'}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Farm Work Location */}
          <div className="space-y-3 pt-3 border-t border-[#1B4332]/10">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#11281E] flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#1B4332]" />
              <span>3. Field Location & Notes (खेत का पता एवं विवरण)</span>
            </h4>
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-[#4D6B53] block mb-1">
                Farm / Field Address *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Plot No. 8, Tajpur Road near Primary School"
                className="w-full p-2.5 rounded-xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] focus:outline-none focus:border-[#1B4332]"
              />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-[#4D6B53] block mb-1">
                Field Conditions / Specific Instructions (वैकल्पिक)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. 4 acres deep plowing needed; tractor path available via northern canal bund."
                className="w-full p-2.5 rounded-xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] focus:outline-none focus:border-[#1B4332]"
              />
            </div>
          </div>

          {/* Section 4: Cost Breakdown Summary */}
          <div className="p-4 rounded-2xl bg-[#FAF3E0] border-2 border-[#E8D5B5] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#5C4520]">
              <span>Rate Breakdown ({durationHours} hours × ₹{machine.pricePerHour}/hr)</span>
              <span>₹{(durationHours * machine.pricePerHour).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-[#5C4520]">
              <span>Operator & Equipment Verification Fee</span>
              <span className="text-[#2D5A27] font-black">FREE (KrishiSetu Subsidized)</span>
            </div>
            <div className="pt-2 border-t border-[#E8D5B5] flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#11281E]">Estimated Total Cost:</span>
              <span className="text-2xl font-black text-[#1B4332]">₹{estimatedCost.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="flex items-start gap-2 text-[11px] text-[#4D6B53] font-bold">
            <Info className="w-4 h-4 text-[#1B4332] shrink-0 mt-0.5" />
            <span>
              Once submitted, your request will be marked <strong>Pending</strong>. The machine owner will confirm the schedule within 30 minutes. Payment is settled directly upon job completion.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#1B4332]/10">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl border-2 border-[#1B4332]/20 text-xs font-black uppercase tracking-wider text-[#4D6B53] hover:bg-[#E8F0E5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-[#1B4332] hover:bg-[#2D5A27] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#E8D5B5]" />
              <span>Confirm & Submit Request (अनुरोध भेजें)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
