import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { useSearchParams } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  TextField,
  MenuItem,
  LinearProgress,
  IconButton,
  Switch,
  Tooltip,
  Menu,
  Popover,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Subject as NotesIcon,
  AttachMoney as MoneyIcon,
  Payments as PaymentsIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  CalendarMonth as CalendarIcon,
  HelpOutline as HelpIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface Account {
  id: string;
  name: string;
  institution: string;
  color: string;
  type: string;
}

interface CreditCard {
  id: string;
  name: string;
  bank?: string;
  brand: string;
  limitTotal: number;
  limitAvailable: number;
  limitUsed: number;
  closingDay: number;
  dueDay: number;
  color?: string;
  initialInvoice?: number;
  accountId?: string;
  isMain: boolean;
  dynamicClosing: boolean;
  dueBusinessDays: boolean;
}

const CARDS_BRANDS = ['MASTERCARD', 'VISA', 'DINERS', 'AMEX', 'ELO', 'OUTRO'];

const CARD_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Green
  '#EF4444', // Red
  '#F59E0B', // Orange
  '#06B6D4', // Cyan/Light Blue
  '#EC4899', // Pink
  '#7E8494', // Grey
];

const MONTHS_SHORT = [
  'JAN.', 'FEV.', 'MAR.', 'ABR.', 'MAI.', 'JUN.',
  'JUL.', 'AGO.', 'SET.', 'OUT.', 'NOV.', 'DEZ.'
];

const BANKS_LIST = [
  { id: 'nubank', name: 'Nubank' },
  { id: 'itau', name: 'Itaú' },
  { id: 'bradesco', name: 'Bradesco' },
  { id: 'bb', name: 'Banco do Brasil' },
  { id: 'santander', name: 'Santander' },
  { id: 'caixa', name: 'Caixa' },
  { id: 'c6', name: 'C6 Bank' },
  { id: 'inter', name: 'Inter' },
  { id: 'btg', name: 'BTG Pactual' },
  { id: 'xp', name: 'XP Investimentos' },
  { id: 'neon', name: 'Neon' },
  { id: 'next', name: 'Next' },
  { id: 'bmg', name: 'Banco BMG' },
  { id: 'banrisul', name: 'Banrisul' },
  { id: 'sicoob', name: 'Sicoob' },
  { id: 'sicredi', name: 'Sicredi' },
  { id: 'stone', name: 'Stone' },
  { id: 'pagbank', name: 'PagBank' },
  { id: 'picpay', name: 'PicPay' },
  { id: 'mercadopago', name: 'Mercado Pago' },
  { id: 'will', name: 'Will Bank' },
  { id: 'ame', name: 'Ame Digital' },
  { id: 'agibank', name: 'Agibank' },
  { id: 'safra', name: 'Safra' },
  { id: 'digio', name: 'Digio' },
  { id: 'trigg', name: 'Trigg' },
  { id: 'alelo', name: 'Alelo' },
  { id: 'caixatem', name: 'Caixa Tem' },
  { id: 'paypal', name: 'PayPal' },
  { id: 'binance', name: 'Binance' },
  { id: 'pan', name: 'Banco Pan' },
  { id: 'bari', name: 'Banco Bari' },
];

