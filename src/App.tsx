import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { RoleSelect } from './components/RoleSelect';
import { AuthFarmer } from './components/AuthFarmer';
import { AuthBuyer } from './components/AuthBuyer';
import { FarmerDashboard } from './components/FarmerDashboard';
import { BuyerDashboard } from './components/BuyerDashboard';
import { AppRoute, UserProfile, Order, CropListing } from './types';
import { INITIAL_ORDERS } from './data/ordersData';
import { INITIAL_MARKETPLACE_CROPS } from './data/marketplaceData';
import {
  auth,
  seedInitialFirestoreData,
  subscribeToOrders,
  subscribeToCropListings,
  createOrderInFirestore,
  updateOrderInFirestore,
  logoutFirebase,
  db
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

function MainApp() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('landing');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [crops, setCrops] = useState<CropListing[]>(INITIAL_MARKETPLACE_CROPS);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(true);
  const { isHindi } = useLanguage();
  const { showSuccess, showError, showInfo } = useToast();

  // 1. Initial Firestore Seeding & Realtime Subscriptions
  useEffect(() => {
    let unsubscribeOrders: (() => void) | undefined;
    let unsubscribeCrops: (() => void) | undefined;

    const initializeData = async () => {
      try {
        // Seed default records if empty in Firestore
        await seedInitialFirestoreData();
      } catch (err) {
        console.warn('Firestore initialization notice:', err);
      } finally {
        setIsFirebaseSyncing(false);
      }

      // Realtime listener for orders
      unsubscribeOrders = subscribeToOrders(
        (updatedOrders) => {
          if (updatedOrders && updatedOrders.length > 0) {
            setOrders(updatedOrders);
          }
        },
        (err) => {
          console.warn('Order subscription error:', err);
        }
      );

      // Realtime listener for crops
      unsubscribeCrops = subscribeToCropListings(
        (updatedCrops) => {
          if (updatedCrops && updatedCrops.length > 0) {
            setCrops(updatedCrops);
          }
        },
        (err) => {
          console.warn('Crop subscription error:', err);
        }
      );
    };

    initializeData();

    // 2. Auth state restoration
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setCurrentUser({ ...data, uid: firebaseUser.uid });
          }
        } catch (e) {
          console.warn('User doc fetch notice:', e);
        }
      }
    });

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeCrops) unsubscribeCrops();
      unsubscribeAuth();
    };
  }, []);

  // Sync scroll on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentRoute]);

  const handleNavigate = (route: AppRoute) => {
    setCurrentRoute(route);
  };

  const handleFarmerLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentRoute('farmer-dashboard');
    showSuccess(
      isHindi ? `नमस्ते ${user.name} जी!` : `Welcome back, ${user.name}!`,
      isHindi ? 'किसान डैशबोर्ड में आपका स्वागत है।' : 'Farmer dashboard ready.'
    );
  };

  const handleBuyerLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentRoute('buyer-dashboard');
    showSuccess(
      isHindi ? `नमस्ते ${user.name} जी!` : `Welcome back, ${user.name}!`,
      isHindi ? 'व्यापारी डैशबोर्ड में आपका स्वागत है।' : 'Buyer portal ready.'
    );
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
    } catch (e) {
      console.warn('Logout notice:', e);
    }
    setCurrentUser(null);
    setCurrentRoute('landing');
    showInfo(
      isHindi ? 'लॉग आउट संपन्न हुआ' : 'Logged out',
      isHindi ? 'पुनः पधारने के लिए धन्यवाद।' : 'Session ended safely.'
    );
  };

  // ORDER HANDLERS (With Firestore persistence & local fallback)
  const handleAcceptOrder = async (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const now = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newHistoryItem = {
      status: 'Accepted' as const,
      timestamp: `${now}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      note: `Farmer ${targetOrder?.farmer.name || 'Farmer'} accepted the order. Packing in progress.`,
      actor: 'Farmer' as const,
    };

    const updatedHistory = targetOrder ? [...targetOrder.statusHistory, newHistoryItem] : [newHistoryItem];

    // Optimistic local update
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status: 'Accepted',
          statusHistory: updatedHistory,
        };
      })
    );

    // Persist to Firestore
    try {
      await updateOrderInFirestore(orderId, {
        status: 'Accepted',
        statusHistory: updatedHistory,
      });
    } catch (err) {
      console.warn('Firestore update order error:', err);
    }

    showSuccess(
      isHindi ? 'ऑर्डर स्वीकार कर लिया गया है!' : 'Order Accepted Successfully!',
      isHindi ? 'खरीदार को सूचना भेज दी गई है। कृपया फसल पैक करें।' : 'Buyer notified. Please prepare produce for dispatch.'
    );
  };

  const handleRejectOrder = async (orderId: string, reason: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const now = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newHistoryItem = {
      status: 'Rejected' as const,
      timestamp: `${now}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      note: `Order declined by farmer: ${reason}. Escrow funds refunded.`,
      actor: 'Farmer' as const,
    };

    const updatedHistory = targetOrder ? [...targetOrder.statusHistory, newHistoryItem] : [newHistoryItem];

    // Optimistic local update
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status: 'Rejected',
          escrowStatus: 'Refunded',
          statusHistory: updatedHistory,
        };
      })
    );

    // Persist to Firestore
    try {
      await updateOrderInFirestore(orderId, {
        status: 'Rejected',
        escrowStatus: 'Refunded',
        statusHistory: updatedHistory,
      });
    } catch (err) {
      console.warn('Firestore reject order error:', err);
    }

    showInfo(
      isHindi ? 'ऑर्डर अस्वीकार किया गया' : 'Order Declined',
      isHindi ? `कारण: ${reason}। सुरक्षित एस्क्रो राशि खरीदार को वापस कर दी गई है।` : `Reason: ${reason}. Escrow deposit refunded.`
    );
  };

  const handleMarkInTransit = async (
    orderId: string,
    vehicleNumber: string,
    driverName?: string,
    driverPhone?: string
  ) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const now = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const updatedDeliveryDetails = {
      ...targetOrder?.deliveryDetails,
      vehicleNumber,
      driverName: driverName || 'Assigned Driver',
      driverPhone: driverPhone || '+91 98XXX XXXXX',
      dispatchDate: now,
      estimatedDelivery: '3 Business Days',
    };

    const newHistoryItem = {
      status: 'In Transit' as const,
      timestamp: `${now}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      note: `Batch dispatched on truck #${vehicleNumber}. Driver: ${driverName || 'Assigned'}.`,
      actor: 'Farmer' as const,
    };

    const updatedHistory = targetOrder ? [...targetOrder.statusHistory, newHistoryItem] : [newHistoryItem];

    // Optimistic local update
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status: 'In Transit',
          deliveryDetails: updatedDeliveryDetails,
          statusHistory: updatedHistory,
        };
      })
    );

    // Persist to Firestore
    try {
      await updateOrderInFirestore(orderId, {
        status: 'In Transit',
        deliveryDetails: updatedDeliveryDetails,
        statusHistory: updatedHistory,
      });
    } catch (err) {
      console.warn('Firestore in-transit order error:', err);
    }

    showSuccess(
      isHindi ? 'फसल गाड़ी रवाना हो चुकी है!' : 'Produce Dispatched (In Transit)!',
      isHindi ? `गाड़ी नंबर: ${vehicleNumber}। खरीदार सीधे ट्रैक कर सकता है।` : `Vehicle ${vehicleNumber} is on the road.`
    );
  };

  const handleMarkCompleted = async (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const now = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const updatedDeliveryDetails = {
      ...targetOrder?.deliveryDetails,
      deliveryDate: now,
    };

    const newHistoryItem = {
      status: 'Completed' as const,
      timestamp: `${now}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      note: `Delivery confirmed. Escrow payment of ₹${(targetOrder?.totalAmount || 0).toLocaleString('en-IN')} released to farmer bank account.`,
      actor: 'System' as const,
    };

    const updatedHistory = targetOrder ? [...targetOrder.statusHistory, newHistoryItem] : [newHistoryItem];

    // Optimistic local update
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status: 'Completed',
          escrowStatus: 'Payment Released',
          deliveryDetails: updatedDeliveryDetails,
          statusHistory: updatedHistory,
        };
      })
    );

    // Persist to Firestore
    try {
      await updateOrderInFirestore(orderId, {
        status: 'Completed',
        escrowStatus: 'Payment Released',
        deliveryDetails: updatedDeliveryDetails,
        statusHistory: updatedHistory,
      });
    } catch (err) {
      console.warn('Firestore complete order error:', err);
    }

    showSuccess(
      isHindi ? 'डिलीवरी और भुगतान पूरा हुआ!' : 'Delivery Confirmed & Escrow Released!',
      isHindi ? 'रुपये सीधे किसान के खाते में भेज दिए गए हैं।' : 'Funds successfully transferred to farmer account.'
    );
  };

  const handleCancelOrder = async (orderId: string, reason: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    const now = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newHistoryItem = {
      status: 'Cancelled' as const,
      timestamp: `${now}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      note: `Order cancelled by buyer: ${reason}. Escrow refund initiated.`,
      actor: 'Buyer' as const,
    };

    const updatedHistory = targetOrder ? [...targetOrder.statusHistory, newHistoryItem] : [newHistoryItem];

    // Optimistic local update
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status: 'Cancelled',
          escrowStatus: 'Refunded',
          statusHistory: updatedHistory,
        };
      })
    );

    // Persist to Firestore
    try {
      await updateOrderInFirestore(orderId, {
        status: 'Cancelled',
        escrowStatus: 'Refunded',
        statusHistory: updatedHistory,
      });
    } catch (err) {
      console.warn('Firestore cancel order error:', err);
    }

    showInfo(
      isHindi ? 'ऑर्डर रद्द कर दिया गया' : 'Order Cancelled',
      isHindi ? 'आपकी अग्रिम राशि वापस सुरक्षित कर दी गई है।' : 'Deposit has been refunded to your account.'
    );
  };

  const handlePlaceOrder = async (cropId: string, quantity: number, deliveryAddress: string) => {
    const crop = crops.find((c) => c.id === cropId) || INITIAL_MARKETPLACE_CROPS.find((c) => c.id === cropId);
    const newOrderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const price = crop ? crop.expectedPrice : 2600;
    const totalAmount = price * quantity;

    const newOrder: Order = {
      id: newOrderId,
      buyer: {
        name: currentUser?.name || 'AgroFoods Procurement Hub',
        company: currentUser?.specializationOrBusiness || 'AgroFoods Procurement Hub',
        phone: currentUser?.phone || '+91 98101 22334',
        email: currentUser?.email || 'procure@agrofoodshub.com',
        location: currentUser?.location || 'Azadpur Mandi, Delhi NCR',
        deliveryAddress: deliveryAddress || 'Warehouse Block C-14, Azadpur Wholesale Terminal, Delhi',
      },
      farmer: {
        name: crop?.farmerName || 'Ramesh Patel',
        phone: crop?.farmerPhone || '+91 98260 12345',
        location: crop?.location || 'Ujjain, Madhya Pradesh',
        cluster: crop?.clusterLocation || 'Malwa Agro Cluster, Ujjain MP',
        rating: crop?.farmerRating || 4.9,
      },
      crop: {
        id: cropId,
        name: crop ? crop.cropName : 'Premium Harvest Crop',
        hindiName: crop?.hindiName,
        category: crop ? crop.category : 'Grains & Cereals',
        variety: crop?.variety || 'Certified Pure Seed',
        qualityGrade: crop?.qualityGrade || 'Grade A+ (Premium Export)',
        imageUrl: crop?.imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
        moisturePercent: crop?.moisturePercent || 10.0,
      },
      quantity: quantity,
      unit: crop?.unit || 'Quintals',
      price: price,
      totalAmount: totalAmount,
      location: {
        pickupLocation: crop?.location ? `Farm Silo Depot, ${crop.location}` : 'Farm Silo Depot, Ujjain, MP',
        deliveryAddress: deliveryAddress || 'Warehouse Block C-14, Azadpur Wholesale Terminal, Delhi',
      },
      orderDate: now,
      status: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          timestamp: `${now}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          note: `New procurement order placed by buyer. 100% Escrow deposit locked (₹${totalAmount.toLocaleString('en-IN')}).`,
          actor: 'Buyer',
        },
      ],
      deliveryDetails: {
        estimatedDelivery: '3-4 Business Days',
      },
      escrowStatus: 'Escrow Protected',
      notes: 'Direct farm procurement. Quality moisture inspection upon weighbridge arrival.',
      buyerUid: currentUser?.uid || auth.currentUser?.uid || 'demo-buyer-agrofoods',
      farmerUid: crop?.farmerUid || 'demo-farmer-ramesh',
    };

    // Optimistic local state update
    setOrders((prev) => [newOrder, ...prev]);

    // Persist to Firestore
    try {
      await createOrderInFirestore(newOrder, currentUser?.uid);
    } catch (err) {
      console.warn('Firestore place order error:', err);
    }

    showSuccess(
      isHindi ? `ऑर्डर #${newOrderId} सफलतापूर्वक दर्ज हुआ!` : `Order #${newOrderId} Placed!`,
      isHindi ? 'किसान स्वीकृति के बाद माल रवाना होगा। सुरक्षित एस्क्रो लॉक है।' : 'Order placed safely in escrow.'
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAF5] flex flex-col selection:bg-[#1B4332] selection:text-white">
      {/* Reusable Top Navbar */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Routed Content */}
      <div className="flex-1 pb-16 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoute}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="h-full"
          >
            {currentRoute === 'landing' && (
              <LandingPage onNavigate={handleNavigate} />
            )}

            {currentRoute === 'role-select' && (
              <RoleSelect onNavigate={handleNavigate} />
            )}

            {currentRoute === 'farmer-login' && (
              <AuthFarmer
                mode="login"
                onNavigate={handleNavigate}
                onLoginSuccess={handleFarmerLoginSuccess}
              />
            )}

            {currentRoute === 'farmer-register' && (
              <AuthFarmer
                mode="register"
                onNavigate={handleNavigate}
                onLoginSuccess={handleFarmerLoginSuccess}
              />
            )}

            {currentRoute === 'buyer-login' && (
              <AuthBuyer
                mode="login"
                onNavigate={handleNavigate}
                onLoginSuccess={handleBuyerLoginSuccess}
              />
            )}

            {currentRoute === 'buyer-register' && (
              <AuthBuyer
                mode="register"
                onNavigate={handleNavigate}
                onLoginSuccess={handleBuyerLoginSuccess}
              />
            )}

            {currentRoute === 'farmer-dashboard' && (
              <FarmerDashboard
                currentUser={currentUser}
                onLogout={handleLogout}
                onNavigate={handleNavigate}
                orders={orders}
                onAcceptOrder={handleAcceptOrder}
                onRejectOrder={handleRejectOrder}
                onMarkInTransit={handleMarkInTransit}
                onMarkCompleted={handleMarkCompleted}
              />
            )}

            {currentRoute === 'buyer-dashboard' && (
              <BuyerDashboard
                currentUser={currentUser}
                onLogout={handleLogout}
                onNavigate={handleNavigate}
                orders={orders}
                onCancelOrder={handleCancelOrder}
                onPlaceOrder={handlePlaceOrder}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </LanguageProvider>
  );
}
