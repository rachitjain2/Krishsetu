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
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus, UserProfile } from '../types';
import { OrderDetails } from './OrderDetails';

interface BuyerOrdersProps {
  orders: Order[];
  currentUser: UserProfile | null;
  onBrowseProduce?: () => void;
  onCancelOrder?: (orderId: string, reason: string) => void;
  initialSelectedOrderId?: string | null;
}

export const BuyerOrders: React.FC<BuyerOrdersProps> = ({
  orders,
  currentUser,
  onBrowseProduce,
  onCancelOrder,
  initialSelectedOrderId = null,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialSelectedOrderId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All' | OrderStatus>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'amount-desc' | 'amount-asc'>('newest');
  const [toastMessage, setToastMessage] = useState('');

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

      // 2. Search query (ID, Crop name, Farmer name, Location)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesCrop = order.crop.name.toLowerCase().includes(q);
        const matchesFarmer = order.farmer.name.toLowerCase().includes(q);
        const matchesLoc = order.location.deliveryAddress.toLowerCase().includes(q) ||
          order.location.pickupLocation.toLowerCase().includes(q);

        if (!matchesId && !matchesCrop && !matchesFarmer && !matchesLoc) {
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
      // default: newest
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
        viewerRole="buyer"
        onBack={() => setSelectedOrderId(null)}
        onCancelOrder={(orderId, reason) => {
          if (onCancelOrder) {
            onCancelOrder(orderId, reason);
          }
          showToast(`Order #${orderId} was cancelled.`);
        }}
      />
    );
  }

  // Summary Metrics
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const inTransitCount = orders.filter((o) => o.status === 'In Transit').length;
  const completedCount = orders.filter((o) => o.status === 'Completed').length;
  const totalSpend = orders.reduce((acc, o) => (o.status !== 'Cancelled' && o.status !== 'Rejected' ? acc + o.totalAmount : acc), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast message */}
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
              <span>Procurement Management • खरीद ट्रैकिंग</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#11281E]">
              My Procurement Orders
            </h1>
            <p className="text-xs sm:text-sm text-[#4D6B53] font-bold mt-1 max-w-2xl">
              Track real-time harvest dispatch, weighbridge slips, GPS truck transport, and 100% protected escrow settlements.
            </p>
          </div>

          {onBrowseProduce && (
            <button
              onClick={onBrowseProduce}
              className="py-3 px-5 bg-[#1B4332] hover:bg-[#2D5A27] text-white rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs border-2 border-[#1B4332] self-start md:self-auto transition-all"
            >
              <Store className="w-4 h-4 text-[#E8D5B5]" />
              <span>Browse Farmer Harvests</span>
            </button>
          )}
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/15">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
              Total Orders
            </span>
            <span className="text-xl font-black text-[#11281E]">{orders.length}</span>
            <span className="text-[10px] text-[#8FA396] font-bold block mt-0.5">All time orders</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF3E0] border border-[#E8D5B5]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8C6228] block">
              Pending Farmer Action
            </span>
            <span className="text-xl font-black text-[#8C6228]">{pendingCount}</span>
            <span className="text-[10px] text-[#8C6228] font-bold block mt-0.5">Awaiting confirm</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#E8F0E5] border border-[#1B4332]/20">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1B4332] block">
              In Transit
            </span>
            <span className="text-xl font-black text-[#1B4332]">{inTransitCount}</span>
            <span className="text-[10px] text-[#2D5A27] font-bold block mt-0.5">En route delivery</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/15">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
              Total Committed
            </span>
            <span className="text-xl font-black text-[#11281E]">₹{(totalSpend / 100000).toFixed(2)}L</span>
            <span className="text-[10px] text-[#2D5A27] font-bold block mt-0.5">100% Escrow safe</span>
          </div>
        </div>

        {/* SEARCH AND FILTERS CONTROLS */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-[#4D6B53] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="buyer-orders-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID, crop name, farmer name, or destination..."
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

            {/* Sort Dropdown */}
            <div className="relative min-w-[170px]">
              <ArrowUpDown className="w-4 h-4 text-[#4D6B53] absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                id="buyer-orders-sort-select"
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
            {(['All', 'Pending', 'Accepted', 'In Transit', 'Completed', 'Cancelled'] as const).map((status) => {
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
                id={`buyer-order-card-${order.id}`}
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
                        Farmer: <span className="text-[#11281E]">{order.farmer.name}</span> ({order.farmer.location})
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
                      Total Amount
                    </span>
                    <span className="text-xl font-black text-[#1B4332]">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-bold text-[#4D6B53] block mt-0.5">
                      {order.quantity} {order.unit} @ ₹{order.price.toLocaleString('en-IN')}/{order.unit ? order.unit.replace(/s$/, '') : 'Qtl'}
                    </span>
                  </div>
                </div>

                {/* Card Meta & Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#4D6B53]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#2D5A27]" />
                      <span className="truncate max-w-[240px]">{order.location.deliveryAddress}</span>
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

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isPending && onCancelOrder && (
                      <button
                        onClick={() => {
                          if (confirm(`Cancel pending order #${order.id}?`)) {
                            onCancelOrder(order.id, 'Buyer requested cancellation');
                            showToast(`Order #${order.id} cancelled.`);
                          }
                        }}
                        className="py-2 px-3.5 rounded-full bg-white hover:bg-rose-50 text-rose-700 text-xs font-black uppercase tracking-wider border border-rose-300 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      id={`btn-track-order-${order.id}`}
                      onClick={() => setSelectedOrderId(order.id)}
                      className="py-2.5 px-4 rounded-full bg-[#1B4332] hover:bg-[#2D5A27] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border border-[#1B4332] shadow-xs"
                    >
                      <Truck className="w-3.5 h-3.5 text-[#E8D5B5]" />
                      <span>Track & View Order</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#E8D5B5]" />
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
              ? `You do not have any orders with status "${selectedStatusFilter}".`
              : 'You have not placed any crop procurement orders yet.'}
          </p>
          {onBrowseProduce && (
            <button
              onClick={onBrowseProduce}
              className="py-2.5 px-6 rounded-full bg-[#1B4332] text-[#E8D5B5] hover:bg-[#2D5A27] text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              Browse Available Produce
            </button>
          )}
        </div>
      )}
    </div>
  );
};