const renderBankLogoSvg = (bankId: string | undefined, size: number = 32) => {
  const id = bankId?.toLowerCase() || '';
  
  if (id === 'nubank') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#820AD1" />
        <text x="20" y="24.5" fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="800" fontSize="14" textAnchor="middle" fontStyle="italic">nu</text>
      </svg>
    );
  }
  if (id === 'itau') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#EC7000" />
        <rect x="9" y="9" width="22" height="22" rx="4" fill="#002E7A" />
        <text x="20" y="23.5" fill="#FFD200" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="8" textAnchor="middle">itaú</text>
      </svg>
    );
  }
  if (id === 'bradesco') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#CC0000" />
        <path d="M20,11 C16,11 13,15 13,19 L27,19 C27,15 24,11 20,11 Z" fill="#FFFFFF" />
        <rect x="18.5" y="19" width="3" height="10" fill="#FFFFFF" />
        <circle cx="20" cy="14" r="1.8" fill="#CC0000" />
        <circle cx="16" cy="18" r="1.8" fill="#CC0000" />
        <circle cx="24" cy="18" r="1.8" fill="#CC0000" />
      </svg>
    );
  }
  if (id === 'bb') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#FAF000" />
        <path d="M13,15 L13,25 L23,25 M27,25 L27,15 L17,15" stroke="#002E7A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }
  if (id === 'santander') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#EC0000" />
        <path d="M20,11 C20,11 24,15 24,19 C24,23 20,26 20,26 C20,26 16,23 16,19 C16,15 20,11 20,11 Z" fill="#FFFFFF" />
        <path d="M20,15 C20,15 22,18 22,20 C22,22 20,24 20,24 C20,24 18,22 18,20 C18,18 20,15 20,15 Z" fill="#EC0000" />
      </svg>
    );
  }
  if (id === 'caixa') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#005CA9" />
        <text x="17" y="26" fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="18" textAnchor="middle">X</text>
        <path d="M24,12 L30,12 L30,20 L24,20 Z" fill="#F47A20" />
      </svg>
    );
  }
  if (id === 'c6') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#1E1E1E" />
        <text x="20" y="25.5" fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="800" fontSize="14" textAnchor="middle">C6</text>
      </svg>
    );
  }
  if (id === 'inter') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#FF7A00" />
        <text x="20" y="25" fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="800" fontSize="13" textAnchor="middle">IN</text>
      </svg>
    );
  }
  if (id === 'btg') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#081C3B" />
        <path d="M12,25 L20,13 L28,25 Z M16,23 L24,23 L20,17 Z" stroke="#FFFFFF" strokeWidth="2" fill="none" />
      </svg>
    );
  }
  if (id === 'xp') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#000000" />
        <text x="20" y="25.5" fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="800" fontSize="14" textAnchor="middle">xp</text>
      </svg>
    );
  }
  if (id === 'neon') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#00E5FF" />
        <text x="20" y="25.5" fill="#00375B" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="14" text-anchor="middle">N</text>
      </svg>
    );
  }
  if (id === 'next') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#00FF5F" />
        <text x="20" y="25" fill="#000000" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="14" text-anchor="middle">n</text>
      </svg>
    );
  }
  if (id === 'bmg') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#FF6C00" />
        <text x="20" y="24" fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="9" text-anchor="middle">BMG</text>
      </svg>
    );
  }
  if (id === 'banrisul') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#00519E" />
        <path d="M15,15 L25,15 L25,25" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M25,25 L15,25 L15,15" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
      </svg>
    );
  }
  if (id === 'sicoob') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#00363A" />
        <circle cx="20" cy="20" r="5" fill="#81C784" />
        <circle cx="20" cy="12" r="3" fill="#FFF176" />
        <circle cx="20" cy="28" r="3" fill="#FFF176" />
        <circle cx="12" cy="20" r="3" fill="#FFF176" />
        <circle cx="28" cy="20" r="3" fill="#FFF176" />
      </svg>
    );
  }
  if (id === 'sicredi') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#339933" />
        <path d="M20,12 C16,16 16,22 20,28 C24,22 24,16 20,12 Z" fill="#FFFFFF" />
      </svg>
    );
  }
  if (id === 'stone') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#00A859" />
        <text x="20" y="26.5" fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="18" text-anchor="middle">S</text>
      </svg>
    );
  }
  if (id === 'pagbank') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#006B75" />
        <path d="M12,15 L28,15 L28,25 L12,25 Z" fill="#FFCC00" />
        <text x="20" y="22" fill="#006B75" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="8" text-anchor="middle">PAG</text>
      </svg>
    );
  }
  if (id === 'picpay') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#11C76F" />
        <text x="20" y="27.5" fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="18" text-anchor="middle">P</text>
      </svg>
    );
  }
  if (id === 'mercadopago') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#00A6FF" />
        <path d="M13,22 C13,22 16,17 20,17 C24,17 27,22 27,22 M16,19 C16,19 18,22 20,22 C22,22 24,19 24,19" stroke="#FFFFFF" stroke-width="2.5" strokeLinecap="round" fill="none" />
      </svg>
    );
  }
  if (id === 'will') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#FFE600" />
        <text x="20" y="26.5" fill="#000000" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="18" text-anchor="middle">w</text>
      </svg>
    );
  }
  if (id === 'ame') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#FF007A" />
        <text x="20" y="25.5" fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="800" fontSize="13" text-anchor="middle">ame</text>
      </svg>
    );
  }
  if (id === 'agibank') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#E6007E" />
        <text x="20" y="24.5" fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="12" text-anchor="middle">ag:</text>
      </svg>
    );
  }
  if (id === 'safra') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#0C2340" />
        <rect x="12" y="12" width="16" height="16" rx="2" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
        <text x="20" y="23" fill="#D4AF37" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="8" text-anchor="middle">S</text>
      </svg>
    );
  }
  if (id === 'digio') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#003399" />
        <text x="20" y="24" fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="8" text-anchor="middle">digio</text>
      </svg>
    );
  }
  if (id === 'trigg') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#00D2C4" />
        <text x="20" y="24" fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="8" text-anchor="middle">Trigg</text>
      </svg>
    );
  }
  if (id === 'alelo') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#007D4A" />
        <circle cx="20" cy="20" r="8" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
        <circle cx="18" cy="18" r="3" fill="#FFFFFF" />
      </svg>
    );
  }
  if (id === 'caixatem') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#40C4FF" />
        <rect x="12" y="14" width="16" height="12" rx="3" fill="#FFFFFF" />
        <polygon points="16,26 20,26 18,29" fill="#FFFFFF" />
      </svg>
    );
  }
  if (id === 'paypal') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#003087" />
        <text x="17" y="25" fill="#0079C1" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="14" fontStyle="italic">P</text>
        <text x="21" y="27" fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="14" fontStyle="italic">P</text>
      </svg>
    );
  }
  if (id === 'binance') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#1E1E1E" />
        <polygon points="20,12 28,20 20,28 12,20" stroke="#F3BA2F" strokeWidth="2" fill="none" />
        <polygon points="20,16 24,20 20,24 16,20" fill="#F3BA2F" />
      </svg>
    );
  }
  if (id === 'pan') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#00A3E0" />
        <text x="20" y="26" fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="14" text-anchor="middle">pan</text>
      </svg>
    );
  }
  if (id === 'bari') {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
        <circle cx="20" cy="20" r="20" fill="#0A0A0A" />
        <text x="20" y="24.5" fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="900" fontSize="9" text-anchor="middle">bari.</text>
      </svg>
    );
  }

  // Default fallback (generic bank card logo)
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <circle cx="20" cy="20" r="20" fill="#2C2F36" />
      <rect x="11" y="14" width="18" height="12" rx="2" stroke="#6F768E" strokeWidth="2" fill="none" />
      <line x1="11" y1="18" x2="29" y2="18" stroke="#6F768E" strokeWidth="2" />
    </svg>
  );
};

const CardsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const currentMonth = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1;
  const currentMonthName = MONTHS_SHORT[currentMonth - 1] || 'JUN.';

  const [cards, setCards] = useState<CreditCard[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [open, setOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [brand, setBrand] = useState('MASTERCARD');
  const [limit, setLimit] = useState('R$ 0,00');
  const [initialInvoice, setInitialInvoice] = useState('R$ 0,00');
  const [accountId, setAccountId] = useState('');
  const [closingDay, setClosingDay] = useState(1);
  const [dueDay, setDueDay] = useState(1);
  const [color, setColor] = useState('#3B82F6');
  const [dynamicClosing, setDynamicClosing] = useState(false);
  const [dueBusinessDays, setDueBusinessDays] = useState(false);
  const [isMain, setIsMain] = useState(false);

  // Bank Selection Dialog states
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState('');

  // Popover state for color picker
  const [colorAnchor, setColorAnchor] = useState<null | HTMLElement>(null);

  // Card Options Menu state
  const [optionsAnchor, setOptionsAnchor] = useState<null | HTMLElement>(null);
  const [selectedCardForMenu, setSelectedCardForMenu] = useState<CreditCard | null>(null);

  const formatBRL = (value: number) => {
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${isNegative ? '-' : ''}R$ ${formatted}`;
  };

  const maskBRL = (valStr: string) => {
    const clean = valStr.replace(/\D/g, '');
    if (!clean) return 'R$ 0,00';
    const num = parseFloat(clean) / 100;
    return formatBRL(num);
  };

  const parseBRLToFloat = (valStr: string) => {
    const clean = valStr
      .replace(/R\$/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '.');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cardsRes, accountsRes] = await Promise.all([
        api.get('/cards'),
        api.get('/accounts')
      ]);
      setCards(cardsRes.data);
      setAccounts(accountsRes.data);
    } catch (err) {
      setError('Falha ao carregar as informações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCard(null);
    setName('');
    setBank('nubank');
    setBrand('MASTERCARD');
    setLimit('R$ 0,00');
    setInitialInvoice('R$ 0,00');
    setAccountId('');
    setClosingDay(1);
    setDueDay(1);
    setColor('#3B82F6');
    setDynamicClosing(false);
    setDueBusinessDays(false);
    setIsMain(false);
    setOpen(true);
  };

  const handleOpenEdit = (card: CreditCard) => {
    setEditingCard(card);
    setName(card.name);
    setBank(card.bank || 'nubank');
    setBrand(card.brand);
    setLimit(formatBRL(card.limitTotal));
    setInitialInvoice(formatBRL(card.initialInvoice || 0));
    setAccountId(card.accountId || '');
    setClosingDay(card.closingDay);
    setDueDay(card.dueDay);
    setColor(card.color || '#3B82F6');
    setDynamicClosing(card.dynamicClosing || false);
    setDueBusinessDays(card.dueBusinessDays || false);
    setIsMain(card.isMain || false);
    setOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    const lower = val.toLowerCase();
    if (lower.includes('nubank')) {
      setBank('nubank');
    } else if (lower.includes('inter')) {
      setBank('inter');
    } else if (lower.includes('itau') || lower.includes('itaú')) {
      setBank('itau');
    } else if (lower.includes('c6')) {
      setBank('c6');
    } else if (lower.includes('bradesco')) {
      setBank('bradesco');
    } else if (lower.includes('brasil') || lower.includes('banco do brasil')) {
      setBank('bb');
    } else if (lower.includes('santander')) {
      setBank('santander');
    } else if (lower.includes('caixa')) {
      setBank('caixa');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        brand,
        bank: bank || null,
        limitTotal: parseBRLToFloat(limit),
        initialInvoice: parseBRLToFloat(initialInvoice),
        accountId: accountId || null,
        closingDay,
        dueDay,
        color,
        dynamicClosing,
        dueBusinessDays,
        isMain
      };

      if (editingCard) {
        await api.put(`/cards/${editingCard.id}`, payload);
      } else {
        await api.post('/cards', payload);
      }
      setOpen(false);
      fetchData();
    } catch (err) {
      alert('Erro ao salvar o cartão.');
    }
  };

  const handleDelete = async (cardId: string) => {
    if (window.confirm('Deseja realmente excluir este cartão?')) {
      try {
        await api.delete(`/cards/${cardId}`);
        fetchData();
      } catch (err) {
        alert('Erro ao excluir cartão.');
      }
    }
  };

  const renderBrandLogo = (brandName: string) => {
    const cleanBrand = brandName.toUpperCase();
    if (cleanBrand === 'MASTERCARD') {
      return (
        <Box display="flex" alignItems="center" sx={{ width: 26, height: 16, justifyContent: 'center' }}>
          <Box sx={{ width: 10, height: 10, bgcolor: '#EB0015', borderRadius: '50%', mr: -0.6, zIndex: 2 }} />
          <Box sx={{ width: 10, height: 10, bgcolor: '#F79E1B', borderRadius: '50%', opacity: 0.95 }} />
        </Box>
      );
    }
    if (cleanBrand === 'VISA') {
      return (
        <Box sx={{ bgcolor: '#1A1F71', width: 26, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px' }}>
          <Typography sx={{ color: '#FFFFFF', fontWeight: 900, fontStyle: 'italic', fontSize: '0.45rem', letterSpacing: '0.02em' }}>
            VISA
          </Typography>
        </Box>
      );
    }
    if (cleanBrand === 'DINERS') {
      return (
        <Box sx={{ bgcolor: '#0079C1', width: 26, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px' }}>
          <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.45rem' }}>
            D
          </Typography>
        </Box>
      );
    }
    if (cleanBrand === 'AMEX') {
      return (
        <Box sx={{ bgcolor: '#0070CD', width: 26, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px' }}>
          <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.4rem', letterSpacing: '0.01em' }}>
            AMEX
          </Typography>
        </Box>
      );
    }
    if (cleanBrand === 'ELO') {
      return (
        <Box sx={{ bgcolor: '#000000', width: 26, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.45rem' }}>
            elo
          </Typography>
        </Box>
      );
    }
    // OUTRO
    return (
      <Box sx={{ bgcolor: '#3B82F6', width: 26, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px' }}>
        <CardIcon sx={{ color: '#FFFFFF', fontSize: '0.65rem' }} />
      </Box>
    );
  };

  const renderAccountIcon = (acc: Account | null) => {
    if (!acc) {
      return (
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: '#FFFFFF',
            color: '#13141B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <BankIcon sx={{ fontSize: '0.9rem' }} />
        </Box>
      );
    }

    const inst = acc.institution?.toLowerCase() || '';
    const bg = acc.color || '#3B82F6';

    let label = '';
    if (inst.includes('nubank') || inst === 'nu') {
      label = 'nu';
    } else if (inst.includes('inter')) {
      label = 'in';
    } else if (inst.includes('itau') || inst.includes('itaú')) {
      label = 'it';
    } else if (inst.includes('c6')) {
      label = 'c6';
    } else if (inst) {
      label = inst.substring(0, 2);
    }

    if (label) {
      return (
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: bg,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.65rem',
            fontWeight: 800,
            fontFamily: '"Inter", sans-serif',
            flexShrink: 0,
            textTransform: 'lowercase'
          }}
        >
          {label}
        </Box>
      );
    }

    // Default fallback
    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: bg,
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <BankIcon sx={{ fontSize: '0.9rem' }} />
      </Box>
    );
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3.5}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
            Cartões de Crédito
          </Typography>
          <Typography variant="body2" sx={{ color: '#7E8494', mt: 0.5 }}>
            Consulte limites, faturas e vencimentos de seus cartões cadastrados.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: '12px', fontWeight: 700 }}
        >
          Cadastrar Cartão
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress color="primary" />
        </Box>
      ) : cards.length === 0 ? (
        <Card sx={{ bgcolor: '#111217', border: '1px solid rgba(255,255,255,0.03)' }}>
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: '#7E8494' }}>
              Nenhum cartão de crédito cadastrado. Comece adicionando um cartão!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {[...cards]
            .sort((a, b) => (a.isMain === b.isMain ? 0 : a.isMain ? -1 : 1))
            .map((c) => {
            const usagePercent = c.limitTotal > 0 ? (c.limitUsed / c.limitTotal) * 100 : 0;
            const cardAccount = accounts.find(a => a.id === c.accountId);
            return (
              <Grid item xs={12} sm={6} md={4} key={c.id}>
                <Card sx={{
                  bgcolor: '#111217',
                  border: '1px solid rgba(255,255,255,0.03)',
                  borderLeft: `3px solid ${c.color || '#3B82F6'}`,
                  height: '100%',
                  background: `linear-gradient(135deg, ${(c.color || '#3B82F6')}0d 0%, #101116 100%)`,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  position: 'relative'
                }}>
                  <CardContent sx={{ p: 2.8, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {c.bank ? renderBankLogoSvg(c.bank, 38) : (
                            <Box sx={{ width: '100%', height: '100%', borderRadius: '10px', bgcolor: `${c.color || '#3B82F6'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color || '#3B82F6' }}>
                              <CardIcon fontSize="small" />
                            </Box>
                          )}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1.05rem', lineHeight: 1.2 }}>
                            {c.name}
                            {c.isMain && (
                              <Typography component="span" variant="caption" sx={{ color: '#3B82F6', ml: 1, fontWeight: 700 }}>
                                (Principal)
                              </Typography>
                            )}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.72rem' }}>
                            {c.brand}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Box sx={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', px: 1, py: 0.25, display: 'flex', alignItems: 'center' }}>
                          {renderBrandLogo(c.brand)}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setOptionsAnchor(e.currentTarget);
                            setSelectedCardForMenu(c);
                          }}
                          sx={{ color: '#6F768E' }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Limits breakdown */}
                    <Box display="flex" flexDirection="column" gap={0.8}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.72rem' }}>Em aberto</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#E05A5A', fontSize: '0.85rem' }}>
                          {formatBRL(c.limitUsed)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.72rem' }}>Limite disp.</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#4EBE87', fontSize: '0.85rem' }}>
                          {formatBRL(c.limitAvailable)}
                        </Typography>
                      </Box>
                      
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(usagePercent, 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          mt: 0.5,
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: c.color || '#3B82F6',
                            borderRadius: 4,
                          }
                        }}
                      />
                    </Box>

                    {/* Billing metadata */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ borderTop: '1px solid rgba(255,255,255,0.03)', pt: 1.8 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.68rem', display: 'block' }}>Conta</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.8rem', mt: 0.25 }}>
                          {cardAccount ? cardAccount.name : 'Nenhuma'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.68rem', display: 'block' }}>Fechamento</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.8rem', mt: 0.25 }}>
                          {c.closingDay.toString().padStart(2, '0')}/{currentMonthName}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.68rem', display: 'block' }}>Vencimento</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.8rem', mt: 0.25 }}>
                          {c.dueDay.toString().padStart(2, '0')}/{currentMonthName}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Card Actions Menu */}
      <Menu
        anchorEl={optionsAnchor}
        open={Boolean(optionsAnchor)}
        onClose={() => {
          setOptionsAnchor(null);
          setSelectedCardForMenu(null);
        }}
        PaperProps={{
          sx: {
            bgcolor: '#13141B',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '12px',
          }
        }}
      >
        <MenuItem
          onClick={() => {
            if (selectedCardForMenu) handleOpenEdit(selectedCardForMenu);
            setOptionsAnchor(null);
          }}
          sx={{ color: '#FFFFFF', fontSize: '0.85rem' }}
        >
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedCardForMenu) handleDelete(selectedCardForMenu.id);
            setOptionsAnchor(null);
          }}
          sx={{ color: '#FF5252', fontSize: '0.85rem' }}
        >
          Excluir
        </MenuItem>
      </Menu>

      {/* DIALOG: Criar / Editar Cartão de Crédito */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#13141B',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.04)',
            boxShadow: '0px 10px 45px rgba(0, 0, 0, 0.65)',
            p: 1.5,
          }
        }}
      >
        <form onSubmit={handleSave}>
          {/* Header Bar */}
          <Box display="flex" justifyContent="space-between" alignItems="center" px={1} pb={1.5} borderBottom="1px solid rgba(255,255,255,0.04)">
            <IconButton onClick={() => setOpen(false)} sx={{ color: '#6F768E', p: 0.5 }}>
              <CloseIcon />
            </IconButton>
            <Typography sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1rem', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
              {editingCard ? 'Editar Cartão' : 'Novo Cartão'}
            </Typography>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: '#3B82F6',
                color: '#FFFFFF',
                borderRadius: '20px',
                px: 2.5,
                py: 0.5,
                fontWeight: 700,
                fontSize: '0.8rem',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' }
              }}
            >
              Salvar
            </Button>
          </Box>

          <Box display="flex" flexDirection="column" mt={1.5}>
            {/* Row 1: Descrição (and Color / Brand Icon options) */}
            <Box display="flex" alignItems="center" gap={2} py={1.5} px={1} borderBottom="1px solid rgba(255,255,255,0.04)">
              <NotesIcon sx={{ color: '#6F768E' }} />
              <TextField
                fullWidth
                placeholder="Descrição"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '1rem',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                  }
                }}
                required
              />

              {/* Color preview circle */}
              <Box
                onClick={(e) => setColorAnchor(e.currentTarget)}
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: color,
                  cursor: 'pointer',
                  border: '2px solid rgba(255,255,255,0.2)',
                  flexShrink: 0,
                  transition: 'transform 0.1s',
                  '&:hover': { transform: 'scale(1.1)' }
                }}
              />

              {/* Mini Bank Selector Indicator */}
              <Box
                onClick={() => setBankDialogOpen(true)}
                sx={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                  '&:hover': { transform: 'scale(1.15)' }
                }}
              >
                {bank ? (
                  <Box sx={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', p: '1px', display: 'flex', alignItems: 'center' }}>
                    {renderBankLogoSvg(bank, 26)}
                  </Box>
                ) : (
                  <Box sx={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', px: 0.8, py: 0.25, display: 'flex', alignItems: 'center', bgcolor: '#1A1B23', height: 26, boxSizing: 'border-box' }}>
                    {renderBrandLogo(brand)}
                  </Box>
                )}
              </Box>
            </Box>

            {/* Row 2: Limite */}
            <Box display="flex" alignItems="center" justifyContent="space-between" py={1.5} px={1} borderBottom="1px solid rgba(255,255,255,0.04)">
              <Box display="flex" alignItems="center" gap={2}>
                <MoneyIcon sx={{ color: '#6F768E' }} />
                <Typography sx={{ color: '#FFFFFF', fontWeight: 500, fontSize: '0.9rem' }}>Limite</Typography>
              </Box>
              <TextField
                value={limit}
                onChange={(e) => setLimit(maskBRL(e.target.value))}
                variant="standard"
                inputProps={{ style: { textAlign: 'right' } }}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                  }
                }}
                required
              />
            </Box>

            {/* Row 3: Fatura atual */}
            <Box display="flex" alignItems="center" justifyContent="space-between" py={1.5} px={1} borderBottom="1px solid rgba(255,255,255,0.04)">
              <Box display="flex" alignItems="center" gap={2}>
                <PaymentsIcon sx={{ color: '#6F768E' }} />
                <Typography sx={{ color: '#FFFFFF', fontWeight: 500, fontSize: '0.9rem' }}>Fatura atual</Typography>
              </Box>
              <TextField
                value={initialInvoice}
                onChange={(e) => setInitialInvoice(maskBRL(e.target.value))}
                variant="standard"
                inputProps={{ style: { textAlign: 'right' } }}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                  }
                }}
                required
              />
            </Box>

            {/* Row 4: Bandeira */}
            <Box display="flex" alignItems="center" justifyContent="space-between" py={1.5} px={1} borderBottom="1px solid rgba(255,255,255,0.04)">
              <Box display="flex" alignItems="center" gap={2}>
                <CardIcon sx={{ color: '#6F768E' }} />
                <Typography sx={{ color: '#FFFFFF', fontWeight: 500, fontSize: '0.9rem' }}>Bandeira</Typography>
              </Box>
              <TextField
                select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                variant="standard"
                SelectProps={{
                  renderValue: (val) => {
                    const bName = val as string;
                    const labelMap: Record<string, string> = {
                      MASTERCARD: 'MasterCard',
                      VISA: 'VISA',
                      DINERS: 'Diners Club',
                      AMEX: 'Amex',
                      ELO: 'Elo',
                      OUTRO: 'Outro'
                    };
                    return (
                      <Box display="flex" alignItems="center" gap={1.2} justifyContent="flex-end">
                        {renderBrandLogo(bName)}
                        <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 600 }}>{labelMap[bName] || bName}</Typography>
                      </Box>
                    );
                  }
                }}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textAlign: 'right',
                  }
                }}
                sx={{ minWidth: 160 }}
              >
                {CARDS_BRANDS.map(b => {
                  const labelMap: Record<string, string> = {
                    MASTERCARD: 'MasterCard',
                    VISA: 'VISA',
                    DINERS: 'Diners Club',
                    AMEX: 'Amex',
                    ELO: 'Elo',
                    OUTRO: 'Outro'
                  };
                  return (
                    <MenuItem key={b} value={b}>
                      <Box display="flex" alignItems="center" gap={1.2}>
                        {renderBrandLogo(b)}
                        <Typography fontSize="0.9rem">{labelMap[b]}</Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </TextField>
            </Box>

            {/* Row 5: Conta (Associated bank checking account) */}
            <Box display="flex" alignItems="center" justifyContent="space-between" py={1.5} px={1} borderBottom="1px solid rgba(255,255,255,0.04)">
              <Box display="flex" alignItems="center" gap={2}>
                <BankIcon sx={{ color: '#6F768E' }} />
                <Typography sx={{ color: '#FFFFFF', fontWeight: 500, fontSize: '0.9rem' }}>Conta</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <TextField
                  select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  variant="standard"
                  SelectProps={{
                    renderValue: (val) => {
                      const selectedAcc = accounts.find(a => a.id === val);
                      return (
                        <Box display="flex" alignItems="center" gap={1} justifyContent="flex-end">
                          {renderAccountIcon(selectedAcc || null)}
                          <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 600 }}>
                            {selectedAcc ? selectedAcc.name : 'Nenhuma'}
                          </Typography>
                        </Box>
                      );
                    }
                  }}
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      textAlign: 'right',
                    }
                  }}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="">
                    <Box display="flex" alignItems="center" gap={1.2}>
                      {renderAccountIcon(null)}
                      <Typography fontSize="0.9rem">Nenhuma</Typography>
                    </Box>
                  </MenuItem>
                  {accounts.map(acc => (
                    <MenuItem key={acc.id} value={acc.id}>
                      <Box display="flex" alignItems="center" gap={1.2}>
                        {renderAccountIcon(acc)}
                        <Typography fontSize="0.9rem">{acc.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
                <Tooltip title="Vincule uma conta para débito de fatura">
                  <HelpIcon sx={{ color: '#6F768E', fontSize: '1rem', cursor: 'pointer' }} />
                </Tooltip>
              </Box>
            </Box>

            {/* Row 6: Fecha dia */}
            <Box display="flex" alignItems="center" justifyContent="space-between" py={1.5} px={1} borderBottom="1px solid rgba(255,255,255,0.04)">
              <Box display="flex" alignItems="center" gap={2}>
                <CalendarIcon sx={{ color: '#6F768E' }} />
                <Typography sx={{ color: '#FFFFFF', fontWeight: 500, fontSize: '0.9rem' }}>Fecha dia</Typography>
              </Box>
              <TextField
                select
                value={closingDay}
                onChange={(e) => setClosingDay(parseInt(e.target.value))}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textAlign: 'right',
                  }
                }}
                sx={{ minWidth: 60 }}
              >
                {Array.from({ length: 31 }, (_, i) => {
                  const dayVal = i + 1;
                  const dayStr = dayVal.toString().padStart(2, '0');
                  return <MenuItem key={dayVal} value={dayVal}>{dayStr}</MenuItem>;
                })}
              </TextField>
            </Box>

            {/* Row 7: Fechamento dinâmico (Sub-row indented) */}
            <Box display="flex" alignItems="center" justifyContent="space-between" py={1.25} pl={5.25} pr={1} borderBottom="1px solid rgba(255,255,255,0.04)">
              <Typography sx={{ color: '#7E8494', fontWeight: 500, fontSize: '0.85rem' }}>Fechamento dinâmico</Typography>
              <Switch
                checked={dynamicClosing}
                onChange={(e) => setDynamicClosing(e.target.checked)}
                size="small"
                color="primary"
              />
            </Box>

            {/* Row 8: Vence dia */}
            <Box display="flex" alignItems="center" justifyContent="space-between" py={1.5} px={1} borderBottom="1px solid rgba(255,255,255,0.04)">
              <Box display="flex" alignItems="center" gap={2}>
                <CalendarIcon sx={{ color: '#6F768E' }} />
                <Typography sx={{ color: '#FFFFFF', fontWeight: 500, fontSize: '0.9rem' }}>Vence dia</Typography>
              </Box>
              <TextField
                select
                value={dueDay}
                onChange={(e) => setDueDay(parseInt(e.target.value))}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textAlign: 'right',
                  }
                }}
                sx={{ minWidth: 60 }}
              >
                {Array.from({ length: 31 }, (_, i) => {
                  const dayVal = i + 1;
                  const dayStr = dayVal.toString().padStart(2, '0');
                  return <MenuItem key={dayVal} value={dayVal}>{dayStr}</MenuItem>;
                })}
              </TextField>
            </Box>

            {/* Row 9: Vencimento em dias úteis (Sub-row indented) */}
            <Box display="flex" alignItems="center" justifyContent="space-between" py={1.25} pl={5.25} pr={1} borderBottom="1px solid rgba(255,255,255,0.04)">
              <Typography sx={{ color: '#7E8494', fontWeight: 500, fontSize: '0.85rem' }}>Vencimento em dias úteis</Typography>
              <Switch
                checked={dueBusinessDays}
                onChange={(e) => setDueBusinessDays(e.target.checked)}
                size="small"
                color="primary"
              />
            </Box>

            {/* Row 10: Cartão principal */}
            <Box display="flex" alignItems="center" justifyContent="space-between" py={1.5} px={1}>
              <Box display="flex" alignItems="center" gap={2}>
                <CardIcon sx={{ color: '#6F768E' }} />
                <Typography sx={{ color: '#FFFFFF', fontWeight: 500, fontSize: '0.9rem' }}>Cartão principal</Typography>
              </Box>
              <Switch
                checked={isMain}
                onChange={(e) => setIsMain(e.target.checked)}
                size="small"
                color="primary"
              />
            </Box>
          </Box>
        </form>
      </Dialog>

      {/* Color choices popover */}
      <Popover
        open={Boolean(colorAnchor)}
        anchorEl={colorAnchor}
        onClose={() => setColorAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{
          sx: {
            p: 1.5,
            bgcolor: '#1E1F28',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            maxWidth: 160
          }
        }}
      >
        <Grid container spacing={1} justifyContent="center">
          {CARD_COLORS.map(c => (
            <Grid item key={c}>
              <Box
                onClick={() => {
                  setColor(c);
                  setColorAnchor(null);
                }}
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  bgcolor: c,
                  cursor: 'pointer',
                  border: c === color ? '2px solid #FFFFFF' : '2px solid transparent',
                  '&:hover': { transform: 'scale(1.15)' },
                  transition: 'all 0.12s'
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Popover>

      {/* DIALOG: Selecionar imagem (Bank Logo Selector) */}
      <Dialog
        open={bankDialogOpen}
        onClose={() => {
          setBankDialogOpen(false);
          setBankSearchQuery('');
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#13141B',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.04)',
            boxShadow: '0px 10px 45px rgba(0, 0, 0, 0.65)',
            p: 1.5,
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        {/* Header Bar */}
        <Box display="flex" justifyContent="space-between" alignItems="center" px={1} pb={1.5} borderBottom="1px solid rgba(255,255,255,0.04)">
          <IconButton
            onClick={() => {
              setBankDialogOpen(false);
              setBankSearchQuery('');
            }}
            sx={{ color: '#6F768E', p: 0.5 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1rem', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            Selecionar imagem
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <SearchIcon sx={{ color: '#6F768E', fontSize: '1.2rem' }} />
            <AddIcon sx={{ color: '#6F768E', fontSize: '1.2rem' }} />
          </Box>
        </Box>

        {/* Search bar inside dialog */}
        <Box px={1} pt={1.5}>
          <TextField
            fullWidth
            placeholder="Buscar banco..."
            value={bankSearchQuery}
            onChange={(e) => setBankSearchQuery(e.target.value)}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                color: '#FFFFFF',
                bgcolor: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                px: 2,
                py: 1,
                fontSize: '0.85rem',
              }
            }}
          />
        </Box>

        {/* Bank Grid */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 1.5,
            mt: 1,
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }
          }}
        >
          <Grid container spacing={2.5} justifyContent="flex-start">
            {BANKS_LIST.filter(b => b.name.toLowerCase().includes(bankSearchQuery.toLowerCase()))
              .map(b => (
                <Grid item xs={2.4} key={b.id} display="flex" justifyContent="center">
                  <Box
                    onClick={() => {
                      setBank(b.id);
                      setBankDialogOpen(false);
                      setBankSearchQuery('');
                    }}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: '50%',
                      p: 0.5,
                      border: b.id === bank ? '2px solid #3B82F6' : '2px solid transparent',
                      bgcolor: b.id === bank ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      transition: 'transform 0.1s, background-color 0.1s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        transform: 'scale(1.15)',
                        bgcolor: 'rgba(255,255,255,0.03)',
                      }
                    }}
                  >
                    {renderBankLogoSvg(b.id, 40)}
                  </Box>
                </Grid>
              ))}
          </Grid>
        </Box>
      </Dialog>
    </Box>
  );
};

export default CardsPage;
