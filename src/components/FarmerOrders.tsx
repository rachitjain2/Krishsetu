import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  Eye,
  ArrowUpDown,
  RotateCcw,
  IndianRupee,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Store,
  Calendar,
  Layers,
  AlertCircle,
  Building,
  UserCheck
} from 'lucide-react';
import { Order, OrderStatus, UserProfile } from '../types';
import { OrderDetails } from './OrderDetails';

interface FarmerOrdersProps {
  orders: Order[];
  currentUser: UserProfile | null;
  onAcceptOrder?: (orderId: string) => void;
  onRejectOrder?: (orderId: string, reason: string) => void;
  onMarkInTransit?: (orderId: string, vehicleNumber: string, driverName?: string, driverPhone?: string) => void;
  onMarkCompleted?: (orderId: string) => void;
  initialSelectedOrderId?: string | null;
}

export const FarmerOrders: React.FC<FarmerOrdersProps> = ({
  orders,
  currentUser,
  onAcceptOrder,
  onRejectOrder,
  onMarkInTransit,
  onMarkCompleted,
  initialSelectedOrderId = null,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialSelectedOrderId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All' | OrderStatus>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'amount-desc' | 'amount-asc'>('newest');
  const [toastMessage, setToastMessage] = useState('');

  // Modals for quick actions from list
  const [transitModalOrderId, setTransitModalOrderId] = useState<string | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState('MP-09-TR-4501');
  const [driverName, setDriverName] = useState('Gopal Yadav');
  const [driverPhone, setDriverPhone] = useState('+91 94250 88991');

  const [rejectModalOrderId, setRejectModalOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Stock committed to local mandi');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Status filter
      if (selectedStatusFilter !== 'All' && order.status !== selectedStatusFilter) {
        return false;
      }

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesCrop = order.crop.name.toLowerCase().includes(q);
        const matchesBuyer = order.buyer.name.toLowerCase().includes(q) || (order.buyer.company && order.buyer.company.toLowerCase().includes(q));
        const matchesLoc = order.location.deliveryAddress.toLowerCase().includes(q) ||
          order.location.pickupLocation.toLowerCase().includes(q);

        if (!matchesId && !matchesCrop && !matchesBuyer && !matchesLoc) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'amount-desc') {
        return b.totalAmount - a.totalAmount;
      }
      if (sortBy === 'amount-asc') {
        return a.totalAmount - b.totalAmount;
      }
      return b.id.localeCompare(a.id);
    });
  }, [orders, selectedStatusFilter, searchQuery, sortBy]);

  // Selected Order for Details View
  const selectedOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  if (selectedOrder) {
    return (
      <OrderDetails
        order={selectedOrder}
        currentUser={currentUser}
        viewerRole="farmer"
        onBack={() => setSelectedOrderId(null)}
        onAcceptOrder={(id) => {
          if (onAcceptOrder) onAcceptOrder(id);
          showToast(`Order #${id} accepted!`);
        }}
        onRejectOrder={(id, reason) => {
          if (onRejectOrder) onRejectOrder(id, reason);
          showToast(`Order #${id} rejected.`);
        }}
        onMarkInTransit={(id, veh, drv, ph) => {
          if (onMarkInTransit) onMarkInTransit(id, veh, drv, ph);
          showToast(`Order #${id} marked In Transit!`);
        }}
        onMarkCompleted={(id) => {
          if (onMarkCompleted) onMarkCompleted(id);
          showToast(`Order #${id} completed & payment released!`);
        }}
      />
    );
  }

  // Summary Metrics
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const acceptedCount = orders.filter((o) => o.status === 'Accepted').length;
  const inTransitCount = orders.filter((o) => o.status === 'In Transit').length;
  const completedEarnings = orders
    .filter((o) => o.status === 'Completed')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const handleQuickAccept = (orderId: string) => {
    if (onAcceptOrder) {
      onAcceptOrder(orderId);
      showToast(`Order #${orderId} accepted! Prepare batch for dispatch.`);
    }
  };

  const handleQuickTransitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transitModalOrderId && onMarkInTransit) {
      onMarkInTransit(transitModalOrderId, vehicleNumber, driverName, driverPhone);
      showToast(`Order #${transitModalOrderId} dispatched with Truck ${vehicleNumber}!`);
      setTransitModalOrderId(null);
    }
  };

  const handleQuickRejectSubmit = () => {
    if (rejectModalOrderId && onRejectOrder) {
      onRejectOrder(rejectModalOrderId, rejectReason);
      showToast(`Order #${rejectModalOrderId} declined.`);
      setRejectModalOrderId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#E8F0E5] border-2 border-[#1B4332] flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#1B4332] shrink-0" />
            <p className="text-xs sm:text-sm font-black text-[#11281E]">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#1B4332]/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F0E5] text-[#1B4332] text-[10px] font-black uppercase tracking-widest mb-2 border border-[#1B4332]/20">
              <ShoppingBag className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>Kisan Fulfillment & Sales • फसल ऑर्डर और बिक्री</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#11281E]">
              Farmer Orders & Fulfillment
            </h1>
            <p className="text-xs sm:text-sm text-[#4D6B53] font-bold mt-1 max-w-2xl">
              Accept direct procurement orders from verified buyers, schedule truck dispatches, and receive guaranteed escrow bank payouts.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#E8F0E5] text-[#1B4332] text-xs font-black uppercase tracking-wider border border-[#1B4332]/20">
            <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
            <span>Direct Kisan Bank Guarantee</span>
          </div>
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-[#FAF3E0] border border-[#E8D5B5]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8C6228] block">
              Pending Action
            </span>
            <span className="text-xl font-black text-[#8C6228]">{pendingCount}</span>
            <span className="text-[10px] text-[#8C6228] font-bold block mt-0.5">Requires response</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/15">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
              Accepted / Packing
            </span>
            <span className="text-xl font-black text-[#11281E]">{acceptedCount}</span>
            <span className="text-[10px] text-[#8FA396] font-bold block mt-0.5">Readying batch</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#E8F0E5] border border-[#1B4332]/20">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1B4332] block">
              In Transit
            </span>
            <span className="text-xl font-black text-[#1B4332]">{inTransitCount}</span>
            <span className="text-[10px] text-[#2D5A27] font-bold block mt-0.5">Dispatched to mill</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/15">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
              Payouts Received
            </span>
            <span className="text-xl font-black text-[#1B4332]">₹{(completedEarnings / 100000).toFixed(2)}L</span>
            <span className="text-[10px] text-[#2D5A27] font-bold block mt-0.5">Direct to Bank</span>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-[#4D6B53] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="farmer-orders-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders by ID, crop name, buyer company, or destination..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#1B4332]/20 text-xs sm:text-sm font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#8FA396] hover:text-[#11281E]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="relative min-w-[170px]">
              <ArrowUpDown className="w-4 h-4 text-[#4D6B53] absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                id="farmer-orders-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-9 pr-8 py-3.5 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-black uppercase tracking-wider text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332] appearance-none cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="amount-desc">Sort: Value (High to Low)</option>
                <option value="amount-asc">Sort: Value (Low to High)</option>
              </select>
            </div>
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {(['All', 'Pending', 'Accepted', 'In Transit', 'Completed', 'Rejected'] as const).map((status) => {
              const count = status === 'All' ? orders.length : orders.filter((o) => o.status === status).length;
              const isSelected = selectedStatusFilter === status;

              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatusFilter(status)}
                  className={`py-2 px-3.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#1B4332] text-[#E8D5B5] border-[#1B4332] shadow-xs'
                      : 'bg-[#F8FAF5] text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5] border-[#1B4332]/15'
                  }`}
                >
                  {status} {count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ORDERS LIST */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'Pending';
            const isAccepted = order.status === 'Accepted';
            const isInTransit = order.status === 'In Transit';
            const isCompleted = order.status === 'Completed';
            const isCancelled = order.status === 'Cancelled' || order.status === 'Rejected';

            return (
              <div
                key={order.id}
                id={`farmer-order-card-${order.id}`}
                className="bg-white rounded-[28px] border-2 border-[#1B4332]/15 hover:border-[#1B4332] p-6 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1B4332]/10">
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        order.crop.imageUrl ||
                        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={order.crop.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#1B4332]/15 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            isCompleted
                              ? 'bg-[#E8F0E5] text-[#1B4332] border-[#1B4332]/20'
                              : isInTransit
                              ? 'bg-[#E8F0E5] text-[#1B4332] border-[#1B4332]/30 animate-pulse'
                              : isAccepted
                              ? 'bg-[#FAF3E0] text-[#8C6228] border-[#E8D5B5]'
                              : isPending
                              ? 'bg-[#FAF3E0] text-[#8C6228] border-[#E8D5B5]'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          ● {order.status}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#8FA396]">#{order.id}</span>
                        <span className="text-xs text-[#8FA396]">• {order.orderDate}</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#11281E] mt-1">
                        {order.crop.name}
                      </h3>
                      <p className="text-xs text-[#4D6B53] font-bold">
                        Buyer: <span className="text-[#11281E]">{order.buyer.company || order.buyer.name}</span> ({order.buyer.location})
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
                      Guaranteed Payout
                    </span>
                    <span className="text-xl font-black text-[#1B4332]">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-[#4D6B53] block mt-0.5">
                      {order.quantity} {order.unit} @ ₹{order.price.toLocaleString('en-IN')}/{order.unit ? order.unit.replace(/s$/, '') : 'Qtl'}
                    </span>
                  </div>
                </div>

                {/* Meta Strip & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#4D6B53]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#2D5A27]" />
                      <span className="truncate max-w-[240px]">Pickup: {order.location.pickupLocation}</span>
                    </div>

                    {order.deliveryDetails?.vehicleNumber && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8FAF5] border border-[#1B4332]/10">
                        <Truck className="w-3.5 h-3.5 text-[#1B4332]" />
                        <span className="font-mono text-[#11281E]">{order.deliveryDetails.vehicleNumber}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[#2D5A27]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{order.escrowStatus}</span>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleQuickAccept(order.id)}
                          className="py-2 px-4 rounded-full bg-[#1B4332] hover:bg-[#2D5A27] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border border-[#1B4332]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#E8D5B5]" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => setRejectModalOrderId(order.id)}
                          className="py-2 px-3 rounded-full bg-white hover:bg-rose-50 text-rose-700 text-xs font-black uppercase tracking-wider border border-rose-300 transition-all cursor-pointer"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {isAccepted && (
                      <button
                        onClick={() => {
                          setTransitModalOrderId(order.id);
                        }}
                        className="py-2 px-4 rounded-full bg-[#1B4332] hover:bg-[#2D5A27] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border border-[#1B4332]"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#E8D5B5]" />
                        <span>Mark Ready & Dispatch</span>
                      </button>
                    )}

                    {isInTransit && onMarkCompleted && (
                      <button
                        onClick={() => {
                          onMarkCompleted(order.id);
                          showToast(`Order #${order.id} completed! Escrow payment released.`);
                        }}
                        className="py-2 px-4 rounded-full bg-[#1B4332] hover:bg-[#2D5A27] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border border-[#1B4332]"
                      >
                        <PackageCheck className="w-3.5 h-3.5 text-[#E8D5B5]" />
                        <span>Mark Completed</span>
                      </button>
                    )}

                    <button
                      id={`btn-view-farmer-order-${order.id}`}
                      onClick={() => setSelectedOrderId(order.id)}
                      className="py-2 px-3.5 rounded-full bg-[#F8FAF5] hover:bg-[#E8F0E5] text-[#11281E] text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer border border-[#1B4332]/20"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#1B4332]" />
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#1B4332]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white p-12 rounded-[32px] border-2 border-[#1B4332]/15 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F8FAF5] border-2 border-[#1B4332]/20 flex items-center justify-center mx-auto text-[#4D6B53]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-[#11281E]">
            No Orders Found
          </h3>
          <p className="text-xs sm:text-sm text-[#4D6B53] font-bold max-w-md mx-auto">
            {selectedStatusFilter !== 'All'
              ? `There are no orders with status "${selectedStatusFilter}".`
              : 'You do not have any incoming wholesale orders at the moment.'}
          </p>
        </div>
      )}

      {/* QUICK TRANSIT DISPATCH MODAL */}
      {transitModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleQuickTransitSubmit}
            className="bg-white rounded-[32px] border-2 border-[#1B4332] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3 text-[#1B4332]">
              <Truck className="w-6 h-6" />
              <h3 className="text-lg font-black uppercase tracking-tight">
                Dispatch Order #{transitModalOrderId}
              </h3>
            </div>
            <p className="text-xs text-[#4D6B53] font-bold">
              Enter vehicle registration and driver contact for dispatch tracking.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block mb-1">
                  Truck Number (गाड़ी नंबर) *
                </label>
                <input
                  type="text"
                  required
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. MP-09-AB-1234"
                  className="w-full py-2.5 px-3 rounded-xl border border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Driver Full Name"
                  className="w-full py-2.5 px-3 rounded-xl border border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5]"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block mb-1">
                  Driver Contact Phone
                </label>
                <input
                  type="tel"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full py-2.5 px-3 rounded-xl border border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                className="flex-1 py-3 bg-[#1B4332] hover:bg-[#2D5A27] text-white rounded-full text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Confirm Dispatch
              </button>
              <button
                type="button"
                onClick={() => setTransitModalOrderId(null)}
                className="py-3 px-5 bg-[#F8FAF5] hover:bg-[#E8F0E5] text-[#11281E] rounded-full text-xs font-black uppercase tracking-wider border border-[#1B4332]/20 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QUICK REJECT MODAL */}
      {rejectModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[32px] border-2 border-[#1B4332] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <XCircle className="w-6 h-6" />
              <h3 className="text-lg font-black uppercase tracking-tight">
                Decline Order #{rejectModalOrderId}?
              </h3>
            </div>
            <p className="text-xs text-[#4D6B53] font-bold">
              The buyer will be notified and escrow deposit refunded.
            </p>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block mb-1">
                Reason
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5]"
              >
                <option value="Stock committed to local mandi">Stock committed to local mandi</option>
                <option value="Requested delivery timeline too tight">Requested delivery timeline too tight</option>
                <option value="Price renegotiation required">Price renegotiation required</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleQuickRejectSubmit}
                className="flex-1 py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-full text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Decline Order
              </button>
              <button
                onClick={() => setRejectModalOrderId(null)}
                className="py-3 px-5 bg-[#F8FAF5] hover:bg-[#E8F0E5] text-[#11281E] rounded-full text-xs font-black uppercase tracking-wider border border-[#1B4332]/20 cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
