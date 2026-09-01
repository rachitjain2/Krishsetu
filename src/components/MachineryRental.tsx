import React, { useState, useMemo } from 'react';
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
  HelpCircle
} from 'lucide-react';
import { MachineItem, MachineType, RentalRequest, RentalStatus, UserProfile } from '../types';
import { INITIAL_MACHINERY, INITIAL_RENTAL_REQUESTS } from '../data/machineryData';
import { MachineDetails } from './MachineDetails';
import { RentalRequestModal } from './RentalRequestModal';

interface MachineryRentalProps {
  currentUser: UserProfile | null;
}

export const MachineryRental: React.FC<MachineryRentalProps> = ({ currentUser }) => {
  // Main view modes: 'browse' | 'details' | 'my-rentals'
  const [viewMode, setViewMode] = useState<'browse' | 'details' | 'my-rentals'>('browse');
  const [selectedMachine, setSelectedMachine] = useState<MachineItem | null>(null);

  // Machinery dataset & active rentals
  const [machineryList] = useState<MachineItem[]>(INITIAL_MACHINERY);
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>(INITIAL_RENTAL_REQUESTS);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [bookingTargetMachine, setBookingTargetMachine] = useState<MachineItem | null>(null);
  const [successToast, setSuccessToast] = useState<string>('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [priceFilter, setPriceFilter] = useState<string>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('All');

  // Filter rentals tab
  const [rentalStatusFilter, setRentalStatusFilter] = useState<string>('All');

  // Machine types definition
  const machineTypes: { label: string; value: string; count: number }[] = [
    { label: 'All Equipment', value: 'All', count: machineryList.length },
    { label: 'Tractor (ट्रैक्टर)', value: 'Tractor', count: machineryList.filter(m => m.type === 'Tractor').length },
    { label: 'Harvester (हार्वेस्टर)', value: 'Harvester', count: machineryList.filter(m => m.type === 'Harvester').length },
    { label: 'Seed Drill (सीड ड्रिल)', value: 'Seed Drill', count: machineryList.filter(m => m.type === 'Seed Drill').length },
    { label: 'Cultivator (कल्टीवेटर)', value: 'Cultivator', count: machineryList.filter(m => m.type === 'Cultivator').length },
    { label: 'Rotavator (रोटावेटर)', value: 'Rotavator', count: machineryList.filter(m => m.type === 'Rotavator').length },
    { label: 'Sprayer (स्प्रेयर)', value: 'Sprayer', count: machineryList.filter(m => m.type === 'Sprayer').length },
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
      if (priceFilter === 'under-500' && machine.pricePerHour >= 500) return false;
      if (priceFilter === '500-1000' && (machine.pricePerHour < 500 || machine.pricePerHour > 1000)) return false;
      if (priceFilter === 'above-1000' && machine.pricePerHour <= 1000) return false;

      // Availability filter
      if (availabilityFilter !== 'All' && machine.availability !== availabilityFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (priceFilter === 'low-to-high') return a.pricePerHour - b.pricePerHour;
      if (priceFilter === 'high-to-low') return b.pricePerHour - a.pricePerHour;
      return a.distanceKm - b.distanceKm; // Default: nearest first
    });
  }, [machineryList, searchQuery, selectedType, selectedLocation, priceFilter, availabilityFilter]);

  // Filtered rentals
  const filteredRentals = useMemo(() => {
    if (rentalStatusFilter === 'All') return rentalRequests;
    return rentalRequests.filter(r => r.status === rentalStatusFilter);
  }, [rentalRequests, rentalStatusFilter]);

  // Handlers
  const handleOpenDetails = (machine: MachineItem) => {
    setSelectedMachine(machine);
    setViewMode('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRentalModal = (machine: MachineItem) => {
    setBookingTargetMachine(machine);
    setIsBookingModalOpen(true);
  };

  const handleCreateRentalRequest = (newRental: RentalRequest) => {
    setRentalRequests([newRental, ...rentalRequests]);
    setSuccessToast(`Rental request for ${newRental.machineName} has been submitted (Status: Pending).`);
    setTimeout(() => setSuccessToast(''), 6000);
    setViewMode('my-rentals');
  };

  // Demo status advancement: Pending -> Accepted -> Active -> Completed
  const handleAdvanceStatus = (rentalId: string, nextStatus: RentalStatus) => {
    const now = new Date();
    const formattedTimestamp = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    let noteText = '';
    if (nextStatus === 'Accepted') noteText = 'Equipment owner accepted schedule and assigned operator.';
    if (nextStatus === 'Active') noteText = 'Machine deployed and actively working on farm plot.';
    if (nextStatus === 'Completed') noteText = 'Field operations completed. Engine hours logged.';
    if (nextStatus === 'Cancelled') noteText = 'Booking cancelled by user.';

    setRentalRequests(prev =>
      prev.map(r => {
        if (r.id === rentalId) {
          return {
            ...r,
            status: nextStatus,
            statusHistory: [
              ...r.statusHistory,
              {
                status: nextStatus,
                timestamp: formattedTimestamp,
                note: noteText,
              },
            ],
          };
        }
        return r;
      })
    );

    setSuccessToast(`Rental ${rentalId} status updated to "${nextStatus}".`);
    setTimeout(() => setSuccessToast(''), 5000);
  };

  // Active bookings count
  const activeBookingsCount = rentalRequests.filter(r => r.status === 'Pending' || r.status === 'Accepted' || r.status === 'Active').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-[#E8F0E5] border-2 border-[#1B4332] text-xs font-black text-[#11281E] flex items-center justify-between shadow-md animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2D5A27]" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-[#4D6B53] hover:text-[#11281E]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b-2 border-[#1B4332]/10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-white flex items-center justify-center shadow-xs">
                <Tractor className="w-6 h-6 text-[#E8D5B5]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#11281E]">
                  Farm Machinery Rental (कृषि उपकरण किराया)
                </h1>
                <p className="text-xs text-[#4D6B53] font-bold mt-0.5">
                  On-demand tractors, harvesters, seed drills, and tillage implements from verified local owners & FPOs.
                </p>
              </div>
            </div>
          </div>

          {/* Primary View Switcher Tabs */}
          <div className="flex items-center gap-2 bg-[#F8FAF5] p-1.5 rounded-2xl border-2 border-[#1B4332]/15 self-start lg:self-center">
            <button
              onClick={() => setViewMode('browse')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'browse'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
              }`}
            >
              <Tractor className="w-4 h-4" />
              <span>Browse Machinery ({machineryList.length})</span>
            </button>
            <button
              onClick={() => setViewMode('my-rentals')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                viewMode === 'my-rentals'
                  ? 'bg-[#1B4332] text-white shadow-xs'
                  : 'text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Bookings</span>
              {activeBookingsCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  viewMode === 'my-rentals' ? 'bg-[#E8D5B5] text-[#1B4332]' : 'bg-[#1B4332] text-white'
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
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">Available Implements</span>
            <span className="text-xl font-black text-[#11281E] mt-0.5 block">{machineryList.length} Units</span>
            <span className="text-[10px] font-bold text-[#2D5A27]">Within 10 km radius</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">My Active Rentals</span>
            <span className="text-xl font-black text-[#1B4332] mt-0.5 block">{activeBookingsCount} Ongoing</span>
            <span className="text-[10px] font-bold text-[#1B4332]">Track status live</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">Starting Hourly Rate</span>
            <span className="text-xl font-black text-[#1B4332] mt-0.5 block">₹350 /hr</span>
            <span className="text-[10px] font-bold text-[#4D6B53]">Cultivator & Rotavators</span>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">Protection</span>
            <span className="text-xl font-black text-[#2D5A27] mt-0.5 block">100% Verified</span>
            <span className="text-[10px] font-bold text-[#4D6B53]">Experienced operators</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: MACHINE DETAILS DRILL-DOWN */}
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
            {/* Search + Location + Price Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search input */}
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-[#8FA396] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search machine, model, implement, or owner..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] focus:outline-none focus:border-[#1B4332] bg-[#F8FAF5]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8FA396] hover:text-[#11281E]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Location filter */}
              <div className="sm:col-span-3">
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#4D6B53] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] focus:outline-none focus:border-[#1B4332] bg-white cursor-pointer"
                  >
                    <option value="All">All Locations (सभी क्षेत्र)</option>
                    {availableLocations.filter(l => l !== 'All').map((loc) => (
                      <option key={loc} value={loc}>{loc} Region</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price / Sort filter */}
              <div className="sm:col-span-3">
                <div className="relative">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#4D6B53] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] focus:outline-none focus:border-[#1B4332] bg-white cursor-pointer"
                  >
                    <option value="All">All Hourly Rates (सभी दरें)</option>
                    <option value="under-500">Under ₹500/hr (किफायती)</option>
                    <option value="500-1000">₹500 - ₹1,000/hr (मध्यम)</option>
                    <option value="above-1000">Above ₹1,000/hr (हैवी हार्वेस्टर)</option>
                    <option value="low-to-high">Price: Low to High</option>
                    <option value="high-to-low">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Machine Type Filter Pills */}
            <div className="pt-2 border-t border-[#1B4332]/10 flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] shrink-0 mr-1">
                Equipment Type:
              </span>
              {machineTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                    selectedType === type.value
                      ? 'bg-[#1B4332] text-white shadow-xs'
                      : 'bg-[#F8FAF5] text-[#4D6B53] hover:bg-[#E8F0E5] hover:text-[#11281E] border border-[#1B4332]/15'
                  }`}
                >
                  {type.label} ({type.count})
                </button>
              ))}
            </div>
          </div>

          {/* Active Filter Indicators & Count */}
          <div className="flex items-center justify-between text-xs font-bold text-[#4D6B53] px-2">
            <span>
              Showing <strong className="text-[#11281E]">{filteredMachinery.length}</strong> available machine(s)
              {selectedType !== 'All' && <span> in <strong>{selectedType}</strong></span>}
              {selectedLocation !== 'All' && <span> near <strong>{selectedLocation}</strong></span>}
            </span>
            {(selectedType !== 'All' || selectedLocation !== 'All' || priceFilter !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedType('All');
                  setSelectedLocation('All');
                  setPriceFilter('All');
                  setSearchQuery('');
                }}
                className="text-xs font-black text-[#1B4332] hover:underline"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Machinery Grid */}
          {filteredMachinery.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMachinery.map((machine) => (
                <div
                  key={machine.id}
                  className="bg-white rounded-[28px] border-2 border-[#1B4332]/15 overflow-hidden shadow-xs hover:border-[#1B4332] hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Header with Badges */}
                    <div className="relative aspect-16/10 bg-[#F8FAF5] overflow-hidden">
                      <img
                        src={machine.imageUrl}
                        alt={machine.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#1B4332] text-[#E8D5B5] text-[10px] font-black uppercase tracking-wider shadow-sm">
                          {machine.type}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                            machine.availability === 'Available Now'
                              ? 'bg-[#2D5A27] text-white'
                              : 'bg-[#FAF3E0] text-[#8C6228] border border-[#E8D5B5]'
                          }`}
                        >
                          {machine.availability}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-[#4D6B53] font-bold">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#1B4332]" />
                            {machine.location} ({machine.distanceKm} km)
                          </span>
                          <span className="flex items-center gap-1 font-black text-[#11281E]">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {machine.rating} ({machine.reviewsCount})
                          </span>
                        </div>

                        <h3 className="text-base font-black uppercase tracking-tight text-[#11281E] mt-1 line-clamp-1">
                          {machine.name}
                        </h3>
                        {machine.hindiName && (
                          <p className="text-xs text-[#4D6B53] font-bold line-clamp-1">{machine.hindiName}</p>
                        )}
                      </div>

                      {/* Owner info */}
                      <div className="p-2.5 rounded-xl bg-[#F8FAF5] border border-[#1B4332]/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-7 h-7 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xs font-black shrink-0">
                            {machine.ownerName.charAt(0)}
                          </div>
                          <div className="truncate">
                            <span className="text-[9px] font-black uppercase text-[#8FA396] block">Owner</span>
                            <span className="text-xs font-black text-[#11281E] truncate block">{machine.ownerName}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-[#2D5A27] px-2 py-0.5 rounded-full bg-[#E8F0E5]">
                          Verified
                        </span>
                      </div>

                      {/* Attachments & specs preview */}
                      {machine.attachments && machine.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {machine.attachments.slice(0, 2).map((att, i) => (
                            <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-[#E8F0E5] text-[#1B4332] rounded-md truncate max-w-[180px]">
                              + {att}
                            </span>
                          ))}
                          {machine.attachments.length > 2 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#F8FAF5] text-[#8FA396] rounded-md">
                              +{machine.attachments.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Action footer */}
                  <div className="p-5 pt-3 border-t-2 border-[#1B4332]/10 bg-[#FAFBF8] flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#8FA396] block">Rate</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-[#1B4332]">₹{machine.pricePerHour}</span>
                        <span className="text-[11px] font-bold text-[#4D6B53]">/hr</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDetails(machine)}
                        className="py-2 px-3 rounded-xl border border-[#1B4332]/20 text-xs font-black text-[#1B4332] hover:bg-[#E8F0E5] transition-all cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleOpenRentalModal(machine)}
                        className="py-2 px-4 rounded-xl bg-[#1B4332] hover:bg-[#2D5A27] text-white text-xs font-black uppercase tracking-wider shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#E8D5B5]" />
                        <span>Request</span>
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
                No Machinery Found
              </h3>
              <p className="text-xs text-[#4D6B53] font-bold max-w-md mx-auto">
                No equipment matches your current filter combination. Try adjusting search query or resetting filters.
              </p>
              <button
                onClick={() => {
                  setSelectedType('All');
                  setSelectedLocation('All');
                  setPriceFilter('All');
                  setSearchQuery('');
                }}
                className="py-2.5 px-6 rounded-xl bg-[#1B4332] text-white text-xs font-black uppercase tracking-wider"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: MY BOOKINGS & LIFECYCLE MANAGEMENT */}
      {viewMode === 'my-rentals' && (
        <div className="space-y-6">
          {/* Sub-navigation & Status filter tabs */}
          <div className="bg-white p-6 rounded-[28px] border-2 border-[#1B4332]/15 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1B4332]/10">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-[#11281E]">
                  My Equipment Rentals (मेरी मशीनरी बुकिंग)
                </h3>
                <p className="text-xs text-[#4D6B53] font-bold mt-0.5">
                  Track machine dispatch, field active operations, and completion status.
                </p>
              </div>

              {/* Status filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['All', 'Pending', 'Accepted', 'Active', 'Completed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setRentalStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      rentalStatusFilter === st
                        ? 'bg-[#1B4332] text-white shadow-xs'
                        : 'bg-[#F8FAF5] text-[#4D6B53] hover:bg-[#E8F0E5]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Lifecycle Explainer Bar */}
            <div className="mt-4 p-3.5 rounded-2xl bg-[#E8F0E5] border border-[#1B4332]/20 flex flex-wrap items-center justify-between gap-3 text-xs font-black text-[#1B4332]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                <span>Lifecycle Flow: Pending → Accepted → Active → Completed</span>
              </span>
              <span className="text-[11px] font-bold text-[#2D5A27]">
                Demo Mode: Click action buttons to advance or simulate status changes.
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
                  {/* Top Bar: IDs, Status & Cost */}
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
                          Owner: <strong className="text-[#11281E]">{rental.ownerName}</strong> ({rental.ownerPhone})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">
                          Estimated Total ({rental.durationHours} hrs)
                        </span>
                        <span className="text-2xl font-black text-[#1B4332]">₹{rental.estimatedCost.toLocaleString('en-IN')}</span>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-xs ${
                          rental.status === 'Completed'
                            ? 'bg-[#2D5A27] text-white'
                            : rental.status === 'Active'
                            ? 'bg-amber-500 text-white animate-pulse'
                            : rental.status === 'Accepted'
                            ? 'bg-[#1B4332] text-[#E8D5B5]'
                            : 'bg-[#FAF3E0] text-[#8C6228] border border-[#E8D5B5]'
                        }`}
                      >
                        ● {rental.status}
                      </span>
                    </div>
                  </div>

                  {/* Visual Status Progress Stepper */}
                  <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/10">
                    <div className="grid grid-cols-4 gap-2 text-center relative">
                      {[
                        { key: 'Pending', label: '1. Pending', sub: 'Owner Review' },
                        { key: 'Accepted', label: '2. Accepted', sub: 'Operator Assigned' },
                        { key: 'Active', label: '3. Active', sub: 'Field Working' },
                        { key: 'Completed', label: '4. Completed', sub: 'Work Finished' },
                      ].map((step, idx) => {
                        const stepOrder: Record<RentalStatus, number> = {
                          Pending: 1,
                          Accepted: 2,
                          Active: 3,
                          Completed: 4,
                          Cancelled: 0,
                        };
                        const currentOrder = stepOrder[rental.status] || 0;
                        const isReached = currentOrder >= idx + 1;
                        const isCurrent = currentOrder === idx + 1;

                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                isCurrent
                                  ? 'bg-[#1B4332] text-white ring-4 ring-[#1B4332]/20'
                                  : isReached
                                  ? 'bg-[#2D5A27] text-white'
                                  : 'bg-stone-200 text-stone-500'
                              }`}
                            >
                              {isReached && !isCurrent ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[11px] font-black mt-1 ${isReached ? 'text-[#11281E]' : 'text-[#8FA396]'}`}>
                              {step.label}
                            </span>
                            <span className="text-[9px] text-[#4D6B53] font-bold hidden sm:block">{step.sub}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Schedule & Location Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-[#4D6B53]">
                    <div className="p-3 rounded-xl bg-[#F8FAF5] border border-[#1B4332]/10">
                      <span className="text-[10px] font-black uppercase text-[#8FA396] block">Scheduled Date & Time</span>
                      <span className="text-[#11281E] font-black">{rental.date} at {rental.startTime}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAF5] border border-[#1B4332]/10">
                      <span className="text-[10px] font-black uppercase text-[#8FA396] block">Duration & Rate</span>
                      <span className="text-[#11281E] font-black">{rental.durationHours} Hours @ ₹{rental.pricePerHour}/hr</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAF5] border border-[#1B4332]/10">
                      <span className="text-[10px] font-black uppercase text-[#8FA396] block">Field Work Location</span>
                      <span className="text-[#11281E] font-black truncate block">{rental.location}</span>
                    </div>
                  </div>

                  {/* Notes / Special Instructions */}
                  {rental.notes && (
                    <div className="p-3 rounded-xl bg-[#FAF3E0] border border-[#E8D5B5] text-xs">
                      <span className="font-black text-[#8C6228]">Field Notes: </span>
                      <span className="text-[#5C4520] font-bold">{rental.notes}</span>
                    </div>
                  )}

                  {/* Status Advancement Action Buttons for Demo Flow */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#1B4332]/10">
                    <div className="text-xs font-bold text-[#8FA396]">
                      <span>Latest Log: {rental.statusHistory[rental.statusHistory.length - 1]?.note || 'Updated'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {rental.status === 'Pending' && (
                        <button
                          onClick={() => handleAdvanceStatus(rental.id, 'Accepted')}
                          className="py-2 px-4 rounded-xl bg-[#1B4332] text-white hover:bg-[#2D5A27] text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E8D5B5]" />
                          <span>Simulate Owner Accept (स्वीकार करें)</span>
                        </button>
                      )}
                      {rental.status === 'Accepted' && (
                        <button
                          onClick={() => handleAdvanceStatus(rental.id, 'Active')}
                          className="py-2 px-4 rounded-xl bg-amber-600 text-white hover:bg-amber-700 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Start Field Operation (कार्य शुरू करें)</span>
                        </button>
                      )}
                      {rental.status === 'Active' && (
                        <button
                          onClick={() => handleAdvanceStatus(rental.id, 'Completed')}
                          className="py-2 px-4 rounded-xl bg-[#2D5A27] text-white hover:bg-[#1B4332] text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark Work Completed (कार्य पूर्ण)</span>
                        </button>
                      )}
                      {rental.status === 'Completed' && (
                        <span className="text-xs font-black text-[#2D5A27] flex items-center gap-1 px-3 py-1 bg-[#E8F0E5] rounded-xl">
                          <CheckCheck className="w-4 h-4" />
                          <span>Work Finished & Signed Off</span>
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
                No Bookings in this Category
              </h3>
              <p className="text-xs text-[#4D6B53] font-bold max-w-md mx-auto">
                You do not have any {rentalStatusFilter !== 'All' ? `"${rentalStatusFilter}"` : ''} rental bookings yet.
              </p>
              <button
                onClick={() => setViewMode('browse')}
                className="py-2.5 px-6 rounded-xl bg-[#1B4332] text-white text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Browse Equipment Catalog
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
