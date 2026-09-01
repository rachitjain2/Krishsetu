import React, { useState } from 'react';
import {
  Wheat,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Award,
  Tag,
  Sparkles,
  Image as ImageIcon,
  Upload,
  X,
  Search,
  Filter,
  ArrowUpDown,
  IndianRupee,
  Layers,
  FileText,
  Share2,
  Check,
  RefreshCw,
  Eye,
  AlertTriangle,
  BadgeCheck,
  ChevronDown,
  Info
} from 'lucide-react';
import { CropListing, UserProfile } from '../types';

interface MyCropsProps {
  currentUser: UserProfile | null;
  cropListings: CropListing[];
  onAddCrop: (crop: CropListing) => void;
  onUpdateCrop: (crop: CropListing) => void;
  onDeleteCrop: (id: string) => void;
  onToggleSold: (id: string) => void;
  onFindBuyers?: (cropName: string) => void;
  isAddModalOpenInitially?: boolean;
  onCloseAddModal?: () => void;
}

// Preset crop sample images for quick selection in the upload UI
const PRESET_CROP_IMAGES: { name: string; category: string; url: string }[] = [
  {
    name: 'Wheat (गेहूं)',
    category: 'Grains & Cereals',
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Mustard (सरसों)',
    category: 'Oilseeds',
    url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Desi Chana (चना)',
    category: 'Pulses & Dal',
    url: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Basmati Rice (चावल)',
    category: 'Grains & Cereals',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Red Onion (प्याज)',
    category: 'Vegetables',
    url: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Fresh Potato (आलू)',
    category: 'Vegetables',
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Soybean (सोयाबीन)',
    category: 'Oilseeds',
    url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Cotton (कपास)',
    category: 'Cash Crops',
    url: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
  },
];

const CROP_CATEGORIES = [
  'All Categories',
  'Grains & Cereals',
  'Pulses & Dal',
  'Oilseeds',
  'Vegetables',
  'Fruits',
  'Cash Crops',
  'Spices',
];

const CROP_SUGGESTIONS = [
  { name: 'Sharbati Premium Wheat', hindi: 'शरबती प्रीमियम गेहूं', category: 'Grains & Cereals', defaultPrice: 2600, unit: 'Quintals' },
  { name: 'Yellow Mustard Seed', hindi: 'पीली सरसों', category: 'Oilseeds', defaultPrice: 5450, unit: 'Quintals' },
  { name: 'Desi Chana (Bengal Gram)', hindi: 'देसी चना', category: 'Pulses & Dal', defaultPrice: 4900, unit: 'Quintals' },
  { name: 'Basmati 1121 Paddy', hindi: 'बासमती धान', category: 'Grains & Cereals', defaultPrice: 3800, unit: 'Quintals' },
  { name: 'Nasik Red Onion', hindi: 'लाल प्याज', category: 'Vegetables', defaultPrice: 1800, unit: 'Quintals' },
  { name: 'Yellow Soybean', hindi: 'पीला सोयाबीन', category: 'Oilseeds', defaultPrice: 4600, unit: 'Quintals' },
  { name: 'Desi Garlic (Lahsun)', hindi: 'देसी लहसुन', category: 'Spices', defaultPrice: 11000, unit: 'Quintals' },
  { name: 'Shankar-6 Raw Cotton', hindi: 'कपास (नरमा)', category: 'Cash Crops', defaultPrice: 7200, unit: 'Quintals' },
];

