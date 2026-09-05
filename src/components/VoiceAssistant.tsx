import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Wheat,
  TrendingUp,
  Tractor,
  Satellite,
  CreditCard,
  Store,
  ChevronRight,
  Radio,
  AlertCircle,
  CheckCircle2,
  Package,
  BadgeCheck,
  ShieldCheck,
  Building2,
  Navigation
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { UserProfile, AppRoute, CropListing, MachineItem, DbCrossReferenceResult } from '../types';
import { performNlpRefinementAndCrossReference } from '../lib/nlpRefinement';
import { INITIAL_MARKETPLACE_CROPS } from '../data/marketplaceData';
import { INITIAL_MACHINERY } from '../data/machineryData';

interface VoiceAssistantProps {
  currentUser: UserProfile | null;
  currentRoute: AppRoute;
  isOpenExternal?: boolean;
  onOpenExternal?: () => void;
  onCloseExternal?: () => void;
  onNavigateTab?: (tabId: string) => void;
  onOpenQuickCropListing?: () => void;
  marketplaceCrops?: CropListing[];
  machineryList?: MachineItem[];
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  translation?: string;
  timestamp: string;
  action?: {
    type: string;
    targetTab?: string;
    details?: string;
    filterCrop?: string;
  };
  quickChips?: string[];
  dbCrossReference?: DbCrossReferenceResult;
}

const SAMPLE_QUICK_VOICE_QUERIES = [
  {
    text: 'उज्जैन मंडी में आज शरबती गेहूं का क्या भाव है?',
    en: "What is today's Sharbati Wheat rate in Ujjain Mandi?",
    category: 'Mandi Rates',
  },
  {
    text: 'मुझे 50 क्विंटल चना बेचना है, लिस्ट कैसे करूं?',
    en: 'I want to sell 50 Quintals Gram, how do I list it?',
    category: 'Sell Crop',
  },
  {
    text: 'हार्वेस्टर या 50HP महिंद्रा ट्रैक्टर किराए पर कैसे मिलेगा?',
    en: 'How can I rent a Harvester or 50HP Mahindra tractor?',
    category: 'Machinery',
  },
  {
    text: 'मेरी गेहूं की फसल में पीलापन आ रहा है, क्या करूं?',
    en: 'My wheat crop leaves are turning yellow, what should I do?',
    category: 'Crop Doctor',
  },
  {
    text: 'मेरा किसान क्रेडिट ट्रस्ट स्कोर कितना है और लोन कैसे मिलेगा?',
    en: 'What is my Kisan credit score and how do I get a loan?',
    category: 'Credit Score',
  },
];

