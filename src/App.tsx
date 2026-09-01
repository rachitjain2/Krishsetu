import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { RoleSelect } from './components/RoleSelect';
import { AuthFarmer } from './components/AuthFarmer';
import { AuthBuyer } from './components/AuthBuyer';
import { FarmerDashboard } from './components/FarmerDashboard';
import { BuyerDashboard } from './components/BuyerDashboard';
import { AppRoute, UserProfile, Order } from './types';
import { INITIAL_ORDERS } from './data/ordersData';
import { INITIAL_MARKETPLACE_CROPS } from './data/marketplaceData';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('landing');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

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
  };

  const handleBuyerLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentRoute('buyer-dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRoute('landing');
  };

  // ORDER HANDLERS
  const handleAcceptOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const now = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        return {
          ...order,
          status: 'Accepted',
          statusHistory: [
            ...order.statusHistory,
            {
              status: 'Accepted',
              timestamp: `${now}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              note: `Farmer ${order.farmer.name} accepted the order. Packing in progress.`,
              actor: 'Farmer',
            },
          ],
        };
      })
    );
  };

  const handleRejectOrder = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const now = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        return {
          ...order,
          status: 'Rejected',
          escrowStatus: 'Refunded',
          statusHistory: [
            ...order.statusHistory,
            {
              status: 'Rejected',
              timestamp: `${now}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              note: `Order declined by farmer: ${reason}. Escrow funds refunded.`,
              actor: 'Farmer',
            },
          ],
        };
      })
    );
  };

  const handleMarkInTransit = (
    orderId: string,
    vehicleNumber: string,
    driverName?: string,
    driverPhone?: string
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const now = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        return {
          ...order,
          status: 'In Transit',
          deliveryDetails: {
            ...order.deliveryDetails,
            vehicleNumber,
            driverName: driverName || 'Assigned Driver',
            driverPhone: driverPhone || '+91 98XXX XXXXX',
            dispatchDate: now,
            estimatedDelivery: '3 Business Days',
          },
          statusHistory: [
            ...order.statusHistory,
            {
              status: 'In Transit',
              timestamp: `${now}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              note: `Batch dispatched on truck #${vehicleNumber}. Driver: ${driverName || 'Assigned'}.`,
              actor: 'Farmer',
            },
          ],
        };
      })
    );
  };

  const handleMarkCompleted = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const now = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        return {
          ...order,
          status: 'Completed',
          escrowStatus: 'Payment Released',
          deliveryDetails: {
            ...order.deliveryDetails,
            deliveryDate: now,
          },
          statusHistory: [
            ...order.statusHistory,
            {
              status: 'Completed',
              timestamp: `${now}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              note: `Delivery confirmed. Escrow payment of ₹${order.totalAmount.toLocaleString('en-IN')} released to farmer bank account.`,
              actor: 'System',
            },
          ],
        };
      })
    );
  };

  const handleCancelOrder = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const now = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
        return {
          ...order,
          status: 'Cancelled',
          escrowStatus: 'Refunded',
          statusHistory: [
            ...order.statusHistory,
            {
              status: 'Cancelled',
              timestamp: `${now}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              note: `Order cancelled by buyer: ${reason}. Escrow refund initiated.`,
              actor: 'Buyer',
            },
          ],
        };
      })
    );
  };

  const handlePlaceOrder = (cropId: string, quantity: number, deliveryAddress: string) => {
    const crop = INITIAL_MARKETPLACE_CROPS.find((c) => c.id === cropId);
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
    };

    setOrders((prev) => [newOrder, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-200 selection:text-emerald-900">
      {/* Reusable Top Navbar */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Routed Content */}
      <div className="flex-1">
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
