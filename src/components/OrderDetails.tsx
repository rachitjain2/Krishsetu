import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  ShieldCheck,
  MapPin,
  Calendar,
  IndianRupee,
  Phone,
  Building,
  UserCheck,
  AlertTriangle,
  Download,
  Share2,
  FileText,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Award
} from 'lucide-react';
import { Order, OrderStatus, UserProfile } from '../types';

interface OrderDetailsProps {
  order: Order;
  currentUser: UserProfile | null;
  viewerRole: 'farmer' | 'buyer';
  onBack: () => void;
  onAcceptOrder?: (orderId: string) => void;
  onRejectOrder?: (orderId: string, reason: string) => void;
  onMarkInTransit?: (orderId: string, vehicleNumber: string, driverName?: string, driverPhone?: string) => void;
  onMarkCompleted?: (orderId: string) => void;
  onCancelOrder?: (orderId: string, reason: string) => void;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  currentUser,
  viewerRole,
  onBack,
  onAcceptOrder,
  onRejectOrder,
  onMarkInTransit,
  onMarkCompleted,
  onCancelOrder,
}) => {
  // Action Modals
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change in procurement schedule');
  
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Stock already committed to another mandi batch');

  const [isTransitModalOpen, setIsTransitModalOpen] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState(order.deliveryDetails?.vehicleNumber || 'MP-09-TR-7820');
  const [driverName, setDriverName] = useState(order.deliveryDetails?.driverName || 'Ramesh Singh');
  const [driverPhone, setDriverPhone] = useState(order.deliveryDetails?.driverPhone || '+91 98260 99881');

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleConfirmCancel = () => {
    if (onCancelOrder) {
      onCancelOrder(order.id, cancelReason);
    }
    setIsCancelModalOpen(false);
    showToast(`Order #${order.id} has been cancelled successfully.`);
  };

  const handleConfirmReject = () => {
    if (onRejectOrder) {
      onRejectOrder(order.id, rejectReason);
    }
    setIsRejectModalOpen(false);
    showToast(`Order #${order.id} has been declined.`);
  };

  const handleConfirmTransit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onMarkInTransit) {
      onMarkInTransit(order.id, vehicleNumber, driverName, driverPhone);
    }
    setIsTransitModalOpen(false);
    showToast(`Order #${order.id} marked as In Transit with Truck ${vehicleNumber}!`);
  };

  const handleConfirmComplete = () => {
    if (onMarkCompleted) {
      onMarkCompleted(order.id);
    }
    showToast(`Order #${order.id} marked as Completed! Escrow payment released to farmer.`);
  };

  const handleSimulateDownloadReceipt = () => {
    showToast(`Digital Mandi Weighbridge Slip & Escrow Receipt downloaded for Order #${order.id}!`);
  };

  // Status mapping for visual step tracker
  const steps: { key: OrderStatus; label: string; subLabel: string; icon: React.ElementType }[] = [
    { key: 'Pending', label: 'Order Placed', subLabel: '100% Escrow Funded', icon: Clock },
    { key: 'Accepted', label: 'Farmer Accepted', subLabel: 'Packaging Batch', icon: UserCheck },
    { key: 'In Transit', label: 'Dispatched & In Transit', subLabel: 'GPS Vehicle En Route', icon: Truck },
    { key: 'Completed', label: 'Delivered & Completed', subLabel: 'Payment Released', icon: PackageCheck },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Accepted':
        return 1;
      case 'In Transit':
        return 2;
      case 'Completed':
        return 3;
      case 'Cancelled':
      case 'Rejected':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);
  const isCancelledOrRejected = order.status === 'Cancelled' || order.status === 'Rejected';

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#E8F0E5] border-2 border-[#1B4332] flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#1B4332] shrink-0" />
            <p className="text-xs sm:text-sm font-black text-[#11281E]">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          id="btn-order-details-back"
          onClick={onBack}
          className="py-2.5 px-4 rounded-full bg-white hover:bg-[#F8FAF5] text-[#11281E] text-xs font-black uppercase tracking-wider flex items-center gap-2 border-2 border-[#1B4332]/20 shadow-xs transition-all w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1B4332]" />
          <span>Back to Orders List (वापस जाएं)</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateDownloadReceipt}
            className="py-2 px-3.5 rounded-full bg-white hover:bg-[#F8FAF5] text-[#11281E] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-[#1B4332]/20 shadow-xs cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#1B4332]" />
            <span>Weighing Slip</span>
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8F0E5] text-[#1B4332] text-xs font-black uppercase tracking-wider border border-[#1B4332]/20">
            <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
            <span>{order.escrowStatus}</span>
          </div>
        </div>
      </div>

      {/* Main Order Overview Card */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#1B4332]/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-[#8FA396] uppercase">Order ID:</span>
              <span className="text-lg font-mono font-black text-[#11281E]">{order.id}</span>
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                  order.status === 'Completed'
                    ? 'bg-[#E8F0E5] text-[#1B4332] border-[#1B4332]/20'
                    : order.status === 'In Transit'
                    ? 'bg-[#E8F0E5] text-[#1B4332] border-[#1B4332]/30'
                    : order.status === 'Accepted'
                    ? 'bg-[#FAF3E0] text-[#8C6228] border-[#E8D5B5]'
                    : order.status === 'Pending'
                    ? 'bg-[#FAF3E0] text-[#8C6228] border-[#E8D5B5]'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                ● Status: {order.status}
              </span>
            </div>
            <p className="text-xs text-[#4D6B53] font-bold mt-1.5 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" />
              <span>Placed on {order.orderDate}</span>
              <span>•</span>
              <span>Direct Kisan-to-Buyer Exchange</span>
            </p>
          </div>

          <div className="text-left md:text-right bg-[#F8FAF5] p-4 rounded-2xl border border-[#1B4332]/15 self-start md:self-auto min-w-[200px]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
              Total Order Value
            </span>
            <span className="text-2xl font-black text-[#1B4332]">
              ₹{order.totalAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#2D5A27] block mt-0.5">
              100% Escrow Protected
            </span>
          </div>
        </div>

        {/* VISUAL STEP TRACKER */}
        <div className="mt-8 pt-2 pb-6 border-b-2 border-[#1B4332]/10">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#4D6B53] mb-6 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#1B4332]" />
            <span>Order Fulfillment Lifecycle (प्रक्रिया ट्रैकिंग)</span>
          </h3>

          {!isCancelledOrRejected ? (
            <div className="relative">
              {/* Progress Line */}
              <div className="hidden sm:block absolute top-6 left-8 right-8 h-1 bg-[#1B4332]/10 z-0">
                <div
                  className="h-full bg-[#1B4332] transition-all duration-500"
                  style={{
                    width: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Steps Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
                {steps.map((step, idx) => {
                  const isDone = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const StepIcon = step.icon;

                  return (
                    <div
                      key={step.key}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-start sm:items-center text-left sm:text-center ${
                        isCurrent
                          ? 'bg-[#E8F0E5] border-[#1B4332] shadow-xs'
                          : isDone
                          ? 'bg-white border-[#1B4332]/30'
                          : 'bg-[#F8FAF5] border-transparent opacity-60'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2.5 font-black text-xs ${
                          isDone
                            ? 'bg-[#1B4332] text-white'
                            : isCurrent
                            ? 'bg-[#1B4332] text-[#E8D5B5] ring-4 ring-[#1B4332]/20 animate-pulse'
                            : 'bg-[#1B4332]/15 text-[#4D6B53]'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                      </div>

                      <h4
                        className={`text-xs font-black uppercase tracking-tight ${
                          isCurrent ? 'text-[#1B4332]' : isDone ? 'text-[#11281E]' : 'text-[#8FA396]'
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className="text-[10px] text-[#4D6B53] font-bold mt-0.5">{step.subLabel}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 flex items-center gap-3 text-rose-800">
              <XCircle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-black uppercase tracking-tight text-sm">
                  Order {order.status}
                </h4>
                <p className="text-xs font-bold mt-0.5">
                  This order was {order.status.toLowerCase()}. Escrow funds have been refunded to the buyer's account.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ROLE ACTION TOOLBAR */}
        <div className="mt-6 p-5 rounded-2xl bg-[#F8FAF5] border-2 border-[#1B4332]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
              Action Required ({viewerRole === 'farmer' ? 'Kisan Actions' : 'Buyer Actions'})
            </span>
            <p className="text-xs font-bold text-[#11281E] mt-0.5">
              {viewerRole === 'farmer' ? (
                order.status === 'Pending' ? (
                  'Review buyer order proposal and accept to initiate packing.'
                ) : order.status === 'Accepted' ? (
                  'Crop is packed. Assign transport vehicle and dispatch batch.'
                ) : order.status === 'In Transit' ? (
                  'Vehicle is en route. Mark as completed once weighbridge confirmed.'
                ) : order.status === 'Completed' ? (
                  'Order fulfilled. Payment successfully transferred to your bank account.'
                ) : (
                  'Order has ended.'
                )
              ) : (
                order.status === 'Pending' ? (
                  'Waiting for farmer acceptance. You can cancel this order if plans changed.'
                ) : order.status === 'In Transit' ? (
                  `GPS Vehicle ${order.deliveryDetails?.vehicleNumber || 'active'} is in transit.`
                ) : order.status === 'Completed' ? (
                  'Batch received and escrow released.'
                ) : (
                  'Order status is active.'
                )
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* FARMER ACTION BUTTONS */}
            {viewerRole === 'farmer' && (
              <>
                {order.status === 'Pending' && (
                  <>
                    <button
                      id="farmer-accept-order-btn"
                      onClick={() => onAcceptOrder && onAcceptOrder(order.id)}
                      className="py-2.5 px-5 bg-[#1B4332] text-white hover:bg-[#2D5A27] rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs border-2 border-[#1B4332]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#E8D5B5]" />
                      <span>Accept Order (स्वीकार करें)</span>
                    </button>
                    <button
                      id="farmer-reject-order-btn"
                      onClick={() => setIsRejectModalOpen(true)}
                      className="py-2.5 px-4 bg-white hover:bg-rose-50 text-rose-700 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-rose-300"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Order</span>
                    </button>
                  </>
                )}

                {order.status === 'Accepted' && (
                  <button
                    id="farmer-dispatch-order-btn"
                    onClick={() => setIsTransitModalOpen(true)}
                    className="py-2.5 px-5 bg-[#1B4332] text-white hover:bg-[#2D5A27] rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs border-2 border-[#1B4332]"
                  >
                    <Truck className="w-4 h-4 text-[#E8D5B5]" />
                    <span>Mark Ready & Start Transit (गाड़ी रवाना करें)</span>
                  </button>
                )}

                {order.status === 'In Transit' && (
                  <button
                    id="farmer-complete-order-btn"
                    onClick={handleConfirmComplete}
                    className="py-2.5 px-5 bg-[#1B4332] text-white hover:bg-[#2D5A27] rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs border-2 border-[#1B4332]"
                  >
                    <PackageCheck className="w-4 h-4 text-[#E8D5B5]" />
                    <span>Mark Delivered & Completed (सौदा पूर्ण)</span>
                  </button>
                )}
              </>
            )}

            {/* BUYER ACTION BUTTONS */}
            {viewerRole === 'buyer' && (
              <>
                {order.status === 'Pending' && (
                  <button
                    id="buyer-cancel-order-btn"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="py-2.5 px-4 bg-white hover:bg-rose-50 text-rose-700 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-rose-300"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel Order</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* DETAILS GRID: Crop Specs & Parties */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* CROP DETAILS CARD */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-[28px] bg-[#F8FAF5] border-2 border-[#1B4332]/15 space-y-5">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#11281E] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#1B4332]" />
                <span>Crop Batch Specifications (फसल विवरण)</span>
              </h3>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <img
                  src={
                    order.crop.imageUrl ||
                    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={order.crop.name}
                  referrerPolicy="no-referrer"
                  className="w-full sm:w-36 h-36 rounded-2xl object-cover border-2 border-[#1B4332]/20 shrink-0"
                />
                <div className="space-y-2 flex-1">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8F0E5] text-[#1B4332] border border-[#1B4332]/20">
                      {order.crop.category}
                    </span>
                    <h4 className="text-lg font-black uppercase tracking-tight text-[#11281E] mt-1">
                      {order.crop.name}
                    </h4>
                    {order.crop.hindiName && (
                      <p className="text-xs font-bold text-[#4D6B53]">{order.crop.hindiName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <div className="p-2 rounded-xl bg-white border border-[#1B4332]/10">
                      <span className="text-[10px] text-[#8FA396] uppercase block">Variety</span>
                      <span className="text-[#11281E] font-black">{order.crop.variety || 'Certified Pure'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-[#1B4332]/10">
                      <span className="text-[10px] text-[#8FA396] uppercase block">Quality Grade</span>
                      <span className="text-[#2D5A27] font-black">{order.crop.qualityGrade || 'Grade A+'}</span>
                    </div>
                    {order.crop.moisturePercent !== undefined && (
                      <div className="p-2 rounded-xl bg-white border border-[#1B4332]/10">
                        <span className="text-[10px] text-[#8FA396] uppercase block">Moisture Level</span>
                        <span className="text-[#11281E] font-black">{order.crop.moisturePercent}% (Dry & Tested)</span>
                      </div>
                    )}
                    <div className="p-2 rounded-xl bg-white border border-[#1B4332]/10">
                      <span className="text-[10px] text-[#8FA396] uppercase block">Packaging</span>
                      <span className="text-[#11281E] font-black">50kg Standard Jute Bags</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing breakdown strip */}
              <div className="p-4 rounded-2xl bg-white border border-[#1B4332]/15 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
                    Procured Quantity
                  </span>
                  <span className="text-base font-black text-[#11281E]">
                    {order.quantity} {order.unit}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
                    Agreed Rate
                  </span>
                  <span className="text-base font-black text-[#1B4332]">
                    ₹{order.price.toLocaleString('en-IN')} / {order.unit ? order.unit.replace(/s$/, '') : 'Qtl'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
                    Total Amount
                  </span>
                  <span className="text-lg font-black text-[#11281E]">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* LOGISTICS & DELIVERY CARD */}
            <div className="p-6 rounded-[28px] bg-[#F8FAF5] border-2 border-[#1B4332]/15 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#11281E] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#1B4332]" />
                <span>Logistics & Dispatch Route (परिवहन विवरण)</span>
              </h3>

              <div className="space-y-3 text-xs">
                {/* Pickup Location */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#1B4332]/10 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-[#E8F0E5] text-[#1B4332] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
                      Pickup Farm Depot (किसान लोडिंग स्थान)
                    </span>
                    <p className="font-bold text-[#11281E] mt-0.5">{order.location.pickupLocation}</p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#1B4332]/10 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-[#FAF3E0] text-[#8C6228] flex items-center justify-center shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
                      Buyer Delivery Destination (वितरण गोदाम)
                    </span>
                    <p className="font-bold text-[#11281E] mt-0.5">{order.location.deliveryAddress}</p>
                  </div>
                </div>

                {/* Vehicle & Driver Info */}
                {order.deliveryDetails?.vehicleNumber && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-2xl bg-white border border-[#1B4332]/10">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">
                        Assigned Truck
                      </span>
                      <span className="text-sm font-mono font-black text-[#11281E]">
                        {order.deliveryDetails.vehicleNumber}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-[#1B4332]/10">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block">
                        Driver Contact
                      </span>
                      <span className="text-xs font-bold text-[#11281E]">
                        {order.deliveryDetails.driverName || 'Logistics Driver'} ({order.deliveryDetails.driverPhone || '+91 98XXX XXXXX'})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ACTIVITY AUDIT LOG */}
            <div className="p-6 rounded-[28px] bg-white border-2 border-[#1B4332]/15 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#11281E] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1B4332]" />
                <span>Audit Trail & Activity Log (गतिविधि विवरण)</span>
              </h3>

              <div className="space-y-3">
                {order.statusHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/10 flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-[#1B4332]">
                          {item.status} (By {item.actor})
                        </span>
                        <span className="text-[10px] font-bold text-[#8FA396]">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#4D6B53] font-bold mt-1">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR: BUYER, FARMER & ESCROW SUMMARY */}
          <div className="space-y-6">
            {/* FARMER PROFILE CARD */}
            <div className="p-6 rounded-[28px] bg-[#F8FAF5] border-2 border-[#1B4332]/15 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#4D6B53]">
                Farmer Details (किसान संपर्क)
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F0E5] border-2 border-[#1B4332]/20 flex items-center justify-center text-base font-black text-[#1B4332]">
                  {order.farmer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#11281E] uppercase">{order.farmer.name}</h4>
                  <p className="text-xs text-[#4D6B53] font-bold">{order.farmer.location}</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-[#1B4332]/10 text-xs font-bold text-[#4D6B53]">
                <div className="flex items-center justify-between">
                  <span>Farm Cluster:</span>
                  <span className="text-[#11281E] font-black">{order.farmer.cluster || 'Central Mandi'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Contact Phone:</span>
                  <span className="text-[#11281E] font-black">{order.farmer.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Farmer Rating:</span>
                  <span className="text-[#2D5A27] font-black">★ {order.farmer.rating || '4.9'} / 5.0</span>
                </div>
              </div>
            </div>

            {/* BUYER PROFILE CARD */}
            <div className="p-6 rounded-[28px] bg-[#F8FAF5] border-2 border-[#1B4332]/15 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#4D6B53]">
                Buyer Details (खरीदार संपर्क)
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF3E0] border-2 border-[#E8D5B5] flex items-center justify-center text-base font-black text-[#8C6228]">
                  {order.buyer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#11281E] uppercase">{order.buyer.company || order.buyer.name}</h4>
                  <p className="text-xs text-[#4D6B53] font-bold">{order.buyer.name}</p>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-[#1B4332]/10 text-xs font-bold text-[#4D6B53]">
                <div className="flex items-center justify-between">
                  <span>Procurement Hub:</span>
                  <span className="text-[#11281E] font-black">{order.buyer.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Contact Phone:</span>
                  <span className="text-[#11281E] font-black">{order.buyer.phone}</span>
                </div>
              </div>
            </div>

            {/* ESCROW SECURITY CARD */}
            <div className="p-6 rounded-[28px] bg-[#E8F0E5] border-2 border-[#1B4332]/20 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2D5A27]" />
                <h4 className="font-black uppercase tracking-tight text-xs text-[#1B4332]">
                  KrishiSetu Escrow Guarantee
                </h4>
              </div>
              <p className="text-xs font-bold text-[#11281E] leading-relaxed">
                Buyer funds are 100% deposited in escrow. Payment is released to the farmer immediately upon weighbridge verification and crop delivery confirmation.
              </p>
              <div className="pt-2 text-[10px] font-black uppercase tracking-wider text-[#2D5A27] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Middlemen Commission</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CANCEL ORDER MODAL (BUYER) */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[32px] border-2 border-[#1B4332] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-black uppercase tracking-tight">Cancel Order #{order.id}?</h3>
            </div>
            <p className="text-xs text-[#4D6B53] font-bold">
              Are you sure you want to cancel this pending order for {order.quantity} {order.unit} of {order.crop.name}? Your escrow deposit of ₹{order.totalAmount.toLocaleString('en-IN')} will be refunded immediately.
            </p>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block mb-1">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5]"
              >
                <option value="Change in procurement schedule">Change in procurement schedule</option>
                <option value="Procured from alternative cluster">Procured from alternative cluster</option>
                <option value="Pricing negotiation update">Pricing negotiation update</option>
                <option value="Other logistic requirement">Other logistic requirement</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-full text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Confirm Cancel
              </button>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="py-3 px-5 bg-[#F8FAF5] hover:bg-[#E8F0E5] text-[#11281E] rounded-full text-xs font-black uppercase tracking-wider border border-[#1B4332]/20 cursor-pointer"
              >
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT ORDER MODAL (FARMER) */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[32px] border-2 border-[#1B4332] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-700">
              <XCircle className="w-6 h-6" />
              <h3 className="text-lg font-black uppercase tracking-tight">Decline Order #{order.id}?</h3>
            </div>
            <p className="text-xs text-[#4D6B53] font-bold">
              Declining this order will inform buyer {order.buyer.company || order.buyer.name} and unblock the harvest batch for other buyers.
            </p>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block mb-1">
                Reason for Rejection
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5]"
              >
                <option value="Stock already committed to another mandi batch">Stock already committed to another mandi batch</option>
                <option value="Requested delivery timeline too tight">Requested delivery timeline too tight</option>
                <option value="Price renegotiation required">Price renegotiation required</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-full text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Confirm Decline
              </button>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="py-3 px-5 bg-[#F8FAF5] hover:bg-[#E8F0E5] text-[#11281E] rounded-full text-xs font-black uppercase tracking-wider border border-[#1B4332]/20 cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* START TRANSIT MODAL (FARMER) */}
      {isTransitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleConfirmTransit}
            className="bg-white rounded-[32px] border-2 border-[#1B4332] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3 text-[#1B4332]">
              <Truck className="w-6 h-6" />
              <h3 className="text-lg font-black uppercase tracking-tight">Mark Ready & Start Transit</h3>
            </div>
            <p className="text-xs text-[#4D6B53] font-bold">
              Provide logistics vehicle and driver details for buyer GPS tracking.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block mb-1">
                  Truck Registration Number (गाड़ी नंबर) *
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
                  Driver Phone Number
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
                onClick={() => setIsTransitModalOpen(false)}
                className="py-3 px-5 bg-[#F8FAF5] hover:bg-[#E8F0E5] text-[#11281E] rounded-full text-xs font-black uppercase tracking-wider border border-[#1B4332]/20 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
