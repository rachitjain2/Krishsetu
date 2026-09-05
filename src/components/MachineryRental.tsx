import React, { useState, useMemo, useEffect } from 'react';
import {
  Tractor,
  Search,
  Filter,
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Plus,
  ChevronRight,
  Phone,
  User,
  SlidersHorizontal,
  X,
  Play,
  CheckCheck,
  AlertCircle,
  HelpCircle,
  Tag
} from 'lucide-react';
import { MachineItem, MachineType, RentalRequest, RentalStatus, UserProfile } from '../types';
import { INITIAL_MACHINERY, INITIAL_RENTAL_REQUESTS } from '../data/machineryData';
import { MachineDetails } from './MachineDetails';
import { RentalRequestModal } from './RentalRequestModal';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import {
  subscribeToMachinery,
  subscribeToRentalRequests,
  createRentalRequestInFirestore,
  updateRentalRequestInFirestore
} from '../lib/firebase';

interface MachineryRentalProps {
  currentUser: UserProfile | null;
}

export const MachineryRental: React.FC<MachineryRentalProps> = ({ currentUser }) => {
  // Main view modes: 'browse' | 'details' | 'my-rentals'
  const [viewMode, setViewMode] = useState<'browse' | 'details' | 'my-rentals'>('browse');
  const [selectedMachine, setSelectedMachine] = useState<MachineItem | null>(null);

  const { isHindi } = useLanguage();
  const { showSuccess, showInfo } = useToast();

  // Machinery dataset & active rentals
  const [machineryList, setMachineryList] = useState<MachineItem[]>(INITIAL_MACHINERY);
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>(INITIAL_RENTAL_REQUESTS);

  // Real-time subscriptions to Firestore
  useEffect(() => {
    const unsubMachinery = subscribeToMachinery((data) => {
      if (data && data.length > 0) {
        setMachineryList(data);
      }
    });

    const unsubRentals = subscribeToRentalRequests((data) => {
      if (data && data.length > 0) {
        setRentalRequests(data);
      }
    });

    return () => {
      unsubMachinery();
      unsubRentals();
    };
  }, []);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingTargetMachine, setBookingTargetMachine] = useState<MachineItem | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [priceFilter, setPriceFilter] = useState<string>('All');

  // Filter rentals tab
  const [rentalStatusFilter, setRentalStatusFilter] = useState<string>('All');

  // Machine types definition
  const machineTypes: { label: string; hindiLabel: string; value: string; count: number }[] = [
    { label: 'All Equipment', hindiLabel: 'सभी उपकरण', value: 'All', count: machineryList.length },
    { label: 'Tractor', hindiLabel: 'ट्रैक्टर', value: 'Tractor', count: machineryList.filter(m => m.type === 'Tractor').length },
    { label: 'Harvester', hindiLabel: 'हार्वेस्टर', value: 'Harvester', count: machineryList.filter(m => m.type === 'Harvester').length },
    { label: 'Seed Drill', hindiLabel: 'सीड ड्रिल (बुआई)', value: 'Seed Drill', count: machineryList.filter(m => m.type === 'Seed Drill').length },
    { label: 'Cultivator', hindiLabel: 'कल्टीवेटर', value: 'Cultivator', count: machineryList.filter(m => m.type === 'Cultivator').length },
    { label: 'Rotavator', hindiLabel: 'रोटावेटर (जुताई)', value: 'Rotavator', count: machineryList.filter(m => m.type === 'Rotavator').length },
    { label: 'Sprayer', hindiLabel: 'स्प्रेयर (दवाई छिड़काव)', value: 'Sprayer', count: machineryList.filter(m => m.type === 'Sprayer').length },
  ];

  // Distinct locations
  const availableLocations = useMemo(() => {
    const locs = Array.from(new Set(machineryList.map(m => m.location.split(' ')[0])));
    return ['All', ...locs];
  }, [machineryList]);

  // Filtered Machinery
  const filteredMachinery = useMemo(() => {
    return machineryList.filter((machine) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = machine.name.toLowerCase().includes(q);
        const matchesHindi = machine.hindiName?.toLowerCase().includes(q);
        const matchesOwner = machine.ownerName.toLowerCase().includes(q);
        const matchesLoc = machine.location.toLowerCase().includes(q);
        const matchesType = machine.type.toLowerCase().includes(q);
        const matchesAttach = machine.attachments.some(a => a.toLowerCase().includes(q));

        if (!matchesName && !matchesHindi && !matchesOwner && !matchesLoc && !matchesType && !matchesAttach) {
          return false;
        }
      }

      // Machine Type
      if (selectedType !== 'All' && machine.type !== selectedType) {
        return false;
      }

      // Location
      if (selectedLocation !== 'All' && !machine.location.startsWith(selectedLocation)) {
        return false;
      }

      // Price filter
      if (priceFilter === 'under-500' && machine.pricePerHour >= 500) {
        return false;
      }
      if (priceFilter === '500-1000' && (machine.pricePerHour < 500 || machine.pricePerHour > 1000)) {
        return false;
      }
      if (priceFilter === 'above-1000' && machine.pricePerHour <= 1000) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (priceFilter === 'low-to-high') return a.pricePerHour - b.pricePerHour;
      if (priceFilter === 'high-to-low') return b.pricePerHour - a.pricePerHour;
      return 0;
    });
  }, [machineryList, searchQuery, selectedType, selectedLocation, priceFilter]);

  // Filtered Rentals
  const filteredRentals = useMemo(() => {
    if (rentalStatusFilter === 'All') return rentalRequests;
    return rentalRequests.filter(r => r.status === rentalStatusFilter);
  }, [rentalRequests, rentalStatusFilter]);

  // Active bookings count
  const activeBookingsCount = rentalRequests.filter(r => r.status !== 'Completed' && r.status !== 'Cancelled').length;

  // Handlers
  const handleOpenDetails = (machine: MachineItem) => {
    setSelectedMachine(machine);
    setViewMode('details');
  };

  const handleOpenRentalModal = (machine: MachineItem) => {
    setBookingTargetMachine(machine);
    setIsBookingModalOpen(true);
  };

  const handleCreateRentalRequest = async (newRequest: RentalRequest) => {
    const withUid = {
      ...newRequest,
      farmerUid: currentUser?.uid || 'demo-farmer-ramesh',
    };
    setRentalRequests([withUid, ...rentalRequests]);
    setIsBookingModalOpen(false);

    try {
      await createRentalRequestInFirestore(withUid, currentUser?.uid);
    } catch (e) {
      console.warn('Create rental request notice:', e);
    }

    showSuccess(
      isHindi ? 'किराया अनुरोध सफलतापूर्वक भेजा गया!' : 'Rental Request Submitted!',
      isHindi 
        ? `${newRequest.ownerName} (${newRequest.machineName}) को अनुरोध प्राप्त हो गया है।`
        : `Request sent to ${newRequest.ownerName}.`
    );
  };

  const handleAdvanceStatus = async (requestId: string, nextStatus: RentalStatus) => {
    const historyItem = {
      status: nextStatus,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: `Status progressed to ${nextStatus}`
    };

    setRentalRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: nextStatus,
          statusHistory: [...req.statusHistory, historyItem]
        };
      }
      return req;
    }));

    const target = rentalRequests.find(r => r.id === requestId);
    if (target) {
      try {
        await updateRentalRequestInFirestore(requestId, {
          status: nextStatus,
          statusHistory: [...target.statusHistory, historyItem]
        });
      } catch (e) {
        console.warn('Update rental status notice:', e);
      }
    }

    showInfo(
      isHindi ? `बुकिंग स्थिति अपडेट: ${nextStatus}` : `Status Updated: ${nextStatus}`,
      isHindi ? 'उपकरण की स्थिति बदल दी गई है।' : 'Machinery rental state updated.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b-2 border-[#1B4332]/10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center shadow-xs border-2 border-[#1B4332]">
                <Tractor className="w-7 h-7 text-[#FAF3E0]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-[#11281E]">
                  {isHindi ? 'कृषि उपकरण व ट्रैक्टर किराया' : 'Farm Machinery Rental'}
                </h1>
                <p className="text-xs text-[#4D6B53] font-bold mt-0.5">
                  {isHindi 
                    ? 'आस-पास के किसानों व एफपीओ से घंटे या दिन के हिसाब से ट्रैक्टर, हार्वेस्टर और जुताई यंत्र किराए पर लें।'
                    : 'On-demand tractors, harvesters, seed drills, and tillage implements from verified local owners.'}
                </p>
              </div>
            </div>
          </div>

          {/* Primary View Switcher Tabs with large touch padding */}
          <div className="flex items-center gap-2 bg-[#F8FAF5] p-1.5 rounded-2xl border-2 border-[#1B4332]/15 self-start lg:self-center">
            <button
              onClick={() => setViewMode('browse')}
              className={`px-4 sm:px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 min-h-[48px] ${
                viewMode === 'browse'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
              }`}
            >
              <Tractor className="w-4 h-4" />
              <span>{isHindi ? `उपकरण सूची (${machineryList.length})` : `Browse Equipment (${machineryList.length})`}</span>
            </button>
            <button
              onClick={() => setViewMode('my-rentals')}
              className={`px-4 sm:px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 min-h-[48px] ${
                viewMode === 'my-rentals'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{isHindi ? 'मेरी बुकिंग' : 'My Bookings'}</span>
              {activeBookingsCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  viewMode === 'my-rentals' ? 'bg-[#FAF3E0] text-[#11281E]' : 'bg-[#1B4332] text-white'
                }`}>
                  {activeBookingsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Highlights Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">
              {isHindi ? 'उपलब्ध मशीनरी' : 'Available Implements'}
            </span>
            <span className="text-xl font-black text-[#11281E] mt-0.5 block">{machineryList.length} Units</span>
            <span className="text-[10px] font-bold text-[#2D5A27]">{isHindi ? '10 किमी के दायरे में' : 'Within 10 km radius'}</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">
              {isHindi ? 'मेरी सक्रिय बुकिंग' : 'My Active Rentals'}
            </span>
            <span className="text-xl font-black text-[#11281E] mt-0.5 block">{activeBookingsCount} Ongoing</span>
            <span className="text-[10px] font-bold text-[#1B4332]">{isHindi ? 'लाइव प्रगति देखें' : 'Track status live'}</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">
              {isHindi ? 'शुरुआती किराया दर' : 'Starting Hourly Rate'}
            </span>
            <span className="text-xl font-black text-[#1B4332] mt-0.5 block">₹350 /hr</span>
            <span className="text-[10px] font-bold text-[#4D6B53]">{isHindi ? 'कल्टीवेटर व रोटावेटर' : 'Cultivator & Rotavators'}</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">
              {isHindi ? 'सुरक्षा व ऑपरेटर' : 'Protection'}
            </span>
            <span className="text-xl font-black text-[#2D5A27] mt-0.5 block">100% {isHindi ? 'सत्यापित' : 'Verified'}</span>
            <span className="text-[10px] font-bold text-[#4D6B53]">{isHindi ? 'अनुभवी ऑपरेटर उपलब्ध' : 'Experienced operators'}</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: MACHINE DETAILS */}
      {viewMode === 'details' && selectedMachine && (
        <MachineDetails
          machine={selectedMachine}
          onBack={() => setViewMode('browse')}
          onRequestRental={(m) => handleOpenRentalModal(m)}
        />
      )}

      {/* VIEW 2: BROWSE ALL MACHINERY */}
      {viewMode === 'browse' && (
        <div className="space-y-6">
          {/* Filters & Search Control Bar */}
          <div className="bg-white p-6 rounded-[28px] border-2 border-[#1B4332]/15 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="sm:col-span-6 relative">
                <Search className="w-5 h-5 text-[#8FA396] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isHindi ? 'मशीन, मॉडल, रोटावेटर या मालिक का नाम खोजें...' : 'Search machine, model, implement, or owner...'}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#1B4332]/25 text-xs sm:text-sm font-bold text-[#11281E] focus:outline-none focus:border-[#1B4332] bg-[#F8FAF5] min-h-[48px]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8FA396] hover:text-[#11281E] p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Location filter */}
              <div className="sm:col-span-3">
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-9 pr-4 py-3.5 rounded-2xl border-2 border-[#1B4332]/25 text-xs sm:text-sm font-bold text-[#11281E] focus:outline-none focus:border-[#1B4332] bg-white cursor-pointer min-h-[48px]"
                  >
                    <option value="All">{isHindi ? 'सभी क्षेत्र (All Locations)' : 'All Locations'}</option>
                    {availableLocations.filter(l => l !== 'All').map((loc) => (
                      <option key={loc} value={loc}>{loc} {isHindi ? 'क्षेत्र' : 'Region'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price / Sort filter */}
              <div className="sm:col-span-3">
                <div className="relative">
                  <SlidersHorizontal className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full pl-9 pr-4 py-3.5 rounded-2xl border-2 border-[#1B4332]/25 text-xs sm:text-sm font-bold text-[#11281E] focus:outline-none focus:border-[#1B4332] bg-white cursor-pointer min-h-[48px]"
                  >
                    <option value="All">{isHindi ? 'सभी किराया दरें' : 'All Hourly Rates'}</option>
                    <option value="under-500">{isHindi ? '₹500/घंटे से कम (किफायती)' : 'Under ₹500/hr'}</option>
                    <option value="500-1000">{isHindi ? '₹500 - ₹1,000/घंटा' : '₹500 - ₹1,000/hr'}</option>
                    <option value="above-1000">{isHindi ? '₹1,000/घंटे से अधिक (हार्वेस्टर)' : 'Above ₹1,000/hr'}</option>
                    <option value="low-to-high">{isHindi ? 'किराया: कम से ज्यादा' : 'Price: Low to High'}</option>
                    <option value="high-to-low">{isHindi ? 'किराया: ज्यादा से कम' : 'Price: High to Low'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Equipment Type Filter Pills with large touch targets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
              {machineTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border min-h-[40px] ${
                    selectedType === type.value
                      ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                      : 'bg-[#F8FAF5] text-[#4D6B53] border-[#1B4332]/20 hover:bg-[#E8F0E5] hover:text-[#11281E]'
                  }`}
                >
                  <span>{isHindi ? type.hindiLabel : type.label}</span>
                  <span className="ml-1.5 opacity-80">({type.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Machinery Grid Cards */}
          {filteredMachinery.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMachinery.map((machine) => (
                <div
                  key={machine.id}
                  className="bg-white rounded-[28px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Machine Image */}
                    <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                      <img
                        src={machine.imageUrl}
                        alt={machine.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-[#11281E] shadow-sm border border-[#1B4332]/15">
                          {machine.type}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          machine.availability === 'Available Now'
                            ? 'bg-emerald-600 text-white'
                            : machine.availability === 'Busy / Booked'
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-700 text-white'
                        }`}>
                          {machine.availability === 'Available Now' ? (isHindi ? 'अभी उपलब्ध' : 'Available') : machine.availability}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 bg-[#11281E]/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 border border-white/20">
                        <Star className="w-3.5 h-3.5 fill-[#FAF3E0] text-[#FAF3E0]" />
                        <span>{machine.rating}</span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-base font-black uppercase tracking-tight text-[#11281E] leading-snug">
                          {machine.name}
                        </h3>
                        {machine.hindiName && (
                          <p className="text-xs text-[#4D6B53] font-bold mt-0.5">{machine.hindiName}</p>
                        )}
                      </div>

                      <div className="space-y-1 text-xs text-[#4D6B53] font-bold">
                        <p className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>{isHindi ? 'मालिक:' : 'Owner:'} <strong className="text-[#11281E]">{machine.ownerName}</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>{machine.location} ({machine.distanceKm} km {isHindi ? 'दूर' : 'away'})</span>
                        </p>
                      </div>

                      {/* Attachments pills */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {machine.attachments.slice(0, 3).map((att, i) => (
                          <span key={i} className="text-[10px] bg-[#E8F0E5] text-[#1B4332] font-bold px-2 py-0.5 rounded-full border border-[#1B4332]/10">
                            {att}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Rate & 1-tap Actions */}
                  <div className="p-5 pt-3 border-t border-[#1B4332]/10 bg-[#F8FAF5] flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#8FA396] block">
                        {isHindi ? 'किराया दर' : 'Rental Rate'}
                      </span>
                      <div className="text-lg font-black text-[#1B4332]">
                        ₹{machine.pricePerHour} <span className="text-xs text-[#4D6B53] font-bold">/{isHindi ? 'घंटा' : 'hr'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDetails(machine)}
                        className="py-2.5 px-3.5 rounded-xl border-2 border-[#1B4332]/25 text-xs font-black text-[#1B4332] hover:bg-[#E8F0E5] transition-all cursor-pointer min-h-[44px]"
                      >
                        {isHindi ? 'विवरण' : 'Details'}
                      </button>
                      <button
                        onClick={() => handleOpenRentalModal(machine)}
                        className="py-2.5 px-4 rounded-xl bg-[#1B4332] hover:bg-[#2D5A27] text-white text-xs font-black uppercase tracking-wider shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5 min-h-[44px] active:scale-98"
                      >
                        <Calendar className="w-4 h-4 text-[#FAF3E0]" />
                        <span>{isHindi ? 'बुक करें' : 'Request'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-[32px] border-2 border-dashed border-[#1B4332]/20 space-y-3">
              <Tractor className="w-12 h-12 text-[#8FA396] mx-auto" />
              <h3 className="text-lg font-black uppercase tracking-tight text-[#11281E]">
                {isHindi ? 'कोई मशीन उपलब्ध नहीं मिली' : 'No Machinery Found'}
              </h3>
              <p className="text-xs text-[#4D6B53] font-bold max-w-md mx-auto">
                {isHindi 
                  ? 'आपके चुने गए फिल्टर के अनुसार कोई उपकरण नहीं मिला। कृपया फिल्टर बदलें।'
                  : 'No equipment matches your current filter combination.'}
              </p>
              <button
                onClick={() => {
                  setSelectedType('All');
                  setSelectedLocation('All');
                  setPriceFilter('All');
                  setSearchQuery('');
                }}
                className="py-3 px-6 rounded-full bg-[#1B4332] text-white text-xs font-black uppercase tracking-wider min-h-[44px]"
              >
                {isHindi ? 'सभी फ़िल्टर साफ़ करें' : 'Clear All Filters'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: MY BOOKINGS */}
      {viewMode === 'my-rentals' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-[28px] border-2 border-[#1B4332]/15 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1B4332]/10">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-[#11281E]">
                  {isHindi ? 'मेरी उपकरण बुकिंग (Equipment Rentals)' : 'My Equipment Rentals'}
                </h3>
                <p className="text-xs text-[#4D6B53] font-bold mt-0.5">
                  {isHindi ? 'मशीन आने का समय, खेत कार्य की स्थिति व भुगतान ट्रैक करें।' : 'Track machine dispatch, field active operations, and completion status.'}
                </p>
              </div>

              {/* Status filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['All', 'Pending', 'Accepted', 'Active', 'Completed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setRentalStatusFilter(st)}
                    className={`px-3.5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer min-h-[38px] ${
                      rentalStatusFilter === st
                        ? 'bg-[#1B4332] text-white shadow-xs'
                        : 'bg-[#F8FAF5] text-[#4D6B53] hover:bg-[#E8F0E5]'
                    }`}
                  >
                    {st === 'All' ? (isHindi ? 'सभी' : 'All') : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Lifecycle Explainer Bar */}
            <div className="mt-4 p-3.5 rounded-2xl bg-[#E8F0E5] border border-[#1B4332]/20 flex flex-wrap items-center justify-between gap-3 text-xs font-black text-[#1B4332]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                <span>{isHindi ? 'बुकिंग चक्र: 1. प्रतीक्षा (Pending) → 2. स्वीकृत (Accepted) → 3. कार्य चालू (Active) → 4. पूर्ण (Completed)' : 'Lifecycle Flow: Pending → Accepted → Active → Completed'}</span>
              </span>
            </div>
          </div>

          {/* Rentals List */}
          {filteredRentals.length > 0 ? (
            <div className="space-y-4">
              {filteredRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="bg-white p-6 rounded-[28px] border-2 border-[#1B4332]/15 shadow-xs hover:border-[#1B4332] transition-all space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1B4332]/10">
                    <div className="flex items-center gap-3">
                      <img
                        src={rental.machineImage}
                        alt={rental.machineName}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-[#1B4332]/15 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#8FA396]">Booking ID: {rental.id}</span>
                          <span className="text-xs text-[#8FA396]">•</span>
                          <span className="text-xs font-bold text-[#4D6B53]">{rental.requestedAt}</span>
                        </div>
                        <h4 className="text-lg font-black uppercase tracking-tight text-[#11281E] mt-0.5">
                          {rental.machineName}
                        </h4>
                        <p className="text-xs text-[#4D6B53] font-bold">
                          {isHindi ? 'मालिक:' : 'Owner:'} <strong className="text-[#11281E]">{rental.ownerName}</strong> ({rental.ownerPhone})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">
                          {isHindi ? `अनुमानित कुल (${rental.durationHours} घंटे)` : `Estimated Total (${rental.durationHours} hrs)`}
                        </span>
                        <span className="text-2xl font-black text-[#1B4332]">₹{rental.estimatedCost.toLocaleString('en-IN')}</span>
                      </div>

                      <span
                        className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-xs ${
                          rental.status === 'Completed'
                            ? 'bg-[#2D5A27] text-white'
                            : rental.status === 'Active'
                            ? 'bg-amber-500 text-white animate-pulse'
                            : rental.status === 'Accepted'
                            ? 'bg-[#1B4332] text-[#FAF3E0]'
                            : 'bg-[#FAF3E0] text-[#8C6228] border border-[#E8D5B5]'
                        }`}
                      >
                        ● {rental.status}
                      </span>
                    </div>
                  </div>

                  {/* Schedule & Location Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-[#4D6B53]">
                    <div className="p-3 rounded-xl bg-[#F8FAF5] border border-[#1B4332]/10">
                      <span className="text-[10px] font-black uppercase text-[#8FA396] block">
                        {isHindi ? 'तय तिथि व समय' : 'Scheduled Date & Time'}
                      </span>
                      <span className="text-[#11281E] font-black">{rental.date} at {rental.startTime}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAF5] border border-[#1B4332]/10">
                      <span className="text-[10px] font-black uppercase text-[#8FA396] block">
                        {isHindi ? 'अवधि व दर' : 'Duration & Rate'}
                      </span>
                      <span className="text-[#11281E] font-black">{rental.durationHours} {isHindi ? 'घंटे' : 'Hours'} @ ₹{rental.pricePerHour}/hr</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAF5] border border-[#1B4332]/10">
                      <span className="text-[10px] font-black uppercase text-[#8FA396] block">
                        {isHindi ? 'खेत का स्थान' : 'Field Work Location'}
                      </span>
                      <span className="text-[#11281E] font-black truncate block">{rental.location}</span>
                    </div>
                  </div>

                  {/* Status Advancement Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#1B4332]/10">
                    <div className="text-xs font-bold text-[#8FA396]">
                      <span>{rental.statusHistory[rental.statusHistory.length - 1]?.note || 'Updated'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {rental.status === 'Pending' && (
                        <button
                          onClick={() => handleAdvanceStatus(rental.id, 'Accepted')}
                          className="py-3 px-5 rounded-2xl bg-[#1B4332] text-white hover:bg-[#2D5A27] text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 min-h-[44px] active:scale-98"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#FAF3E0]" />
                          <span>{isHindi ? 'स्वीकार करें (Accept)' : 'Simulate Owner Accept'}</span>
                        </button>
                      )}
                      {rental.status === 'Accepted' && (
                        <button
                          onClick={() => handleAdvanceStatus(rental.id, 'Active')}
                          className="py-3 px-5 rounded-2xl bg-amber-600 text-white hover:bg-amber-700 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 min-h-[44px] active:scale-98"
                        >
                          <Play className="w-4 h-4" />
                          <span>{isHindi ? 'खेत कार्य शुरू करें (Start)' : 'Start Field Operation'}</span>
                        </button>
                      )}
                      {rental.status === 'Active' && (
                        <button
                          onClick={() => handleAdvanceStatus(rental.id, 'Completed')}
                          className="py-3 px-5 rounded-2xl bg-[#2D5A27] text-white hover:bg-[#1B4332] text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 min-h-[44px] shadow-xs active:scale-98"
                        >
                          <CheckCheck className="w-4 h-4" />
                          <span>{isHindi ? 'कार्य पूर्ण हुआ (Complete)' : 'Mark Work Completed'}</span>
                        </button>
                      )}
                      {rental.status === 'Completed' && (
                        <span className="text-xs font-black text-[#2D5A27] flex items-center gap-1.5 px-4 py-2 bg-[#E8F0E5] rounded-xl border border-[#1B4332]/20">
                          <CheckCheck className="w-4 h-4" />
                          <span>{isHindi ? 'कार्य सफलतापूर्वक संपन्न' : 'Work Finished & Signed Off'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-[32px] border-2 border-dashed border-[#1B4332]/20 space-y-3">
              <Calendar className="w-12 h-12 text-[#8FA396] mx-auto" />
              <h3 className="text-lg font-black uppercase tracking-tight text-[#11281E]">
                {isHindi ? 'इस श्रेणी में कोई बुकिंग नहीं है' : 'No Bookings in this Category'}
              </h3>
              <button
                onClick={() => setViewMode('browse')}
                className="py-3 px-6 rounded-full bg-[#1B4332] text-white text-xs font-black uppercase tracking-wider cursor-pointer min-h-[44px]"
              >
                {isHindi ? 'उपकरण कैटलॉग देखें' : 'Browse Equipment Catalog'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* RENTAL REQUEST MODAL */}
      <RentalRequestModal
        isOpen={isBookingModalOpen}
        machine={bookingTargetMachine}
        currentUser={currentUser}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={handleCreateRentalRequest}
      />
    </div>
  );
};