export const MyCrops: React.FC<MyCropsProps> = ({
  currentUser,
  cropListings,
  onAddCrop,
  onUpdateCrop,
  onDeleteCrop,
  onToggleSold,
  onFindBuyers,
  isAddModalOpenInitially = false,
  onCloseAddModal,
}) => {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(isAddModalOpenInitially);
  const [editingCrop, setEditingCrop] = useState<CropListing | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Active' | 'Under Offer' | 'Sold'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-desc' | 'price-asc' | 'qty-desc'>('newest');

  // Form states for Add / Edit
  const [formCropName, setFormCropName] = useState('');
  const [formHindiName, setFormHindiName] = useState('');
  const [formCategory, setFormCategory] = useState('Grains & Cereals');
  const [formQuantity, setFormQuantity] = useState<string>('');
  const [formUnit, setFormUnit] = useState('Quintals');
  const [formExpectedPrice, setFormExpectedPrice] = useState<string>('');
  const [formLocation, setFormLocation] = useState(currentUser?.location || 'Ujjain, Madhya Pradesh');
  const [formHarvestDate, setFormHarvestDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [formQualityGrade, setFormQualityGrade] = useState('Grade A+ (Premium Export)');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Synchronize modal open state if controlled from outside
  React.useEffect(() => {
    if (isAddModalOpenInitially) {
      handleOpenAddModal();
    }
  }, [isAddModalOpenInitially]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const handleOpenAddModal = () => {
    setEditingCrop(null);
    setFormCropName('');
    setFormHindiName('');
    setFormCategory('Grains & Cereals');
    setFormQuantity('');
    setFormUnit('Quintals');
    setFormExpectedPrice('');
    setFormLocation(currentUser?.location || 'Ujjain Cluster, Madhya Pradesh');
    const d = new Date();
    setFormHarvestDate(d.toISOString().split('T')[0]);
    setFormQualityGrade('Grade A+ (Premium Export)');
    setFormDescription('Naturally sun-dried harvest. Moisture content tested under 11%. Stored in clean, moisture-proof jute bags at farm warehouse.');
    setFormImageUrl(PRESET_CROP_IMAGES[0].url);
    setFormImagePreview(PRESET_CROP_IMAGES[0].url);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (crop: CropListing) => {
    setEditingCrop(crop);
    setFormCropName(crop.cropName);
    setFormHindiName(crop.hindiName || '');
    setFormCategory(crop.category || 'Grains & Cereals');
    setFormQuantity(crop.quantity.toString());
    setFormUnit(crop.unit || 'Quintals');
    setFormExpectedPrice(crop.expectedPrice.toString());
    setFormLocation(crop.location);
    // Parse date if possible
    setFormHarvestDate(crop.harvestDate.includes('-') ? crop.harvestDate : new Date().toISOString().split('T')[0]);
    setFormQualityGrade(crop.qualityGrade);
    setFormDescription(crop.description || '');
    setFormImageUrl(crop.imageUrl || '');
    setFormImagePreview(crop.imageUrl || null);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingCrop(null);
    setFormError('');
    if (onCloseAddModal) {
      onCloseAddModal();
    }
  };

  // Preset suggestion quick select
  const handleSelectCropSuggestion = (item: typeof CROP_SUGGESTIONS[0]) => {
    setFormCropName(item.name);
    setFormHindiName(item.hindi);
    setFormCategory(item.category);
    setFormExpectedPrice(item.defaultPrice.toString());
    setFormUnit(item.unit);
    
    // Find matching preset image
    const matchedImg = PRESET_CROP_IMAGES.find((img) => img.category === item.category || item.name.toLowerCase().includes(img.name.split(' ')[0].toLowerCase()));
    if (matchedImg) {
      setFormImageUrl(matchedImg.url);
      setFormImagePreview(matchedImg.url);
    }
  };

  // Image Upload handler (File Reader or Preset)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormImageUrl(result);
        setFormImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCropName.trim()) {
      setFormError('Please enter a valid crop name.');
      return;
    }
    const qtyNum = parseFloat(formQuantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setFormError('Please enter a valid quantity greater than 0.');
      return;
    }
    const priceNum = parseFloat(formExpectedPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid expected price per unit.');
      return;
    }
    if (!formLocation.trim()) {
      setFormError('Please specify the farm location / Mandi cluster.');
      return;
    }

    if (editingCrop) {
      // Update existing crop
      const updated: CropListing = {
        ...editingCrop,
        cropName: formCropName.trim(),
        hindiName: formHindiName.trim() || undefined,
        category: formCategory,
        quantity: qtyNum,
        unit: formUnit,
        expectedPrice: priceNum,
        location: formLocation.trim(),
        harvestDate: formHarvestDate,
        qualityGrade: formQualityGrade,
        description: formDescription.trim(),
        imageUrl: formImageUrl || PRESET_CROP_IMAGES[0].url,
      };
      onUpdateCrop(updated);
      showToast(`Updated listing for "${updated.cropName}" successfully!`);
    } else {
      // Create new crop listing
      const newCrop: CropListing = {
        id: `KS-${formCropName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'CROP')}-${Math.floor(1000 + Math.random() * 9000)}`,
        cropName: formCropName.trim(),
        hindiName: formHindiName.trim() || undefined,
        category: formCategory,
        variety: formCropName.split(' ')[0],
        quantity: qtyNum,
        unit: formUnit,
        expectedPrice: priceNum,
        location: formLocation.trim(),
        harvestDate: formHarvestDate,
        qualityGrade: formQualityGrade,
        description: formDescription.trim(),
        status: 'Active',
        imageUrl: formImageUrl || PRESET_CROP_IMAGES[0].url,
        mandiBenchmarkPrice: Math.round(priceNum * 0.92),
        inquiriesCount: 0,
        clusterLocation: formLocation.trim(),
      };
      onAddCrop(newCrop);
      showToast(`Published "${newCrop.cropName}" (${newCrop.quantity} ${newCrop.unit}) to Kisan Exchange!`);
    }

    handleCloseModal();
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmationId) {
      const crop = cropListings.find((c) => c.id === deleteConfirmationId);
      onDeleteCrop(deleteConfirmationId);
      showToast(`Deleted listing ${crop ? `"${crop.cropName}"` : ''} from inventory.`);
      setDeleteConfirmationId(null);
    }
  };

  // Filtered and sorted listings
  const filteredListings = cropListings.filter((crop) => {
    const matchesSearch =
      crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (crop.hindiName && crop.hindiName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      crop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Categories' || crop.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'All' || crop.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'price-desc') return b.expectedPrice - a.expectedPrice;
    if (sortBy === 'price-asc') return a.expectedPrice - b.expectedPrice;
    if (sortBy === 'qty-desc') return b.quantity - a.quantity;
    return 0; // default newest
  });

  // Calculate high-level summary metrics
  const totalCropsCount = cropListings.length;
  const activeCropsCount = cropListings.filter((c) => c.status === 'Active').length;
  const underOfferCount = cropListings.filter((c) => c.status === 'Under Offer').length;
  const soldCropsCount = cropListings.filter((c) => c.status === 'Sold').length;
  const totalVolume = cropListings.reduce((sum, c) => sum + (c.status !== 'Sold' ? c.quantity : 0), 0);
  const totalEstimatedValue = cropListings
    .filter((c) => c.status !== 'Sold')
    .reduce((sum, c) => sum + c.quantity * c.expectedPrice, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#E8F0E5] border-2 border-[#1B4332] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#1B4332] shrink-0" />
            <p className="text-xs sm:text-sm font-black text-[#11281E]">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage('')}
            className="text-[#4D6B53] hover:text-[#11281E] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. MY CROPS HERO & INVENTORY STATS */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-[#1B4332]/15 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b-2 border-[#1B4332]/10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0E5] text-[#1B4332] text-[10px] font-black uppercase tracking-widest border border-[#1B4332]/20">
                <Wheat className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>Farmer Harvest Exchange • फसल प्रबंधन</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF3E0] text-[#8C6228] text-[10px] font-bold border border-[#E8D5B5]">
                <BadgeCheck className="w-3 h-3 text-[#8C6228]" />
                <span>Direct Farmer-To-Buyer Trading</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#11281E] flex items-center gap-2.5">
              <span>My Crops & Produce Inventory</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#4D6B53] font-bold mt-1 max-w-2xl">
              List new crop batches, configure asking rates, upload grain quality certifications, manage buyer inquiries, and mark sold inventories.
            </p>
          </div>

          {/* Prominent Add New Crop Button */}
          <button
            id="btn-open-add-crop-modal"
            onClick={handleOpenAddModal}
            className="py-3 px-6 bg-[#1B4332] text-white hover:bg-[#2D5A27] transition-all rounded-full text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 border-2 border-[#1B4332] shadow-sm shrink-0 cursor-pointer group"
          >
            <PlusCircle className="w-5 h-5 text-[#E8D5B5] group-hover:scale-110 transition-transform" />
            <span>Add New Crop Batch (नई फसल जोड़ें)</span>
          </button>
        </div>

        {/* Inventory Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-[#F8FAF5] border-2 border-[#1B4332]/15">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
              Total Listed Batches
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#11281E]">{totalCropsCount}</span>
              <span className="text-xs text-[#8FA396] font-bold">Batches</span>
            </div>
            <span className="text-[10px] font-bold text-[#4D6B53] mt-1 block">कुल दर्ज फसलें</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#E8F0E5] border-2 border-[#1B4332]/20">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1B4332] block">
              Active on Exchange
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#1B4332]">{activeCropsCount}</span>
              <span className="text-xs text-[#2D5A27] font-bold">Ready for Bids</span>
            </div>
            <span className="text-[10px] font-bold text-[#2D5A27] mt-1 block">सक्रिय बिक्री हेतु</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF3E0] border-2 border-[#E8D5B5]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8C6228] block">
              Under Buyer Offer
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#8C6228]">{underOfferCount}</span>
              <span className="text-xs text-[#8C6228] font-bold">Proposals</span>
            </div>
            <span className="text-[10px] font-bold text-[#8C6228] mt-1 block">मोलभाव जारी</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border-2 border-[#1B4332]/15">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block">
              Active Stock Value
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-[#11281E]">
                ₹{totalEstimatedValue > 100000 ? `${(totalEstimatedValue / 100000).toFixed(2)} Lakh` : totalEstimatedValue.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#4D6B53] mt-1 block">
              {totalVolume} Quintals / Units
            </span>
          </div>
        </div>
      </div>

      {/* 2. SEARCH, CATEGORY FILTER, & CONTROLS */}
      <div className="bg-white p-5 rounded-[28px] border-2 border-[#1B4332]/15 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crops by name, variety, district, batch ID (e.g. Sharbati, Mustard, Ujjain)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332] placeholder:text-[#8FA396]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8FA396] hover:text-[#11281E]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(['All', 'Active', 'Under Offer', 'Sold'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                  selectedStatus === status
                    ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                    : 'bg-white text-[#4D6B53] border-[#1B4332]/20 hover:bg-[#F8FAF5]'
                }`}
              >
                {status === 'All' ? 'All Status' : status}
                {status === 'Sold' && soldCropsCount > 0 && ` (${soldCropsCount})`}
                {status === 'Active' && ` (${activeCropsCount})`}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-[#4D6B53]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2 px-3 rounded-xl border-2 border-[#1B4332]/20 text-xs font-black uppercase tracking-wider text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="qty-desc">Quantity: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#1B4332]/10 scrollbar-thin">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] shrink-0">
            Categories:
          </span>
          {CROP_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#E8F0E5] text-[#1B4332] font-black border border-[#1B4332]/30'
                  : 'text-[#4D6B53] hover:bg-[#F8FAF5] border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CROP LISTINGS GRID / CARDS */}
      {filteredListings.length === 0 ? (
        <div className="bg-white p-12 rounded-[32px] border-2 border-dashed border-[#1B4332]/25 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E8F0E5] text-[#1B4332] mx-auto flex items-center justify-center border-2 border-[#1B4332]/20">
            <Wheat className="w-8 h-8 text-[#1B4332]" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-black uppercase tracking-tight text-[#11281E]">
              No Crop Listings Found
            </h3>
            <p className="text-xs text-[#4D6B53] font-bold mt-1">
              {searchQuery || selectedCategory !== 'All Categories' || selectedStatus !== 'All'
                ? 'No crop matches your active filter criteria. Try resetting filters or search query.'
                : 'You have not listed any crop batches yet. Click below to add your first harvest batch!'}
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {(searchQuery || selectedCategory !== 'All Categories' || selectedStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Categories');
                  setSelectedStatus('All');
                }}
                className="py-2 px-4 rounded-full border-2 border-[#1B4332]/20 text-xs font-black uppercase tracking-wider text-[#4D6B53] hover:bg-[#F8FAF5]"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={handleOpenAddModal}
              className="py-2.5 px-5 rounded-full bg-[#1B4332] text-white hover:bg-[#2D5A27] text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List First Crop Batch</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredListings.map((crop) => {
            const isSold = crop.status === 'Sold';
            const isUnderOffer = crop.status === 'Under Offer';
            const isActive = crop.status === 'Active';

            return (
              <div
                key={crop.id}
                id={`crop-card-${crop.id}`}
                className={`bg-white rounded-[32px] border-2 transition-all flex flex-col justify-between overflow-hidden shadow-xs ${
                  isSold
                    ? 'border-gray-200 bg-gray-50/70 opacity-90'
                    : isUnderOffer
                    ? 'border-[#E8D5B5] hover:border-[#8C6228]'
                    : 'border-[#1B4332]/20 hover:border-[#1B4332]'
                }`}
              >
                <div>
                  {/* Top Image + Status Header */}
                  <div className="relative h-44 w-full bg-[#E8F0E5] overflow-hidden border-b-2 border-[#1B4332]/10">
                    <img
                      src={crop.imageUrl || PRESET_CROP_IMAGES[0].url}
                      alt={crop.cropName}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
                        isSold ? 'grayscale' : ''
                      }`}
                      onError={(e) => {
                        // Fallback image if remote url fails
                        (e.target as HTMLImageElement).src = PRESET_CROP_IMAGES[0].url;
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#11281E]/70 via-transparent to-black/20" />

                    {/* Status Badge */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-xs ${
                          isSold
                            ? 'bg-gray-800 text-gray-200 border-gray-600'
                            : isUnderOffer
                            ? 'bg-[#FAF3E0] text-[#8C6228] border-[#E8D5B5]'
                            : 'bg-[#1B4332] text-white border-[#1B4332]'
                        }`}
                      >
                        {crop.status === 'Sold' ? '✓ Sold Batch (बिक चुकी)' : crop.status === 'Under Offer' ? '⚡ Under Offer' : '● Live on Exchange'}
                      </span>
                    </div>

                    {/* Batch ID Badge */}
                    <div className="absolute top-3.5 right-3.5">
                      <span className="text-[10px] font-mono font-bold bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-full border border-white/20">
                        {crop.id}
                      </span>
                    </div>

                    {/* Category pill on image */}
                    <div className="absolute bottom-3 left-3.5">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-white/90 backdrop-blur-xs text-[#11281E] px-2.5 py-0.5 rounded-full border border-white/50">
                        {crop.category || 'Agricultural Produce'}
                      </span>
                    </div>
                  </div>

                  {/* Card Main Body */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-[#11281E] leading-snug">
                        {crop.cropName}
                      </h3>
                      {crop.hindiName && (
                        <p className="text-xs text-[#4D6B53] font-bold mt-0.5">{crop.hindiName}</p>
                      )}
                    </div>

                    {/* Key Attributes Box */}
                    <div className="p-3.5 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/15 space-y-2 text-xs">
                      {/* Quantity */}
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#4D6B53] flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>Quantity (मात्रा):</span>
                        </span>
                        <span className="text-sm font-black text-[#11281E]">
                          {crop.quantity} {crop.unit || 'Quintals'}
                        </span>
                      </div>

                      {/* Expected Price */}
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#4D6B53] flex items-center gap-1.5">
                          <IndianRupee className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>Expected Price:</span>
                        </span>
                        <span className="text-sm font-black text-[#1B4332]">
                          ₹{crop.expectedPrice.toLocaleString('en-IN')} / {crop.unit ? crop.unit.replace(/s$/, '') : 'Qtl'}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#4D6B53] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>Location (स्थान):</span>
                        </span>
                        <span className="text-[#11281E] font-black truncate max-w-[170px] text-right">
                          {crop.location}
                        </span>
                      </div>

                      {/* Harvest Date */}
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-[#4D6B53] flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>Harvest Date:</span>
                        </span>
                        <span className="text-[#11281E] font-bold">
                          {crop.harvestDate}
                        </span>
                      </div>

                      {/* Quality Grade */}
                      <div className="flex items-center justify-between font-bold pt-1 border-t border-[#1B4332]/10">
                        <span className="text-[#4D6B53] flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#8C6228]" />
                          <span>Quality / Grade:</span>
                        </span>
                        <span className="text-xs font-black text-[#11281E] bg-white px-2 py-0.5 rounded-lg border border-[#1B4332]/10">
                          {crop.qualityGrade}
                        </span>
                      </div>
                    </div>

                    {/* Description snippet */}
                    {crop.description && (
                      <p className="text-xs text-[#4D6B53] font-medium line-clamp-2 leading-relaxed bg-[#FAFBF8] p-2.5 rounded-xl border border-dashed border-[#1B4332]/15">
                        <span className="font-bold text-[#11281E]">Details: </span>
                        {crop.description}
                      </p>
                    )}

                    {/* Mandi Benchmark comparison pill */}
                    {crop.mandiBenchmarkPrice && (
                      <div className="flex items-center justify-between text-[11px] font-bold px-3 py-1.5 rounded-xl bg-[#E8F0E5]/60 border border-[#1B4332]/15 text-[#2C4A38]">
                        <span>MSP Mandi Benchmark:</span>
                        <span className="font-black text-[#11281E]">
                          ₹{crop.mandiBenchmarkPrice.toLocaleString('en-IN')} / Qtl
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. ACTIONS FOOTER: Edit, Delete, Mark as Sold, Share */}
                <div className="p-5 pt-3 border-t-2 border-[#1B4332]/10 bg-[#FAFBF8] space-y-2.5">
                  {/* Mark as Sold / Active toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      id={`btn-toggle-sold-${crop.id}`}
                      onClick={() => {
                        onToggleSold(crop.id);
                        showToast(
                          isSold
                            ? `Re-activated listing "${crop.cropName}" on exchange!`
                            : `Marked "${crop.cropName}" as SOLD! Total value completed.`
                        );
                      }}
                      className={`flex-1 py-2 px-3 rounded-full text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border shadow-2xs ${
                        isSold
                          ? 'bg-[#1B4332] text-white hover:bg-[#2D5A27] border-[#1B4332]'
                          : 'bg-white text-[#11281E] hover:bg-emerald-50 hover:text-[#1B4332] border-[#1B4332]/25'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 text-[#2D5A27]" />
                      <span>{isSold ? 'Reactivate Batch' : 'Mark as Sold (बिका हुआ)'}</span>
                    </button>

                    {onFindBuyers && !isSold && (
                      <button
                        onClick={() => onFindBuyers(crop.cropName)}
                        className="py-2 px-3.5 bg-[#E8F0E5] text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-colors rounded-full text-xs font-black uppercase tracking-wider border border-[#1B4332]/20"
                        title="Find Buyers for this crop"
                      >
                        Buyers
                      </button>
                    )}
                  </div>

                  {/* Edit & Delete Action Row */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      {/* Edit Button */}
                      <button
                        id={`btn-edit-crop-${crop.id}`}
                        onClick={() => handleOpenEditModal(crop)}
                        className="py-1.5 px-3 rounded-full bg-white text-[#11281E] hover:bg-[#E8F0E5] border border-[#1B4332]/20 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Edit Crop Listing Details"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#2D5A27]" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        id={`btn-delete-crop-${crop.id}`}
                        onClick={() => setDeleteConfirmationId(crop.id)}
                        className="py-1.5 px-3 rounded-full bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    {/* Share Link Button */}
                    <button
                      onClick={() => {
                        showToast(`Shareable direct link for #${crop.id} copied!`);
                      }}
                      className="p-1.5 rounded-full text-[#4D6B53] hover:text-[#11281E] hover:bg-white border border-transparent hover:border-[#1B4332]/20 transition-all"
                      title="Share Direct Listing Link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ADD NEW CROP / EDIT CROP MODAL FORM                                   */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div
          id="crop-form-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11281E]/60 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-white rounded-[32px] border-2 border-[#1B4332] shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#1B4332]/10 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#1B4332] text-white flex items-center justify-center shadow-xs border border-[#1B4332]">
                  <Wheat className="w-5 h-5 text-[#E8D5B5]" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#11281E]">
                    {editingCrop ? 'Edit Crop Listing' : 'Add New Crop Batch (नई फसल लिस्ट करें)'}
                  </h3>
                  <p className="text-xs text-[#4D6B53] font-bold">
                    {editingCrop ? `Updating batch ${editingCrop.id}` : 'Direct listing to Kisan Wholesale Buyer Exchange'}
                  </p>
                </div>
              </div>
              <button
                id="btn-close-crop-modal"
                onClick={handleCloseModal}
                className="p-2 text-[#4D6B53] hover:text-[#11281E] hover:bg-[#E8F0E5] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Error Alert */}
            {formError && (
              <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Quick Suggestions Pills (Only shown when adding new) */}
            {!editingCrop && (
              <div className="mt-4 p-3 rounded-2xl bg-[#F8FAF5] border border-[#1B4332]/15">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#4D6B53] block mb-2">
                  ⚡ Quick Select Popular Harvests / त्वरित चयन:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CROP_SUGGESTIONS.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleSelectCropSuggestion(item)}
                      className="px-2.5 py-1 rounded-full bg-white text-[#11281E] hover:bg-[#E8F0E5] border border-[#1B4332]/20 text-[11px] font-bold transition-all flex items-center gap-1"
                    >
                      <span>{item.name}</span>
                      <span className="text-[9px] text-[#4D6B53]">({item.hindi})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmitForm} className="mt-5 space-y-4">
              {/* Crop Name & Hindi Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    Crop Name / फसल का नाम <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="input-crop-name"
                    type="text"
                    value={formCropName}
                    onChange={(e) => setFormCropName(e.target.value)}
                    placeholder="e.g. Sharbati Premium Wheat"
                    className="w-full p-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    Hindi Name / किस्म (वैकल्पिक)
                  </label>
                  <input
                    id="input-hindi-name"
                    type="text"
                    value={formHindiName}
                    onChange={(e) => setFormHindiName(e.target.value)}
                    placeholder="e.g. शरबती सी-306 गेहूं"
                    className="w-full p-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                  Crop Category / फसल की श्रेणी <span className="text-rose-600">*</span>
                </label>
                <select
                  id="select-crop-category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                >
                  <option value="Grains & Cereals">Grains & Cereals (अनाज - गेहूं, धान, मक्का)</option>
                  <option value="Pulses & Dal">Pulses & Dal (दलहन - चना, मूंग, अरहर)</option>
                  <option value="Oilseeds">Oilseeds (तिलहन - सरसों, सोयाबीन, मूंगफली)</option>
                  <option value="Vegetables">Vegetables (सब्जियां - प्याज, आलू, टमाटर)</option>
                  <option value="Fruits">Fruits (फल - संतरा, केला, अनार)</option>
                  <option value="Cash Crops">Cash Crops (व्यापारिक फसल - कपास, गन्ना)</option>
                  <option value="Spices">Spices (मसाले - लहसुन, धनिया, जीरा, मिर्च)</option>
                </select>
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    Quantity / मात्रा <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="input-crop-quantity"
                    type="number"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    placeholder="e.g. 100"
                    min="1"
                    step="any"
                    className="w-full p-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    Unit / इकाई <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="select-crop-unit"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full p-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                  >
                    <option value="Quintals">Quintals (100 kg / क्विंटल)</option>
                    <option value="Kilograms">Kilograms (kg / किलोग्राम)</option>
                    <option value="Metric Tonnes">Metric Tonnes (टन)</option>
                    <option value="Bags (50kg)">Bags (50 kg Jute Bag)</option>
                    <option value="Crates">Crates (क्रेट्स)</option>
                  </select>
                </div>
              </div>

              {/* Expected Price & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    Expected Price (₹ per {formUnit.replace(/s$/, '')}) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-expected-price"
                      type="number"
                      value={formExpectedPrice}
                      onChange={(e) => setFormExpectedPrice(e.target.value)}
                      placeholder="e.g. 2600"
                      min="1"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    Location / Mandi Cluster <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-crop-location"
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="e.g. Ujjain Cluster, Madhya Pradesh"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Harvest Date & Quality Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    Harvest Date / कटाई की तारीख <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#4D6B53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-harvest-date"
                      type="date"
                      value={formHarvestDate}
                      onChange={(e) => setFormHarvestDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                    Quality / Grade (गुणवत्ता) <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="select-quality-grade"
                    value={formQualityGrade}
                    onChange={(e) => setFormQualityGrade(e.target.value)}
                    className="w-full p-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                  >
                    <option value="Grade A+ (Premium Export)">Grade A+ (Premium Export Quality)</option>
                    <option value="Grade A (Standard Commercial)">Grade A (Standard Commercial / Mill Grade)</option>
                    <option value="Grade B+ (Fair Average Quality FAQ)">Grade B+ (Fair Average Quality - FAQ)</option>
                    <option value="Grade B (Processing Grade)">Grade B (Processing Grade)</option>
                    <option value="Organic Certified Grade A">Organic Certified Grade A</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5">
                  Description & Specifications / विवरण
                </label>
                <textarea
                  id="textarea-crop-description"
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe moisture percentage, grain brightness, bag packaging type (Jute/HDPE), storage location, organic certification status..."
                  className="w-full p-3 rounded-2xl border-2 border-[#1B4332]/20 text-xs font-bold text-[#11281E] bg-[#F8FAF5] focus:outline-none focus:border-[#1B4332]"
                />
              </div>

              {/* Optional Image Upload UI */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#11281E] mb-1.5 flex items-center justify-between">
                  <span>Optional Crop Photo / फसल की तस्वीर</span>
                  <span className="text-[10px] text-[#4D6B53] font-bold">Max 5MB (JPG, PNG)</span>
                </label>

                {/* Upload Drag/Drop Box */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-[#1B4332]/25 bg-[#FAFBF8] flex flex-col sm:flex-row items-center gap-4">
                  {/* Current Preview */}
                  {formImagePreview ? (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#1B4332] shrink-0 shadow-xs">
                      <img
                        src={formImagePreview}
                        alt="Crop Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormImagePreview(null);
                          setFormImageUrl('');
                        }}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-black"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-[#E8F0E5] border-2 border-dashed border-[#1B4332]/30 flex flex-col items-center justify-center text-[#4D6B53] shrink-0">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-[9px] font-bold mt-1">No Image</span>
                    </div>
                  )}

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <p className="text-xs text-[#4D6B53] font-bold">
                      Upload actual photo from your farm or select from agricultural library presets below:
                    </p>
                    <label className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-white text-[#11281E] hover:bg-[#E8F0E5] border-2 border-[#1B4332]/20 text-xs font-black uppercase tracking-wider cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-[#2D5A27]" />
                      <span>Choose File from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Preset Crop Photo Selection Gallery */}
                <div className="mt-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA396] block mb-1.5">
                    Or Choose Realistic Sample Photo:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {PRESET_CROP_IMAGES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setFormImageUrl(preset.url);
                          setFormImagePreview(preset.url);
                        }}
                        className={`group relative rounded-xl overflow-hidden border-2 aspect-square transition-all ${
                          formImageUrl === preset.url
                            ? 'border-[#1B4332] ring-2 ring-[#1B4332]/30'
                            : 'border-transparent opacity-75 hover:opacity-100 hover:border-[#1B4332]/40'
                        }`}
                        title={preset.name}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-black truncate px-1 py-0.5">
                          {preset.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t-2 border-[#1B4332]/10 flex items-center justify-end gap-3 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="py-2.5 px-5 rounded-full border-2 border-[#1B4332]/20 text-xs font-black uppercase tracking-wider text-[#4D6B53] hover:bg-[#F8FAF5] transition-colors"
                >
                  Cancel (रद्द करें)
                </button>
                <button
                  id="btn-submit-crop-form"
                  type="submit"
                  className="py-2.5 px-6 rounded-full bg-[#1B4332] text-white hover:bg-[#2D5A27] text-xs font-black uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 border-2 border-[#1B4332]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#E8D5B5]" />
                  <span>{editingCrop ? 'Save Changes' : 'Publish Crop Listing'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DELETE CONFIRMATION MODAL                                              */}
      {/* ========================================================================= */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11281E]/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-[32px] border-2 border-rose-500 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto border-2 border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-lg font-black uppercase tracking-tight text-[#11281E]">
                Delete Crop Listing?
              </h4>
              <p className="text-xs text-[#4D6B53] font-bold">
                Are you sure you want to remove listing batch <span className="font-mono text-[#11281E]">{deleteConfirmationId}</span> from your inventory? This action cannot be undone.
              </p>
            </div>
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setDeleteConfirmationId(null)}
                className="flex-1 py-2.5 px-4 rounded-full border-2 border-[#1B4332]/20 text-xs font-black uppercase tracking-wider text-[#4D6B53] hover:bg-[#F8FAF5]"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-crop"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 px-4 rounded-full bg-rose-700 text-white hover:bg-rose-800 text-xs font-black uppercase tracking-wider shadow-xs"
              >
                Yes, Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