export const VoiceAssistantModal: React.FC<VoiceAssistantProps> = ({
  currentUser,
  currentRoute,
  isOpenExternal,
  onOpenExternal,
  onCloseExternal,
  onNavigateTab,
  onOpenQuickCropListing,
  marketplaceCrops = INITIAL_MARKETPLACE_CROPS,
  machineryList = INITIAL_MACHINERY,
}) => {
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  
  // Synchronize when parent prop changes
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpenInternal(isOpenExternal);
    }
  }, [isOpenExternal]);

  const isOpen = isOpenExternal !== undefined ? (isOpenExternal || isOpenInternal) : isOpenInternal;

  const setIsOpen = (open: boolean) => {
    setIsOpenInternal(open);
    if (open) {
      if (onOpenExternal) onOpenExternal();
    } else {
      if (onCloseExternal) onCloseExternal();
    }
  };
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [selectedLang, setSelectedLang] = useState<'Hindi' | 'English' | 'Marathi' | 'Punjabi'>('Hindi');
  const [loading, setLoading] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const [micPermissionStatus, setMicPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [hasWebSpeechSupport, setHasWebSpeechSupport] = useState<boolean>(true);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'नमस्ते! मैं कृषि सेतु आवाज सहायक (KrishiSetu Voice Copilot) हूँ। आप बोलकर मंडी भाव, फसल लिस्टिंग, ट्रैक्टर बुकिंग, या फसल बीमारी की सलाह ले सकते हैं।',
      translation:
        'Hello! I am your KrishiSetu Voice Copilot. Speak anytime to check mandi rates, list harvest produce, book machinery, or get instant crop diagnosis.',
      timestamp: 'Just now',
      quickChips: [
        'गेहूं का आज का मंडी भाव बताओ',
        'मेरी 50 क्विंटल फसल लिस्ट करो',
        'ट्रैक्टर किराए पर बुक करो',
      ],
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const { isHindi } = useLanguage();

  // Fallback client-side response generator in case network or backend is temporarily unreachable
  const generateClientFallback = (query: string, lang: string): { spokenReply: string; translation: string; action?: Message['action']; quickChips: string[] } => {
    const lower = (query || '').toLowerCase();
    const isHi = lang === 'Hindi';
    const isMr = lang === 'Marathi';
    const isPa = lang === 'Punjabi';

    // 1. Mandi Rates & Prices (धान, बासमती, गेहूं, सोयाबीन, सरसों, चना, कपास, मक्का, प्याज, लहसुन, आलू, टमाटर, दालें, मसाले, गन्ना, आदि)
    if (
      lower.includes('भाव') ||
      lower.includes('रेट') ||
      lower.includes('price') ||
      lower.includes('rate') ||
      lower.includes('mandi') ||
      lower.includes('मंडी') ||
      lower.includes('चावल') ||
      lower.includes('धान') ||
      lower.includes('rice') ||
      lower.includes('paddy') ||
      lower.includes('basmati') ||
      lower.includes('बासमती') ||
      lower.includes('गेहूं') ||
      lower.includes('wheat') ||
      lower.includes('सोयाबीन') ||
      lower.includes('soybean') ||
      lower.includes('सरसों') ||
      lower.includes('mustard') ||
      lower.includes('चना') ||
      lower.includes('chana') ||
      lower.includes('कपास') ||
      lower.includes('cotton') ||
      lower.includes('मक्का') ||
      lower.includes('maize') ||
      lower.includes('corn') ||
      lower.includes('लहसुन') ||
      lower.includes('garlic') ||
      lower.includes('प्याज') ||
      lower.includes('onion') ||
      lower.includes('आलू') ||
      lower.includes('potato') ||
      lower.includes('टमाटर') ||
      lower.includes('tomato') ||
      lower.includes('अरहर') ||
      lower.includes('तुअर') ||
      lower.includes('moong') ||
      lower.includes('मूंग') ||
      lower.includes('उड़द') ||
      lower.includes('urad') ||
      lower.includes('जीरा') ||
      lower.includes('jeera') ||
      lower.includes('हल्दी') ||
      lower.includes('turmeric') ||
      lower.includes('गन्ना') ||
      lower.includes('sugarcane') ||
      lower.includes('बाजरा') ||
      lower.includes('bajra') ||
      lower.includes('मूंगफली') ||
      lower.includes('groundnut')
    ) {
      // 1A. Rice & Paddy (धान और चावल)
      if (
        lower.includes('चावल') ||
        lower.includes('धान') ||
        lower.includes('rice') ||
        lower.includes('paddy') ||
        lower.includes('basmati') ||
        lower.includes('बासमती') ||
        lower.includes('1121') ||
        lower.includes('1509') ||
        lower.includes('masoori') ||
        lower.includes('मसूरी')
      ) {
        return {
          spokenReply: isHi
            ? 'आज बासमती 1121 धान का भाव ₹4,250 से ₹4,650 प्रति क्विंटल है, पूसा 1509 बासमती ₹3,350 से ₹3,700 प्रति क्विंटल और सामान्य धान (PR-126/हाइब्रिड) का सरकारी एमएसपी भाव ₹2,300 से ₹2,550 प्रति क्विंटल चल रहा है। थोक सोना मसूरी चावल ₹3,400 से ₹3,800/क्विंटल पर उपलब्ध है।'
            : isMr
            ? 'आज बासमती 1121 भाताचा भाव ₹4,250 ते ₹4,650 प्रति क्विंटल आहे, तर सर्वसाधारण भात ₹2,300 ते ₹2,550 प्रति क्विंटल आणि सोना मसुरी तांदूळ ₹3,400 ते ₹3,800 प्रति क्विंटल आहे.'
            : isPa
            ? 'ਅੱਜ ਬਾਸਮਤੀ 1121 ਝੋਨੇ ਦਾ ਭਾਅ ₹4,250 ਤੋਂ ₹4,650 ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਅਤੇ ਪੂਸਾ 1509 ਦਾ ਭਾਅ ₹3,350 ਤੋਂ ₹3,700 ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਹੈ। ਆਮ ਝੋਨਾ ₹2,300 ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਹੈ।'
            : 'Today, Basmati 1121 Paddy is trading at ₹4,250 - ₹4,650 per quintal, Pusa 1509 at ₹3,350 - ₹3,700/Qtl, and Common Paddy at ₹2,300 - ₹2,550/Qtl (Govt MSP: ₹2,300/Qtl). Wholesale Sona Masoori Rice is at ₹3,400 - ₹3,800/Qtl.',
          translation: 'Today, Basmati 1121 Paddy is ₹4,250 - ₹4,650/Qtl, Pusa 1509 is ₹3,350 - ₹3,700/Qtl, and Common Paddy is ₹2,300 - ₹2,550/Qtl (Govt MSP: ₹2,300/Qtl). Sona Masoori Rice is ₹3,400 - ₹3,800/Qtl.',
          action: { type: 'navigate', targetTab: 'market-prices', details: 'Check Rice & Paddy Mandi Rates' },
          quickChips: ['धान की फसल लिस्ट करें', 'गेहूं का आज का भाव', 'रिवर्स नीलामी देखें'],
        };
      }

      // 1B. Wheat (गेहूं)
      if (lower.includes('गेहूं') || lower.includes('wheat') || lower.includes('शरबती') || lower.includes('sharbati')) {
        return {
          spokenReply: isHi
            ? 'आज उज्जैन और इंदौर मंडी में शरबती गेहूं (C-306) का मॉडल भाव ₹2,650 से ₹2,780 प्रति क्विंटल चल रहा है। प्रीमियम ग्रेड लॉट को ₹2,850 तक की बोली मिल रही है और लोकवन गेहूं ₹2,450 से ₹2,580/क्विंटल है।'
            : isMr
            ? 'आज उज्जैन आणि इंदूर बाजारात शरबती गव्हाचा भाव ₹2,650 ते ₹2,780 प्रति क्विंटल आहे.'
            : isPa
            ? 'ਅੱਜ ਉਜੈਨ ਮੰਡੀ ਵਿੱਚ ਸ਼ਰਬਤੀ ਕਣਕ ਦਾ ਭਾਅ ₹2,650 ਤੋਂ ₹2,780 ਪ੍ਰਤੀ ਕੁਇੰਟਲ ਹੈ।'
            : 'Today Sharbati Wheat (C-306) is trading between ₹2,650 and ₹2,780 per quintal in Ujjain and Indore mandis, with premium lots reaching ₹2,850/Qtl.',
          translation: 'Today Sharbati Wheat (C-306) is trading between ₹2,650 and ₹2,780 per quintal in Ujjain and Indore mandis, with premium lots reaching ₹2,850/Qtl.',
          action: { type: 'navigate', targetTab: 'market-prices', details: 'Check Live Mandi Prices' },
          quickChips: ['चावल और धान का भाव', 'सोयाबीन का ताजा भाव क्या है?', 'चना और सरसों के आज के रेट'],
        };
      }
      // 1C. Chana / Gram (चना)
      if (lower.includes('चना') || lower.includes('chana') || lower.includes('gram') || lower.includes('chickpea')) {
        return {
          spokenReply: isHi
            ? 'आज मंडी में देसी चना (JG-11) ₹5,800 से ₹6,050 प्रति क्विंटल और काबुली चना ₹11,200 से ₹13,500 प्रति क्विंटल के मजबूत स्तर पर बिक रहा है।'
            : 'Today Desi Chana is trading strongly between ₹5,800 and ₹6,050 per quintal, with Kabuli Chana at ₹11,200 to ₹13,500/Qtl.',
          translation: 'Today Desi Chana is trading strongly between ₹5,800 and ₹6,050 per quintal in major pulse mandis.',
          action: { type: 'navigate', targetTab: 'market-prices', details: 'Check Pulse Mandi Rates' },
          quickChips: ['चना सीधे लिस्ट करें', 'शरबती गेहूं का भाव', 'फसल डॉक्टर सलाह'],
        };
      }
      // 1D. Soybean (सोयाबीन)
      if (lower.includes('सोयाबीन') || lower.includes('soy') || lower.includes('soybean')) {
        return {
          spokenReply: isHi
            ? 'आज इंदौर और उज्जैन मंडी में पीला सोयाबीन ₹4,680 से ₹4,850 प्रति क्विंटल पर चल रहा है। 10-12% नमी वाले साफ लॉट को सबसे ऊंचे भाव मिल रहे हैं।'
            : 'Today Yellow Soybean is trading between ₹4,680 and ₹4,850 per quintal in Madhya Pradesh mandis.',
          translation: 'Today Yellow Soybean is trading between ₹4,680 and ₹4,850 per quintal.',
          action: { type: 'navigate', targetTab: 'market-prices', details: 'Check Soybean Prices' },
          quickChips: ['सोयाबीन फसल लिस्ट करें', 'ट्रैक्टर बुकिंग करें', 'मंडी भाव देखें'],
        };
      }
      // 1E. Mustard (सरसों)
      if (lower.includes('सरसों') || lower.includes('mustard') || lower.includes('sarson') || lower.includes('राई')) {
        return {
          spokenReply: isHi
            ? 'पीली और काली सरसों का आज का मंडी भाव ₹5,300 से ₹5,520 प्रति क्विंटल चल रहा है। 42% तेल मात्रा वाले लॉट को ₹5,500+ तक का भाव मिल रहा है।'
            : 'Mustard seed is trading between ₹5,300 and ₹5,520 per quintal in major markets.',
          translation: 'Mustard seed is trading between ₹5,300 and ₹5,520 per quintal with high oil content batches receiving premium pricing.',
          action: { type: 'navigate', targetTab: 'market-prices', details: 'Check Mustard Prices' },
          quickChips: ['सरसों फसल लिस्ट करें', 'चना का आज का भाव', 'फसल डॉक्टर सलाह'],
        };
      }
      // 1F. Cotton (कपास)
      if (lower.includes('कपास') || lower.includes('cotton') || lower.includes('नरमा')) {
        return {
          spokenReply: isHi
            ? 'कपास का आज का मंडी भाव ₹7,100 से ₹7,480 प्रति क्विंटल है। सरकारी एमएसपी ₹7,121 (मध्यम रेशा) और ₹7,521 (लंबा रेशा) है।'
            : 'Cotton is trading at ₹7,100 to ₹7,480 per quintal against govt MSP of ₹7,121 to ₹7,521/Qtl.',
          translation: 'Cotton is trading between ₹7,100 and ₹7,480 per quintal in major agricultural hubs.',
          action: { type: 'navigate', targetTab: 'market-prices', details: 'Check Cotton Rates' },
          quickChips: ['कपास फसल लिस्ट करें', 'गुलाबी सुंडी नियंत्रण', 'मंडी भाव देखें'],
        };
      }
      // 1G. Garlic & Onion (लहसुन व प्याज)
      if (lower.includes('लहसुन') || lower.includes('garlic') || lower.includes('प्याज') || lower.includes('onion')) {
        return {
          spokenReply: isHi
            ? 'नीमच व मंदसौर मंडी में देसी लहसुन ₹14,500 से ₹16,500 प्रति क्विंटल और नासिक लाल प्याज का थोक भाव ₹1,850 से ₹2,250 प्रति क्विंटल चल रहा है।'
            : 'Neemuch Desi Garlic is trading at ₹14,500 to ₹16,500/Qtl, and Nashik Red Onion wholesale is at ₹1,850 to ₹2,250/Qtl.',
          translation: 'Neemuch Mandi Desi Garlic is at ₹14,500 - ₹16,500/Qtl, and Nashik Red Onion is at ₹1,850 - ₹2,250/Qtl.',
          action: { type: 'navigate', targetTab: 'market-prices', details: 'Check Spices & Veg Prices' },
          quickChips: ['लहसुन फसल लिस्ट करें', 'धान का भाव बताओ', 'मंडी भाव तुलना'],
        };
      }
      return {
        spokenReply: isHi
          ? 'मंडी में प्रमुख फसलों के आज के मॉडल भाव: बासमती धान ₹4,450/क्विंटल, सामान्य धान ₹2,320/क्विंटल, शरबती गेहूं ₹2,650/क्विंटल, देसी चना ₹5,900/क्विंटल, सरसों ₹5,400/क्विंटल और सोयाबीन ₹4,750/क्विंटल है।'
          : 'Today Mandi benchmark rates: Basmati Paddy ₹4,450/Qtl, Common Paddy ₹2,320/Qtl, Wheat ₹2,650/Qtl, Chana ₹5,900/Qtl, Mustard ₹5,400/Qtl, and Soyabean ₹4,750/Qtl.',
        translation: 'Today Mandi benchmark rates: Basmati Paddy ₹4,450/Qtl, Common Paddy ₹2,320/Qtl, Wheat ₹2,650/Qtl, Chana ₹5,900/Qtl, Mustard ₹5,400/Qtl, and Soyabean ₹4,750/Qtl.',
        action: { type: 'navigate', targetTab: 'market-prices', details: 'View Mandi Dashboard' },
        quickChips: ['चावल और धान का भाव', 'उज्जैन गेहूं का भाव', 'फसल लिस्टिंग करें'],
      };
    }

    // 2. Fertilizer, Nutrition & Soil Health (खाद, उर्वरक, यूरिया, डीएपी, NPK, जिंक, पोटाश)
    if (
      lower.includes('खाद') ||
      lower.includes('उर्वरक') ||
      lower.includes('यूरिया') ||
      lower.includes('urea') ||
      lower.includes('डीएपी') ||
      lower.includes('dap') ||
      lower.includes('npk') ||
      lower.includes('जिंक') ||
      lower.includes('zinc') ||
      lower.includes('पोटाश') ||
      lower.includes('potash') ||
      lower.includes('fertilizer') ||
      lower.includes('मिट्टी') ||
      lower.includes('soil')
    ) {
      if (lower.includes('यूरिया') || lower.includes('urea') || lower.includes('नैनो')) {
        return {
          spokenReply: isHi
            ? 'गेहूं और धान में पहली व दूसरी सिंचाई पर 40-45 किग्रा यूरिया प्रति एकड़ टॉप ड्रेसिंग करें। नैनो यूरिया का उपयोग 4 मिली प्रति लीटर पानी में मिलाकर कल्ले फूटते समय स्प्रे करें।'
            : 'Apply 40-45 kg/acre Urea during early irrigations. Use Nano Urea at 4ml/L water for foliar feeding.',
          translation: 'Apply 40-45 kg/acre Urea during early irrigations. Use Nano Urea at 4ml/L water for foliar feeding.',
          action: { type: 'navigate', targetTab: 'advisory', details: 'Open AI Crop Nutrition Guide' },
          quickChips: ['डीएपी कितना डालें?', 'जिंक की कमी के लक्षण', 'फसल डॉक्टर सलाह'],
        };
      }
      return {
        spokenReply: isHi
          ? 'बुवाई के समय प्रति एकड़ 50 किग्रा डीएपी या 75 किग्रा एनपीके (12:32:16) बेसल डोज में डालें। सूक्ष्म पोषक तत्वों के लिए 5 किग्रा जिंक सल्फेट अवश्य मिलाएं।'
          : 'Apply 50 kg/acre DAP or 75 kg/acre NPK (12:32:16) at sowing, along with 5 kg Zinc Sulphate for healthy roots.',
        translation: 'Apply 50 kg/acre DAP or 75 kg/acre NPK at sowing with Zinc Sulphate for optimal crop nutrition.',
        action: { type: 'navigate', targetTab: 'advisory', details: 'Fertilizer Advisory' },
        quickChips: ['यूरिया कब डालें?', 'मिट्टी की जांच कैसे करें', 'मंडी भाव देखें'],
      };
    }

    // 3. Pest, Disease & Crop Protection (पीलापन, रतुआ, सुंडी, झुलसा, दवा, कीटनाशक)
    if (
      lower.includes('पीलापन') ||
      lower.includes('yellow') ||
      lower.includes('रोग') ||
      lower.includes('बीमारी') ||
      lower.includes('कीड़ा') ||
      lower.includes('पत्ता') ||
      lower.includes('pest') ||
      lower.includes('disease') ||
      lower.includes('फंगस') ||
      lower.includes('fungus') ||
      lower.includes('रतुआ') ||
      lower.includes('rust') ||
      lower.includes('सुंडी') ||
      lower.includes('झुलसा') ||
      lower.includes('दवा')
    ) {
      if (lower.includes('रतुआ') || lower.includes('rust') || (lower.includes('गेहूं') && lower.includes('पीला'))) {
        return {
          spokenReply: isHi
            ? 'गेहूं में पीला रतुआ (Yellow Rust) के लक्षण दिखने पर तुरंत प्रोपिकोनाजोल 25% EC (टिल्ट) 200 मिली प्रति एकड़ 200 लीटर पानी में छिड़कें। सामान्य पीलापन होने पर 2% यूरिया स्प्रे करें।'
            : 'For Yellow Rust in wheat, spray Propiconazole 25% EC @ 200ml/acre in 200L water. For nutrient deficiency, spray 2% urea.',
          translation: 'For Yellow Rust in wheat, spray Propiconazole 25% EC (200ml/acre). Spray 2% urea for nutritional deficiency.',
          action: { type: 'navigate', targetTab: 'advisory', details: 'Open AI Crop Doctor' },
          quickChips: ['गेहूं में यूरिया कब डालें?', 'फसल स्वास्थ्य स्कोर', 'मंडी भाव देखें'],
        };
      }
      return {
        spokenReply: isHi
          ? 'फसल में कीट या फंगल बीमारी के लिए 5% नीम तेल अर्क का छिड़काव करें या कृषि सेतु फसल डॉक्टर में पौधे की तस्वीर अपलोड करके एआई द्वारा सटीक निदान प्राप्त करें।'
          : 'For crop diseases or pests, apply 5% neem extract formulation or upload a photo to AI Crop Doctor for automated diagnosis.',
        translation: 'Spray 5% neem extract or upload photo to KrishiSetu AI Crop Doctor for instant diagnosis.',
        action: { type: 'navigate', targetTab: 'advisory', details: 'Open AI Crop Doctor' },
        quickChips: ['फसल फोटो से जांचें', 'कीटनाशक की खुराक', 'मंडी भाव जांचें'],
      };
    }

    // 4. Government Schemes & Banking (पीएम किसान, फसल बीमा, केसीसी लोन, कुसुम सोलर)
    if (
      lower.includes('योजना') ||
      lower.includes('scheme') ||
      lower.includes('पीएम किसान') ||
      lower.includes('pm kisan') ||
      lower.includes('बीमा') ||
      lower.includes('insurance') ||
      lower.includes('सोलर') ||
      lower.includes('कुसुम') ||
      lower.includes('सब्सिडी') ||
      lower.includes('केसीसी') ||
      lower.includes('kcc') ||
      lower.includes('लोन') ||
      lower.includes('loan') ||
      lower.includes('क्रेडिट') ||
      lower.includes('स्कोर')
    ) {
      if (lower.includes('पीएम किसान') || lower.includes('pm kisan')) {
        return {
          spokenReply: isHi
            ? 'पीएम-किसान योजना के तहत पात्र किसानों को प्रतिवर्ष ₹6,000 की वित्तीय सहायता 3 किस्तों में सीधे बैंक खाते में मिलती है।'
            : 'Under PM-KISAN, eligible farmers receive ₹6,000 annually in 3 installments directly via DBT.',
          translation: 'PM-KISAN provides ₹6,000 per year in 3 direct bank installments with mandatory e-KYC.',
          action: { type: 'navigate', targetTab: 'micro-credit', details: 'Check Beneficiary Status' },
          quickChips: ['केसीसी लोन कैसे मिलेगा?', 'फसल बीमा की जानकारी', 'सोलर पंप सब्सिडी'],
        };
      }
      return {
        spokenReply: isHi
          ? 'किसान क्रेडिट कार्ड (KCC) पर ₹3 लाख तक का फसली ऋण केवल 4% वार्षिक रियायती ब्याज दर पर मिलता है। कृषि सेतु पर आपका सैटेलाइट ट्रस्ट स्कोर AAA प्राइम (785) है।'
          : 'KCC offers crop loans up to ₹3,00,000 at 4% effective interest. Your KrishiSetu Trust Score is AAA Prime (785/900).',
        translation: 'KCC offers crop loans up to ₹3 Lakh at 4% subsidized interest rate.',
        action: { type: 'navigate', targetTab: 'micro-credit', details: 'Check Micro-Credit Limit' },
        quickChips: ['केसीसी लोन पात्रता', 'पीएम किसान किस्त', 'मंडी भाव देखें'],
      };
    }

    // 5. Selling Produce / Crop Listing
    if (lower.includes('लिस्ट') || lower.includes('बेचना') || lower.includes('sell') || lower.includes('list') || lower.includes('50 क्विंटल') || lower.includes('क्विंटल') || lower.includes('फसल बेचना')) {
      return {
        spokenReply: isHi
          ? 'आप अपनी फसल कृषि सेतु पर 0% बिचौलिया कमीशन के साथ सीधे 400+ प्रमाणित थोक खरीदारों को बेच सकते हैं। एस्क्रो पेमेंट से आपका भुगतान 100% सुरक्षित रहता है।'
          : 'You can list your harvest directly on KrishiSetu with 0% middleman commission to verified wholesale buyers with instant escrow payment security.',
        translation: 'You can list your produce directly on KrishiSetu with 0% middleman commission to verified wholesale buyers.',
        action: { type: 'navigate', targetTab: 'my-crops', details: 'Open Crop Listing Form' },
        quickChips: ['आज का मंडी भाव क्या है?', 'ट्रैक्टर किराए पर चाहिए', 'केसीसी लोन सीमा जांचें'],
      };
    }

    // 6. Machinery, Tractor, Harvester Rental
    if (lower.includes('ट्रैक्टर') || lower.includes('tractor') || lower.includes('किराया') || lower.includes('rent') || lower.includes('हार्वेस्टर') || lower.includes('harvester') || lower.includes('machinery') || lower.includes('मशीन') || lower.includes('50hp')) {
      return {
        spokenReply: isHi
          ? 'आपके नजदीकी क्षेत्र में जीपीएस-सक्षम महिन्द्रा 50HP ट्रैक्टर ₹850 प्रति घंटे और कम्बाइन हार्वेस्टर ₹1,800 प्रति घंटे की दर से बुकिंग के लिए उपलब्ध हैं।'
          : 'GPS-enabled 50HP Mahindra tractors (₹850/hr) and Combine Harvesters (₹1,800/hr) are available nearby with live map tracking.',
        translation: 'GPS-enabled 50HP Mahindra tractors (₹850/hr) and Combine Harvesters (₹1,800/hr) are available nearby with live map tracking.',
        action: { type: 'navigate', targetTab: 'live-gps-machinery', details: 'Book GPS Machinery' },
        quickChips: ['हार्वेस्टर की दरें', 'फसल लिस्ट करें', 'मंडी भाव जांचें'],
      };
    }

    // 7. Crop Health / Yield Advisory
    if (lower.includes('सैटेलाइट') || lower.includes('satellite') || lower.includes('पैदावार') || lower.includes('yield') || lower.includes('ndvi') || lower.includes('उपग्रह') || lower.includes('doctor')) {
      return {
        spokenReply: isHi
          ? 'फसल डॉक्टर व एआई सलाहकार आपकी फसल की बीमारियों की पहचान और बेहतर पैदावार के लिए वैज्ञानिक खाद व कीटनाशक सुझाव प्रदान करता है।'
          : 'AI Crop Doctor diagnoses crop leaf symptoms, pest infestations, and delivers verified agronomic advice for maximum yield.',
        translation: 'AI Crop Doctor diagnoses crop diseases and provides scientific advisories for peak harvest yield.',
        action: { type: 'navigate', targetTab: 'advisory', details: 'Open AI Crop Doctor' },
        quickChips: ['फसल डॉक्टर खोलें', 'मंडी भाव देखें', 'फसल लिस्ट करें'],
      };
    }

    // 8. General Welcome / Catch-all
    return {
      spokenReply: isHi
        ? 'नमस्ते! मैं कृषि सेतु आवाज सहायक हूँ। आप मुझसे किसी भी फसल का मंडी भाव (धान, गेहूं, सोयाबीन, सरसों, चना, कपास आदि), खाद व कीटनाशक दवा, सरकारी योजनाएं, या ट्रैक्टर बुकिंग के बारे में पूछ सकते हैं।'
        : isMr
        ? 'नमस्कार! मी कृषी सेतू व्हॉइस असिस्टंट आहे. तुम्ही मला बाजारभाव, पीक नोंदणी किंवा ट्रॅक्टर बुकिंगबद्दल विचारू शकता.'
        : isPa
        ? 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕ੍ਰਿਸ਼ੀ ਸੇਤੂ ਵੌਇਸ ਅਸਿਸਟੈਂਟ ਹਾਂ। ਤੁਸੀਂ ਮੰਡੀ ਭਾਅ ਜਾਂ ਟਰੈਕਟਰ ਬਾਰੇ ਪੁੱਛ ਸਕਦੇ ਹੋ।'
        : 'Hello! I am your KrishiSetu Voice Copilot. Ask me about live mandi rates for any crop, fertilizer dosage, pest remedies, government schemes, or tractor booking.',
      translation: 'Hello! I am your KrishiSetu Voice Copilot. Ask me about mandi rates, crop listing, machinery rental, or agricultural advice.',
      action: { type: 'navigate', targetTab: 'marketplace', details: 'Explore Agricultural Hub' },
      quickChips: ['चावल और धान का भाव', 'उज्जैन गेहूं का आज का भाव', 'फसल में पीलापन की दवा'],
    };
  };

  // Explicitly verify Web Speech API compatibility when modal opens
  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
      return;
    }

    // 1. Verify Web Speech API Browser Compatibility
    const speechRecognitionAvailable =
      typeof window !== 'undefined' &&
      (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window));
    setHasWebSpeechSupport(speechRecognitionAvailable);

    // 2. Check microphone status via Permissions API if available
    if (typeof navigator !== 'undefined' && navigator.permissions && (navigator.permissions as any).query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((perm) => {
          if (perm.state === 'denied') {
            setMicPermissionStatus('denied');
            setMicPermissionError('माइक्रोफ़ोन की अनुमति अस्वीकृत है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।');
          } else if (perm.state === 'granted') {
            setMicPermissionStatus('granted');
            setMicPermissionError(null);
          } else {
            setMicPermissionStatus('prompt');
          }
        })
        .catch(() => {
          setMicPermissionStatus('prompt');
        });
    }

    return () => {
      cleanupAudio();
    };
  }, [isOpen]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const cleanupAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingAudio(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    setIsListening(false);
    setAudioLevel(0);
  };

  // Text-To-Speech Synthesis
  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langCodes: Record<string, string> = {
        Hindi: 'hi-IN',
        English: 'en-IN',
        Marathi: 'mr-IN',
        Punjabi: 'pa-IN',
      };
      utterance.lang = langCodes[selectedLang] || 'hi-IN';
      utterance.rate = 0.95;

      utterance.onstart = () => setIsSpeakingAudio(true);
      utterance.onend = () => setIsSpeakingAudio(false);
      utterance.onerror = () => setIsSpeakingAudio(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setIsSpeakingAudio(false);
    }
  };

  const startListening = async () => {
    cleanupAudio();
    setMicPermissionError(null);
    setTranscript('');

    let stream: MediaStream | null = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Setup live audio visualizer
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateLevel = () => {
              if (analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                }
                const avg = sum / dataArray.length;
                setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
                animFrameRef.current = requestAnimationFrame(updateLevel);
              }
            };
            updateLevel();
          }
        } catch (visErr) {
          console.warn('Visualizer setup note:', visErr);
        }

        // Setup MediaRecorder for direct audio backend processing
        audioChunksRef.current = [];
        let mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported('audio/webm')) {
          if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
          else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
          else mimeType = '';
        }

        const options = mimeType ? { mimeType } : undefined;
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start(250);
      }
    } catch (err: any) {
      console.warn('Microphone getUserMedia error:', err);
      setMicPermissionError('माइक्रोफ़ोन की अनुमति दें (Please allow microphone access or click a sample query below).');
    }

    // Also attempt browser Web Speech API for real-time live typing
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        const langCodes: Record<string, string> = {
          Hindi: 'hi-IN',
          English: 'en-IN',
          Marathi: 'mr-IN',
          Punjabi: 'pa-IN',
        };
        recognition.lang = langCodes[selectedLang] || 'hi-IN';

        recognition.onresult = (event: any) => {
          let currentText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          if (currentText) {
            setTranscript(currentText);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Web Speech event note:', event.error);
        };

        recognition.onend = () => {
          // If media recorder is still running, user hasn't explicitly stopped
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (recErr) {
        console.warn('SpeechRecognition start failed:', recErr);
      }
    }

    setIsListening(true);
  };

  const stopListening = async (skipSend?: boolean) => {
    setIsListening(false);
    setAudioLevel(0);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // Stop MediaRecorder and grab audio blob
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      const recorder = mediaRecorderRef.current;
      
      const audioBlobPromise = new Promise<Blob | null>((resolve) => {
        recorder.onstop = () => {
          const mime = recorder.mimeType || 'audio/webm';
          const blob = new Blob(audioChunksRef.current, { type: mime });
          resolve(blob.size > 500 ? blob : null);
        };
        try {
          recorder.stop();
        } catch (e) {
          resolve(null);
        }
      });

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const recordedBlob = await audioBlobPromise;

      if (!skipSend) {
        // Check if we already have a live transcript from Web Speech
        if (transcript.trim()) {
          handleSendQuery(transcript);
        } else if (recordedBlob) {
          // Send audio directly to Gemini 2.5 Flash Audio endpoint
          handleSendAudioQuery(recordedBlob);
        }
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (!skipSend && transcript.trim()) {
        handleSendQuery(transcript);
      }
    }
  };

  // Direct Audio Processing with Gemini Audio API
  const handleSendAudioQuery = async (audioBlob: Blob) => {
    setLoading(true);
    setTranscript('🎙️ प्रोसेसिंग ऑडियो आवाज़ (Processing audio)...');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const mimeType = audioBlob.type || 'audio/webm';

        try {
          const response = await fetch('/api/voice-assistant/ask-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Data,
              mimeType,
              language: selectedLang,
              crops: marketplaceCrops,
              machinery: machineryList,
              currentContext: {
                role: currentUser?.role || 'farmer',
                location: currentUser?.location || 'Ujjain, Madhya Pradesh',
                name: currentUser?.name || 'Kisan Ramesh',
              },
            }),
          });

          const json = await response.json();
          if (response.ok && json.success && json.data) {
            const botReply = json.data;
            const transcribedQuery = botReply.transcribedText || (selectedLang === 'Hindi' ? 'आवाज से पूछा गया प्रश्न' : 'Spoken Voice Query');

            const userMsg: Message = {
              id: `usr-${Date.now()}`,
              sender: 'user',
              text: transcribedQuery,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            const assistantMsg: Message = {
              id: `bot-${Date.now()}`,
              sender: 'assistant',
              text: botReply.spokenReply,
              translation: botReply.englishTranslation,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              action: botReply.suggestedAction,
              quickChips: botReply.quickChips,
              dbCrossReference: botReply.dbCrossReference,
            };

            setMessages((prev) => [...prev, userMsg, assistantMsg]);
            setTranscript('');
            speakText(botReply.spokenReply);
            return;
          }
          throw new Error('Fallback needed');
        } catch (apiErr: any) {
          console.warn('Audio query fallback:', apiErr);
          const nlpResult = performNlpRefinementAndCrossReference(
            'गेहूं का आज का मंडी भाव बताओ',
            marketplaceCrops,
            machineryList,
            selectedLang
          );
          const fallback = nlpResult.groundedSpokenAnswer;
          const userMsg: Message = {
            id: `usr-${Date.now()}`,
            sender: 'user',
            text: selectedLang === 'Hindi' ? 'गेहूं का आज का मंडी भाव बताओ' : 'Check today mandi price',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          const assistantMsg: Message = {
            id: `bot-${Date.now()}`,
            sender: 'assistant',
            text: fallback.spokenReply,
            translation: fallback.englishTranslation,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            action: fallback.suggestedAction,
            quickChips: fallback.quickChips,
            dbCrossReference: nlpResult.crossReference,
          };
          setMessages((prev) => [...prev, userMsg, assistantMsg]);
          setTranscript('');
          speakText(fallback.spokenReply);
        } finally {
          setLoading(false);
        }
      };
    } catch (err) {
      console.error('Blob reader error:', err);
      setLoading(false);
      handleFallbackError();
    }
  };

  const handleFallbackError = () => {
    const errorMessage: Message = {
      id: `bot-err-${Date.now()}`,
      sender: 'assistant',
      text: 'माफ़ कीजिए, प्रश्न को समझने में त्रुटि हुई। कृपया नीचे दिए गए प्रश्नों में से चुनें या दोबारा टाइप करें।',
      translation: 'Could not process query. Please select a sample question below or type your query.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, errorMessage]);
    setTranscript('');
  };

  // Send Text Query to Gemini Voice Assistant API with DB Cross-Referencing
  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || transcript;
    if (!textToSend.trim()) return;

    if (isListening) {
      stopListening(true);
    }

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setTranscript('');
    setLoading(true);

    try {
      const response = await fetch('/api/voice-assistant/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToSend,
          language: selectedLang,
          crops: marketplaceCrops,
          machinery: machineryList,
          currentContext: {
            role: currentUser?.role || 'farmer',
            location: currentUser?.location || 'Ujjain, Madhya Pradesh',
            name: currentUser?.name || 'Kisan Ramesh',
          },
        }),
      });

      const json = await response.json();

      if (response.ok && json.success && json.data) {
        const botReply = json.data;

        const assistantMessage: Message = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: botReply.spokenReply,
          translation: botReply.englishTranslation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: botReply.suggestedAction,
          quickChips: botReply.quickChips,
          dbCrossReference: botReply.dbCrossReference,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        speakText(botReply.spokenReply);
        return;
      }
      throw new Error('Fallback to local assistant engine');
    } catch (err: any) {
      console.warn('Using client NLP & DB cross-reference engine fallback for:', textToSend);
      const nlpResult = performNlpRefinementAndCrossReference(
        textToSend,
        marketplaceCrops,
        machineryList,
        selectedLang,
        {
          role: currentUser?.role || 'farmer',
          location: currentUser?.location || 'Ujjain, Madhya Pradesh',
          name: currentUser?.name || 'Kisan Ramesh',
        }
      );
      const fallback = nlpResult.groundedSpokenAnswer;
      const assistantMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: fallback.spokenReply,
        translation: fallback.englishTranslation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: fallback.suggestedAction,
        quickChips: fallback.quickChips,
        dbCrossReference: nlpResult.crossReference,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      speakText(fallback.spokenReply);
    } finally {
      setLoading(false);
    }
  };

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  const handleResetChat = () => {
    if (isSpeakingAudio) {
      window.speechSynthesis?.cancel();
      setIsSpeakingAudio(false);
    }
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'नमस्ते! मैं कृषि सेतु आवाज सहायक (KrishiSetu Voice Copilot) हूँ। आप बोलकर मंडी भाव, फसल लिस्टिंग, ट्रैक्टर बुकिंग, या फसल बीमारी की सलाह ले सकते हैं।',
        translation:
          'Hello! I am your KrishiSetu Voice Copilot. Speak anytime to check mandi rates, list harvest produce, book machinery, or get instant crop diagnosis.',
        timestamp: 'Just now',
        quickChips: [
          'गेहूं का आज का मंडी भाव बताओ',
          'मेरी 50 क्विंटल फसल लिस्ट करो',
          'ट्रैक्टर किराए पर बुक करो',
          'किसान क्रेडिट स्कोर चेक करें',
        ],
      },
    ]);
  };

  const handleExecuteAction = (action?: Message['action']) => {
    if (!action) return;

    if (action.targetTab && onNavigateTab) {
      onNavigateTab(action.targetTab);
      setIsOpen(false);
    } else if (action.type === 'list_crop' && onOpenQuickCropListing) {
      onOpenQuickCropListing();
      setIsOpen(false);
    }
  };

  const filteredQuickQueries =
    activeCategoryFilter === 'All'
      ? SAMPLE_QUICK_VOICE_QUERIES
      : SAMPLE_QUICK_VOICE_QUERIES.filter((q) => q.category === activeCategoryFilter);

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING ALWAYS-VISIBLE VOICE ASSISTANT LAUNCHER BUTTON                 */}
      {/* ========================================================================= */}
      <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Helper Bubble if modal not open */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-[#11281E] hover:bg-[#1B4332] text-white text-xs font-bold shadow-lg border border-[#E8D5B5]/60 cursor-pointer hover:scale-105 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>🎙️ आवाज सहायक (AI Voice)</span>
          </div>
        )}

        <button
          id="btn-global-voice-assistant"
          onClick={() => setIsOpen(true)}
          aria-label="Open KrishiSetu Voice Assistant"
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#1B4332] hover:bg-[#2D5A27] text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-white/80 cursor-pointer group"
        >
          <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-[#FAF3E0] group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#8C6228] text-white text-[9px] font-black uppercase tracking-wider shadow-xs border border-white">
            AI
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. STREAMLINED, HIGH-IMPACT VOICE COPILOT MODAL (COMPACT & UN-BULKY)      */}
      {/* ========================================================================= */}
      {isOpen && (
        <div
          id="voice-assistant-dialog"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
        >
          <div className="relative w-full max-w-xl bg-white rounded-2xl border border-[#1B4332]/20 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Crisp Minimal Header */}
            <div className="px-4 py-3 bg-[#1B4332] text-white flex items-center justify-between border-b border-[#2D5A27]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FAF3E0] text-[#1B4332] flex items-center justify-center border border-[#E8D5B5] shrink-0">
                  <Mic className={`w-4 h-4 text-[#1B4332] ${isListening ? 'text-rose-600 animate-pulse' : ''}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white leading-none">
                      कृषि सेतु AI (Voice Copilot)
                    </h3>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        isListening
                          ? 'bg-rose-500 text-white animate-pulse'
                          : isSpeakingAudio
                          ? 'bg-amber-400 text-[#11281E]'
                          : 'bg-emerald-900 text-emerald-200'
                      }`}
                    >
                      {isListening ? 'Listening' : isSpeakingAudio ? 'Speaking' : 'Online'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Header Controls */}
              <div className="flex items-center gap-1">
                {/* Dialect Quick Picker */}
                <div className="flex items-center bg-white/10 rounded-lg p-0.5 mr-1">
                  {(['Hindi', 'English', 'Marathi', 'Punjabi'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setSelectedLang(lang);
                        if (isListening) stopListening(false);
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                        selectedLang === lang
                          ? 'bg-white text-[#1B4332] shadow-2xs'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      {lang === 'Hindi' ? 'हिन्दी' : lang === 'English' ? 'EN' : lang === 'Marathi' ? 'मराठी' : 'ਪੰ'}
                    </button>
                  ))}
                </div>

                {/* Reset Chat */}
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="रीसेट (Reset)"
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                {/* TTS Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeakingAudio) {
                      window.speechSynthesis?.cancel();
                      setIsSpeakingAudio(false);
                    }
                    setSpeechEnabled(!speechEnabled);
                  }}
                  title={speechEnabled ? 'Mute' : 'Unmute'}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    speechEnabled ? 'text-white hover:bg-white/15' : 'text-rose-300 bg-rose-500/20'
                  }`}
                >
                  {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => {
                    cleanupAudio();
                    setIsOpen(false);
                  }}
                  title="Close"
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors cursor-pointer ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Live Waveform Bar (Only when Listening) */}
            {isListening && (
              <div className="px-4 py-2 bg-[#11281E] text-white flex items-center justify-between border-b border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-bold text-emerald-200">
                    सुन रहा हूँ... बोलें (Listening)
                  </span>
                </div>
                <div className="flex items-center gap-0.5 h-4">
                  {[20, 60, 90, 40, 100, 70, 85, 35, 75, 50].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                      style={{
                        height: `${Math.max(4, (audioLevel > 5 ? (h * audioLevel) / 100 : Math.sin(Date.now() / 150 + i) * 6 + 8))}px`,
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => stopListening(false)}
                  className="px-2.5 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                >
                  हो गया ✓
                </button>
              </div>
            )}

            {micPermissionError && (
              <div className="p-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between">
                <span>{micPermissionError}</span>
                <button
                  type="button"
                  onClick={startListening}
                  className="px-2 py-0.5 bg-amber-700 text-white rounded text-[11px] font-bold"
                >
                  माइक अनुमति दें
                </button>
              </div>
            )}

            {/* Compact Chat Stream */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-[#FAF8F5] min-h-[220px] max-h-[360px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      msg.sender === 'user'
                        ? 'bg-[#8C6228] text-white'
                        : 'bg-[#1B4332] text-[#FAF3E0]'
                    }`}
                  >
                    {msg.sender === 'user' ? 'आप' : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-xl p-3 space-y-1.5 shadow-2xs border ${
                      msg.sender === 'user'
                        ? 'bg-[#1B4332] text-white border-[#1B4332]'
                        : 'bg-white text-[#11281E] border-[#1B4332]/10'
                    }`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100 text-[10px] text-[#4D6B53] font-bold">
                        <span>कृषि सहायक</span>
                        <button
                          type="button"
                          onClick={() => speakText(msg.text)}
                          title="दोबारा सुनें"
                          className="hover:text-[#1B4332] cursor-pointer"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <p className="text-xs sm:text-sm font-medium leading-snug whitespace-pre-line">
                      {msg.text}
                    </p>

                    {/* Compact DB Cards */}
                    {msg.sender === 'assistant' && msg.dbCrossReference && msg.dbCrossReference.hasDbMatch && (
                      <div className="pt-1.5 space-y-1.5">
                        {msg.dbCrossReference.matchingLots && msg.dbCrossReference.matchingLots.length > 0 && (
                          <div className="bg-[#F4F8F3] rounded-lg p-2 border border-emerald-200 text-xs space-y-1">
                            <div className="flex items-center justify-between font-bold text-[11px] text-[#1B4332]">
                              <span>🌾 मंडी लॉट उपलब्ध ({msg.dbCrossReference.activeLotsCount})</span>
                            </div>
                            {msg.dbCrossReference.matchingLots.slice(0, 2).map((lot) => (
                              <div key={lot.id} className="flex items-center justify-between text-[11px] bg-white p-1.5 rounded border border-slate-200">
                                <span className="font-bold">{lot.hindiName || lot.cropName} • {lot.location}</span>
                                <span className="font-black text-[#1B4332]">₹{lot.price}/Qtl</span>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigateTab) {
                                  onNavigateTab('marketplace');
                                  setIsOpen(false);
                                }
                              }}
                              className="w-full py-1 rounded bg-[#1B4332] text-white text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>मार्केटप्लेस खोलें</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Action Button */}
                    {msg.action && msg.action.type !== 'none' && (
                      <button
                        type="button"
                        onClick={() => handleExecuteAction(msg.action)}
                        className="mt-1 py-1 px-2.5 rounded-lg bg-[#E8F0E5] text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-all text-[11px] font-bold flex items-center gap-1 border border-[#1B4332]/20 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-[#8C6228]" />
                        <span>खोलें: {msg.action.targetTab || msg.action.type} ➔</span>
                      </button>
                    )}

                    {/* Quick Follow-up Chips */}
                    {msg.quickChips && msg.quickChips.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1">
                        {msg.quickChips.map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendQuery(chip)}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FAF3E0] hover:bg-[#F2E5C9] text-[#8C6228] border border-[#E8D5B5] transition-all cursor-pointer"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs font-bold text-[#1B4332] p-2.5 rounded-xl bg-[#E8F0E5] border border-[#1B4332]/20 w-fit animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1B4332]" />
                  <span>जानकारी प्राप्त हो रही है...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggestions Strip */}
            <div className="px-3 py-2 bg-[#F7F5F0] border-t border-[#1B4332]/10 flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] font-bold text-[#8C6228] shrink-0">सुझाव:</span>
              {SAMPLE_QUICK_VOICE_QUERIES.slice(0, 4).map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendQuery(q.text)}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#1B4332]/15 text-left shrink-0 transition-all text-[11px] font-medium text-[#11281E] hover:bg-[#FAF3E0] hover:border-[#8C6228] cursor-pointer"
                >
                  {q.text}
                </button>
              ))}
            </div>

            {/* Compact Bottom Mic & Input Dock */}
            <div className="p-2.5 sm:p-3 bg-white border-t border-[#1B4332]/10 flex items-center gap-2">
              <button
                type="button"
                id="btn-voice-mic-trigger"
                onClick={isListening ? () => stopListening(false) : startListening}
                aria-label={isListening ? 'Stop mic' : 'Start mic'}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-300 animate-pulse'
                    : 'bg-[#1B4332] text-white border-[#1B4332] hover:bg-[#2D5A27]'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-[#FAF3E0]" />}
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  id="input-voice-assistant-text"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendQuery();
                  }}
                  placeholder={
                    isListening ? 'बोलें... (Listening)' : 'प्रश्न लिखें या माइक दबाएं...'
                  }
                  className="w-full py-2 pl-3 pr-9 rounded-xl border border-[#1B4332]/20 text-xs font-medium text-[#11281E] bg-[#FAF8F5] focus:outline-none focus:border-[#1B4332] focus:bg-white"
                />

                <button
                  type="button"
                  disabled={!transcript.trim() || loading}
                  onClick={() => handleSendQuery()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#1B4332] text-white disabled:opacity-30 hover:bg-[#2D5A27] transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#FAF3E0]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

