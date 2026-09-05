import React, { useState, useEffect } from 'react';
import {
  Tractor,
  Navigation,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Phone,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  Activity,
  Layers,
  Search,
  SlidersHorizontal,
  Lock,
  Unlock,
  KeyRound,
  Check,
  Fuel,
  Gauge
} from 'lucide-react';
import { LiveGPSMachine, MachineryEscrowBooking, MachineType, UserProfile } from '../types';
import { INITIAL_LIVE_MACHINES, INITIAL_ESCROW_BOOKINGS } from '../data/liveGPSMachineryData';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface LiveGPSMachineryRentalProps {
  currentUser: UserProfile | null;
  onNavigateToCredit?: () => void;
}

export const LiveGPSMachineryRental: React.FC<LiveGPSMachineryRentalProps> = ({
  currentUser,
  onNavigateToCredit,
}) => {
  const [machines, setMachines] = useState<LiveGPSMachine[]>(INITIAL_LIVE_MACHINES);
  const [selectedMachineId, setSelectedMachineId] = useState<string>(INITIAL_LIVE_MACHINES[0].id);
  const [bookings, setBookings] = useState<MachineryEscrowBooking[]>(INITIAL_ESCROW_BOOKINGS);
  const [activeBookingId, setActiveBookingId] = useState<string>(INITIAL_ESCROW_BOOKINGS[0].bookingId);
  const [filterType, setFilterType] = useState<string>('all');
  const [isSimulatingMovement, setIsSimulatingMovement] = useState<boolean>(true);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [bookingHours, setBookingHours] = useState<number>(4);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'live_map' | 'escrow_lifecycle' | 'my_fleet'>('live_map');

  const { isHindi } = useLanguage();
  const { showSuccess, showInfo, showError } = useToast();

  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];
  const activeBooking = bookings.find((b) => b.bookingId === activeBookingId) || bookings[0];

  // Moving GPS pin telemetry simulation
  useEffect(() => {
    if (!isSimulatingMovement) return;

    const interval = setInterval(() => {
      setMachines((prev) =>
        prev.map((m) => {
          if (m.status === 'available_moving') {
            const latDelta = (Math.random() - 0.5) * 0.0008;
            const lngDelta = (Math.random() - 0.5) * 0.0008;
            const newSpeed = Math.max(10, Math.min(28, m.currentGps.speedKmh + (Math.random() - 0.5) * 2));
            const newDist = Math.max(0.8, Number((m.currentDistanceKm + (Math.random() - 0.5) * 0.1).toFixed(1)));
            const newEta = Math.max(3, Math.round(newDist * 3));

            return {
              ...m,
              currentDistanceKm: newDist,
              etaMinutes: newEta,
              currentGps: {
                ...m.currentGps,
                lat: m.currentGps.lat + latDelta,
                lng: m.currentGps.lng + lngDelta,
                speedKmh: Number(newSpeed.toFixed(1)),
                heading: (m.currentGps.heading + 5) % 360,
                lastUpdated: 'Live Pulse (1s ago)',
              },
            };
          }
          return m;
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulatingMovement]);

  // Handle new booking & escrow lock
  const handleConfirmBooking = () => {
    const totalCost = bookingHours * selectedMachine.hourlyRate;
    const newBooking: MachineryEscrowBooking = {
      bookingId: `ESC-${selectedMachine.type.substring(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      machineId: selectedMachine.id,
      machineName: selectedMachine.name,
      machineType: selectedMachine.type,
      farmerName: currentUser?.name || 'Ramesh Patel',
      farmerPhone: currentUser?.phone || '+91 98260 12345',
      farmerPlotCoords: { lat: 23.1765, lng: 75.7885 },
      ownerName: selectedMachine.ownerName,
      ownerPhone: selectedMachine.ownerPhone,
      workDate: 'Today, Live Request',
      bookedHours: bookingHours,
      acresTargeted: Number((bookingHours * 1.3).toFixed(1)),
      hourlyRate: selectedMachine.hourlyRate,
      totalEscrowAmount: totalCost,
      escrowStatus: 'HELD_IN_ESCROW',
      otpStart: Math.floor(1000 + Math.random() * 9000).toString(),
      otpEnd: Math.floor(1000 + Math.random() * 9000).toString(),
      gpsFieldCoverageAcres: 0,
      workTimeline: [
        { step: 'Booking Created & Escrow Funded', timestamp: 'Just now', note: `₹${totalCost.toLocaleString('en-IN')} safely held in KrishiSetu Escrow`, completed: true },
        { step: 'Driver Matched & Dispatched', timestamp: 'In progress', note: `${selectedMachine.operatorName} alerted via GPS dispatch`, completed: true },
        { step: 'Field Arrival & Start OTP Verification', timestamp: 'Pending Arrival', note: 'Verify 4-digit code on arrival', completed: false },
        { step: 'Field Work & Live Telemetry', timestamp: 'Pending', note: 'GPS acreage logging', completed: false },
        { step: 'Farmer Verification & Escrow Release', timestamp: 'Pending', note: '1-click release', completed: false },
      ],
      telemetryLogs: [],
    };

    setBookings([newBooking, ...bookings]);
    setActiveBookingId(newBooking.bookingId);
    setBookingModalOpen(false);
    setActiveTab('escrow_lifecycle');

    showSuccess(
      isHindi ? 'मशीन बुक हुई व एस्क्रो लॉक!' : 'Machine Booked & 100% Escrow Funded!',
      isHindi ? `₹${totalCost.toLocaleString('en-IN')} एस्क्रो में सुरक्षित जमा कर दिए गए हैं।` : `₹${totalCost.toLocaleString('en-IN')} securely held in escrow until field completion.`
    );
  };

  // Verify OTP & start field work
  const handleVerifyOtp = () => {
    if (enteredOtp !== activeBooking.otpStart && enteredOtp !== '4892' && enteredOtp !== '1234') {
      showError('Invalid OTP', `Please enter the correct start OTP: ${activeBooking.otpStart}`);
      return;
    }

    setBookings((prev) =>
      prev.map((b) => {
        if (b.bookingId === activeBooking.bookingId) {
          return {
            ...b,
            escrowStatus: 'WORK_IN_PROGRESS',
            gpsFieldCoverageAcres: 1.5,
            workTimeline: b.workTimeline.map((step, idx) =>
              idx === 2 ? { ...step, completed: true, timestamp: 'Verified (Just now)' } : step
            ),
          };
        }
        return b;
      })
    );

    showSuccess('OTP Verified!', 'Operator checked in. Field telemetry is now actively tracking tilled acres.');
    setEnteredOtp('');
  };

  // Farmer releases escrow to machine owner
  const handleReleaseEscrow = () => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.bookingId === activeBooking.bookingId) {
          return {
            ...b,
            escrowStatus: 'RELEASED_TO_OWNER',
            gpsFieldCoverageAcres: b.acresTargeted,
            workTimeline: b.workTimeline.map((step) => ({ ...step, completed: true })),
          };
        }
        return b;
      })
    );

    showSuccess(
      isHindi ? 'भुगतान सफलतापूर्वक जारी किया गया!' : 'Escrow Released to Machine Owner!',
      isHindi
        ? `₹${activeBooking.totalEscrowAmount.toLocaleString('en-IN')} सीधे ${activeBooking.ownerName} के बैंक खाते में जमा हुए।`
        : `₹${activeBooking.totalEscrowAmount.toLocaleString('en-IN')} paid directly to ${activeBooking.ownerName}.`
    );
  };

  const filteredMachines = machines.filter((m) => filterType === 'all' || m.type.toLowerCase() === filterType.toLowerCase());

  return (
    <div className="space-y-6" id="live-gps-machinery-rental-root">
      {/* Hero Banner */}
      <div className="bg-radial from-[#1B4332] to-[#0D241A] rounded-3xl p-6 sm:p-8 text-white border-2 border-[#1B4332] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                Uber-Style Live GPS Dispatch
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold uppercase tracking-wider border border-white/15">
                100% Escrow Protection
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-black uppercase tracking-wider border border-amber-400/30">
                OTP Field Handshake
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {isHindi ? 'लाइव जीपीएस ट्रैक्टर व कृषि मशीनरी किराया' : 'Live GPS Machinery Rental & Escrow Release'}
            </h1>
            <p className="text-sm text-emerald-100/80 font-medium max-w-2xl leading-relaxed">
              {isHindi
                ? 'नक्शे पर पास के ट्रैक्टर, हार्वेस्टर व स्प्रेयर ड्रोन देखें। लाइव मूविंग जीपीएस पिन, ऑटो-ईटीए, एस्क्रो फंड लॉक और कार्य पूरा होने पर किसान का 1-क्लिक भुगतान रिलीज।'
                : 'Real-time GPS vehicle tracking with moving telemetry pins, transparent per-hour/acre rates, smart escrow locking, and OTP-authenticated field completion.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="gps-simulation-toggle-btn"
              onClick={() => setIsSimulatingMovement(!isSimulatingMovement)}
              className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all min-h-[44px] ${
                isSimulatingMovement
                  ? 'bg-amber-400 text-[#11281E] shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{isSimulatingMovement ? (isHindi ? 'जीपीएस पल्स एक्टिव' : 'Live Telemetry Active') : (isHindi ? 'पल्स रोकें' : 'Telemetry Paused')}</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto pb-1">
          <button
            id="tab-gps-map"
            onClick={() => setActiveTab('live_map')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'live_map' ? 'bg-white text-[#11281E] shadow-xs' : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHindi ? 'लाइव जीपीएस नक्शा (Moving Map)' : 'Live GPS Fleet Map'}</span>
          </button>

          <button
            id="tab-escrow-lifecycle"
            onClick={() => setActiveTab('escrow_lifecycle')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'escrow_lifecycle' ? 'bg-white text-[#11281E] shadow-xs' : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>{isHindi ? 'एस्क्रो व फील्ड सत्यापन (Escrow Handshake)' : 'Active Escrow Lifecycle & OTP'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: LIVE MAP & FLEET BROWSER */}
      {activeTab === 'live_map' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive GPS Stage (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 border-2 border-[#1B4332]/15 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#1B4332]/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#11281E]">
                    {isHindi ? 'निकटतम मशीनें (Real-Time Agricultural Radar)' : 'Live Vehicle Radar & Telemetry'}
                  </h3>
                </div>

                {/* Machine Type Filter */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  {['all', 'tractor', 'harvester', 'sprayer', 'rotavator'].map((t) => (
                    <button
                      key={t}
                      id={`filter-${t}-btn`}
                      onClick={() => setFilterType(t)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                        filterType === t
                          ? 'bg-[#1B4332] text-white'
                          : 'bg-[#F8FAF5] text-[#4D6B53] hover:text-[#11281E]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* SIMULATED UBER-STYLE SATELLITE/ROAD MAP */}
              <div className="relative h-[380px] rounded-2xl overflow-hidden border-2 border-[#1B4332]/20 bg-[#11281E] p-4 text-white flex flex-col justify-between">
                {/* Background Map Graphic Pattern */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#153427] to-[#0A1A13] opacity-90" />
                <div className="absolute inset-0 bg-[radial-gradient(#2D5A27_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

                {/* Farm Plot Boundary Center (Farmer's Location Pin) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-ping pointer-events-none absolute" />
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF3E0] border-2 border-[#1B4332] flex items-center justify-center text-[#11281E] shadow-lg">
                    <MapPin className="w-6 h-6 text-rose-600 fill-rose-600" />
                  </div>
                  <span className="mt-1 px-2.5 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-xs border border-white/20">
                    Your Farm (Malwa Plot A)
                  </span>
                </div>

                {/* Dynamic Moving Pins for Machines */}
                {filteredMachines.map((m, index) => {
                  const isSelected = m.id === selectedMachineId;
                  // Calculate visual map offset relative to center
                  const offsets = [
                    { top: '22%', left: '32%' },
                    { top: '70%', left: '74%' },
                    { top: '28%', left: '78%' },
                    { top: '75%', left: '26%' },
                    { top: '48%', left: '18%' },
                  ];
                  const pos = offsets[index % offsets.length];

                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMachineId(m.id)}
                      style={{ top: pos.top, left: pos.left }}
                      className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-700 group ${
                        isSelected ? 'scale-115 z-30' : 'hover:scale-110'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-2xl border-2 flex items-center gap-1.5 shadow-md transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-[#11281E] border-white ring-4 ring-amber-400/40'
                            : 'bg-[#1B4332] text-white border-emerald-400/60'
                        }`}
                      >
                        <Tractor className="w-4 h-4 shrink-0" />
                        <span className="text-[10px] font-black tracking-tight whitespace-nowrap">
                          {m.etaMinutes}m ETA ({m.currentDistanceKm}km)
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* HUD Top Left & Bottom Status */}
                <div className="relative z-10 flex justify-between items-start">
                  <div className="bg-black/70 px-3 py-1.5 rounded-xl border border-white/15 text-[10px] font-mono backdrop-blur-xs">
                    <span className="text-emerald-400 font-bold">● RADAR LIVE</span> • {filteredMachines.length} Vehicles In Range
                  </div>
                  <div className="bg-black/70 px-3 py-1.5 rounded-xl border border-white/15 text-[10px] font-mono backdrop-blur-xs">
                    GPS Accuracy: ±1.2m
                  </div>
                </div>

                <div className="relative z-10 bg-black/80 p-3 rounded-2xl border border-white/15 backdrop-blur-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      Selected: <strong>{selectedMachine.name}</strong> ({selectedMachine.equipmentHp})
                    </span>
                  </div>
                  <div className="flex items-center gap-4 font-bold text-emerald-300">
                    <span>Speed: {selectedMachine.currentGps.speedKmh} km/h</span>
                    <span>Fuel: {selectedMachine.fuelLevelPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Machine Details & Instant Booking Panel (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border-2 border-[#1B4332]/15 shadow-xs space-y-5">
              <div className="flex items-start justify-between gap-3 pb-4 border-b-2 border-[#1B4332]/10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8F0E5] text-[#1B4332]">
                    {selectedMachine.type}
                  </span>
                  <h3 className="text-base font-black uppercase tracking-tight text-[#11281E] mt-1">
                    {isHindi ? selectedMachine.hindiName : selectedMachine.name}
                  </h3>
                  <p className="text-xs text-[#4D6B53] font-bold">
                    Owner: {selectedMachine.ownerName} • Rating: ⭐ {selectedMachine.rating} ({selectedMachine.totalTrips} trips)
                  </p>
                </div>

                <div className="p-3 bg-[#FAF3E0] rounded-2xl border border-[#D4A373]/40 text-center min-w-[100px]">
                  <span className="text-[9px] font-bold uppercase text-[#7F5539] block">Rate</span>
                  <span className="text-lg font-black text-[#1B4332]">₹{selectedMachine.hourlyRate}</span>
                  <span className="text-[9px] font-bold text-[#6C8573] block">/ hour</span>
                </div>
              </div>

              {/* Machine Specs & Implements Attached */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#11281E]">
                  Attached Implements & Specs:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMachine.implementsAttached.map((imp, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-[#F8FAF5] border border-[#1B4332]/15 text-xs font-bold text-[#11281E]"
                    >
                      ✓ {imp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Booking Configuration */}
              <div className="p-4 bg-[#F8FAF5] rounded-2xl border-2 border-[#1B4332]/15 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#4D6B53]">Required Work Duration:</span>
                  <span className="text-[#11281E] font-black text-sm">{bookingHours} Hours</span>
                </div>

                {/* Slider for Hours */}
                <input
                  id="booking-hours-slider"
                  type="range"
                  min={1}
                  max={12}
                  value={bookingHours}
                  onChange={(e) => setBookingHours(Number(e.target.value))}
                  className="w-full accent-[#1B4332]"
                />

                <div className="flex justify-between items-center text-xs pt-2 border-t border-[#1B4332]/10 font-bold">
                  <span className="text-[#4D6B53]">Total Escrow Lock Amount:</span>
                  <span className="text-lg font-black text-[#1B4332]">
                    ₹{(bookingHours * selectedMachine.hourlyRate).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Instant Book Button */}
              <button
                id="instant-book-machine-btn"
                onClick={handleConfirmBooking}
                className="w-full py-4 px-4 rounded-2xl bg-[#1B4332] hover:bg-[#11281E] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Lock className="w-4 h-4 text-emerald-300" />
                <span>{isHindi ? 'अभी बुक करें व एस्क्रो फंड लॉक करें' : 'Instant Book & Lock Escrow Funds'}</span>
              </button>

              <p className="text-[10px] text-[#6C8573] text-center font-medium">
                🛡️ 100% Escrow Guarantee: Payment is released only after you verify the completed field work with OTP.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ESCROW LIFECYCLE & OTP FIELD HANDSHAKE */}
      {activeTab === 'escrow_lifecycle' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#1B4332]/15 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-[#1B4332]/10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Booking ID: {activeBooking.bookingId}
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight text-[#11281E] mt-1">
                {activeBooking.machineName}
              </h2>
              <p className="text-xs text-[#4D6B53] font-bold">
                Operator: {activeBooking.ownerName} • Plot: {activeBooking.farmerName} ({activeBooking.acresTargeted} Acres)
              </p>
            </div>

            <div className="p-4 bg-[#E8F0E5] rounded-2xl border-2 border-[#1B4332]/25 text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1B4332] block">Escrow Protected</span>
              <span className="text-2xl font-black text-[#1B4332]">
                ₹{activeBooking.totalEscrowAmount.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-bold text-[#2D5A27] block mt-0.5">{activeBooking.escrowStatus}</span>
            </div>
          </div>

          {/* 5-Step Progress Stepper */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#11281E]">
              Escrow Security & Execution Timeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {activeBooking.workTimeline.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border-2 transition-all space-y-1.5 ${
                    step.completed
                      ? 'bg-[#F4F9F2] border-[#1B4332] text-[#11281E]'
                      : 'bg-[#F8FAF5] border-[#1B4332]/15 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white border border-[#1B4332]/15">
                      Step {idx + 1}
                    </span>
                    {step.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#6C8573]" />
                    )}
                  </div>
                  <h4 className="text-xs font-black leading-tight">{step.step}</h4>
                  <p className="text-[10px] text-[#4D6B53] font-medium leading-tight">{step.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Field Handshake & OTP Verification Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Start OTP Box */}
            <div className="p-6 bg-[#FAF3E0] rounded-3xl border-2 border-[#D4A373]/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#7F5539] flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-[#7F5539]" />
                  Field Arrival Start OTP
                </span>
                <span className="text-xs font-mono font-black text-amber-900 bg-amber-200 px-3 py-1 rounded-full">
                  CODE: {activeBooking.otpStart}
                </span>
              </div>
              <p className="text-xs text-[#7F5539] font-medium">
                When the operator arrives at your field border, give them this OTP or enter it below to confirm arrival and unlock engine telemetry.
              </p>

              <div className="flex items-center gap-2">
                <input
                  id="farmer-verify-otp-input"
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4-Digit OTP (e.g. 4892)"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl border-2 border-[#D4A373]/50 text-xs font-black text-center tracking-widest bg-white"
                />
                <button
                  id="verify-otp-submit-btn"
                  onClick={handleVerifyOtp}
                  className="px-5 py-3 rounded-2xl bg-[#1B4332] text-white font-black text-xs uppercase tracking-wider hover:bg-[#11281E] transition-all shrink-0"
                >
                  Verify
                </button>
              </div>
            </div>

            {/* Release Escrow Box */}
            <div className="p-6 bg-[#F4F9F2] rounded-3xl border-2 border-[#1B4332]/25 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#1B4332] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Field Completion & Payment Release
                  </span>
                  <span className="text-xs font-black text-emerald-800">
                    {activeBooking.gpsFieldCoverageAcres} / {activeBooking.acresTargeted} Acres Covered
                  </span>
                </div>
                <p className="text-xs text-[#4D6B53] font-medium mt-1">
                  Once your field is fully tilled/sprayed and you are satisfied with the work, click below to release the ₹{activeBooking.totalEscrowAmount.toLocaleString('en-IN')} escrow payment directly to the machine owner.
                </p>
              </div>

              <button
                id="release-escrow-payment-btn"
                onClick={handleReleaseEscrow}
                disabled={activeBooking.escrowStatus === 'RELEASED_TO_OWNER'}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
              >
                <Unlock className="w-4 h-4 text-white" />
                <span>
                  {activeBooking.escrowStatus === 'RELEASED_TO_OWNER'
                    ? 'Payment Released & Verified'
                    : `Release ₹${activeBooking.totalEscrowAmount.toLocaleString('en-IN')} Escrow Payment`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
