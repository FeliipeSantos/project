import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../config/api';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogContent,
  TextField,
  MenuItem,
  Switch,
  Grid,
  Menu,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  AccountBalance as AccountIcon,
  Layers as CategoryIcon,
  LocalOffer as TagIcon,
  ArrowForwardIos as ChevronRightIcon,
  PlaylistAdd as SubcategoryIcon,
  CreditCard as CardIcon,
  Close as CloseIcon,
  Notes as NotesIcon,
  AttachFile as AttachmentIcon,
  Person as PersonIcon,
  HelpOutline as HelpIcon,
  Add as AddIcon,
  MoreHoriz as OptionsIcon,
  Restaurant as RestaurantIcon,
  Tv as TvIcon,
  DirectionsRun as RunIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  DesktopWindows as DesktopIcon,
  People as PeopleIcon,
  ShowChart as ChartIcon,
  SportsEsports as GameIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

// ── Types & Interfaces ────────────────────────────────────────
interface Account {
  id: string;
  name: string;
  institution: string;
  balanceInitial: number;
  balanceCurrent: number;
  color: string;
  type: string;
  active: boolean;
}

interface Category {
  id: string;
  name: string;
  type: string;
  parentCategoryId?: string;
  color?: string;
  icon?: string;
}

const getCategoryIcon = (iconName?: string, catName: string = '') => {
  if (iconName) {
    if (iconName === 'RestaurantIcon') return <RestaurantIcon fontSize="small" />;
    if (iconName === 'TvIcon') return <TvIcon fontSize="small" />;
    if (iconName === 'CardIcon') return <CardIcon fontSize="small" />;
    if (iconName === 'RunIcon') return <RunIcon fontSize="small" />;
    if (iconName === 'SchoolIcon') return <SchoolIcon fontSize="small" />;
    if (iconName === 'BusinessIcon') return <BusinessIcon fontSize="small" />;
    if (iconName === 'DesktopIcon') return <DesktopIcon fontSize="small" />;
    if (iconName === 'PeopleIcon') return <PeopleIcon fontSize="small" />;
    if (iconName === 'ChartIcon') return <ChartIcon fontSize="small" />;
    if (iconName === 'GameIcon') return <GameIcon fontSize="small" />;
    if (iconName === 'HomeIcon') return <HomeIcon fontSize="small" />;
    if (iconName === 'HelpIcon') return <HelpIcon fontSize="small" />;
  }
  const n = catName.toLowerCase();
  if (n.includes('alimentação') || n.includes('delivery')) return <RestaurantIcon fontSize="small" />;
  if (n.includes('assinatura')) return <TvIcon fontSize="small" />;
  if (n.includes('cartão') || n.includes('crédito')) return <CardIcon fontSize="small" />;
  if (n.includes('reembolsável') || n.includes('reembolso')) return <RunIcon fontSize="small" />;
  if (n.includes('educação')) return <SchoolIcon fontSize="small" />;
  if (n.includes('empresa') || n.includes('trabalho')) return <BusinessIcon fontSize="small" />;
  if (n.includes('escritório') || n.includes('papelaria')) return <DesktopIcon fontSize="small" />;
  if (n.includes('família')) return <PeopleIcon fontSize="small" />;
  if (n.includes('investimento')) return <ChartIcon fontSize="small" />;
  if (n.includes('lazer') || n.includes('viagem')) return <GameIcon fontSize="small" />;
  if (n.includes('casa') || n.includes('moradia')) return <HomeIcon fontSize="small" />;
  return <HelpIcon fontSize="small" />;
};

interface CreditCard {
  id: string;
  name: string;
  bank: string;
  brand: string;
  limitTotal: number;
  limitAvailable: number;
  limitUsed: number;
  closingDay: number;
  dueDay: number;
}

interface Installment {
  installmentNumber: number;
  totalInstallments: number;
  value: number;
  status: string;
}

interface Transaction {
  id: string;
  accountId?: string;
  destinationAccountId?: string;
  categoryId: string;
  creditCardId?: string;
  value: number;
  date: string;
  type: 'REVENUE' | 'EXPENSE' | 'TRANSFER';
  description: string;
  notes?: string;
  tags?: string;
  installments?: Installment[];
}

const AVAILABLE_ICONS = [
  { value: 'RestaurantIcon', label: 'Alimentação / Delivery', component: <RestaurantIcon fontSize="small" /> },
  { value: 'TvIcon', label: 'Assinaturas / Lazer', component: <TvIcon fontSize="small" /> },
  { value: 'CardIcon', label: 'Cartões / Crédito', component: <CardIcon fontSize="small" /> },
  { value: 'RunIcon', label: 'Reembolsos / Esportes', component: <RunIcon fontSize="small" /> },
  { value: 'SchoolIcon', label: 'Educação / Cursos', component: <SchoolIcon fontSize="small" /> },
  { value: 'BusinessIcon', label: 'Trabalho / Negócios', component: <BusinessIcon fontSize="small" /> },
  { value: 'DesktopIcon', label: 'Tecnologia / Escritório', component: <DesktopIcon fontSize="small" /> },
  { value: 'PeopleIcon', label: 'Família / Filhos', component: <PeopleIcon fontSize="small" /> },
  { value: 'ChartIcon', label: 'Investimentos', component: <ChartIcon fontSize="small" /> },
  { value: 'GameIcon', label: 'Jogos / Entretenimento', component: <GameIcon fontSize="small" /> },
  { value: 'HomeIcon', label: 'Casa / Moradia', component: <HomeIcon fontSize="small" /> },
  { value: 'HelpIcon', label: 'Outros / Geral', component: <HelpIcon fontSize="small" /> },
];

const AVAILABLE_COLORS = [
  { value: '#EC407A', label: 'Rosa' },
  { value: '#5C6BC0', label: 'Azul Escuro' },
  { value: '#26A69A', label: 'Verde Água' },
  { value: '#26C6DA', label: 'Azul Claro' },
  { value: '#42A5F5', label: 'Azul' },
  { value: '#AB47BC', label: 'Roxo' },
  { value: '#66BB6A', label: 'Verde' },
  { value: '#FFCA28', label: 'Amarelo' },
  { value: '#7E57C2', label: 'Roxo Escuro' },
  { value: '#7E8494', label: 'Cinza' },
];

const TransactionsPage: React.FC = () => {
  // ── States & Params ──────────────────────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();
  const queryMonth = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1;
  const queryYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'REVENUE' | 'TRANSFER' | 'STATEMENT'>('EXPENSE');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit / Action Menu states
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);

  // Modal open states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCardExpense, setIsCardExpense] = useState(false);

  // Pickers States
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(new Date());
  const [tempHour, setTempHour] = useState(8);
  const [tempMinute, setTempMinute] = useState(34);
  const [timePickerMode, setTimePickerMode] = useState<'HOURS' | 'MINUTES'>('HOURS');
  const [timePickerViewMode, setTimePickerViewMode] = useState<'DIAL' | 'KEYBOARD'>('DIAL');
  const [focusedField, setFocusedField] = useState<'HOURS' | 'MINUTES' | null>(null);
  const [isDraggingTime, setIsDraggingTime] = useState(false);
  const [rawHourStr, setRawHourStr] = useState('08');
  const [rawMinuteStr, setRawMinuteStr] = useState('34');

  // Form Field States
  const [txDesc, setTxDesc] = useState('');
  const [txValue, setTxValue] = useState('R$ 0,00');

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
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txTimeVal, setTxTimeVal] = useState('08:34');
  const [txType, setTxType] = useState<'REVENUE' | 'EXPENSE' | 'TRANSFER'>('EXPENSE');
  const [txAccountId, setTxAccountId] = useState('');
  const [txDestAccountId, setTxDestAccountId] = useState('');
  const [txCategoryId, setTxCategoryId] = useState('');
  const [txSubcategoryId, setTxSubcategoryId] = useState('');
  const [txCardId, setTxCardId] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [txTags, setTxTags] = useState('');
  const [txInstallments, setTxInstallments] = useState('1');

  // Quick creation dialog states
  const [quickCatOpen, setQuickCatOpen] = useState(false);
  const [quickSubOpen, setQuickSubOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [quickCatColor, setQuickCatColor] = useState('#7E8494');
  const [quickCatIcon, setQuickCatIcon] = useState('HelpIcon');
  const [quickSubName, setQuickSubName] = useState('');
  const [quickSubColor, setQuickSubColor] = useState('#7E8494');
  const [quickSubIcon, setQuickSubIcon] = useState('HelpIcon');

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, accRes, catRes, cardRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/accounts'),
        api.get('/categories'),
        api.get('/cards'),
      ]);
      setTransactions(txRes.data);
      setAccounts(accRes.data);
      setCategories(catRes.data);
      setCards(cardRes.data);
    } catch (err) {
      setError('Falha ao carregar as transações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Time formatting sync
  useEffect(() => {
    if (focusedField !== 'HOURS') {
      setRawHourStr(tempHour.toString().padStart(2, '0'));
    }
  }, [tempHour, focusedField]);

  useEffect(() => {
    if (focusedField !== 'MINUTES') {
      setRawMinuteStr(tempMinute.toString().padStart(2, '0'));
    }
  }, [tempMinute, focusedField]);

  // Sync Quick Add params
  useEffect(() => {
    if (searchParams.get('new_tx') === 'true') {
      setIsEditing(false);
      const typeParam = searchParams.get('tx_type');
      let targetType: 'REVENUE' | 'EXPENSE' | 'TRANSFER' = 'EXPENSE';
      let targetCardId = '';
      let isCard = false;

      if (typeParam === 'REVENUE') {
        targetType = 'REVENUE';
      } else if (typeParam === 'TRANSFER') {
        targetType = 'TRANSFER';
      } else if (typeParam === 'EXPENSE_CARD') {
        targetType = 'EXPENSE';
        isCard = true;
        if (cards.length > 0) {
          targetCardId = cards[0].id;
        }
      }

      setTxType(targetType);
      setTxCardId(targetCardId);
      setIsCardExpense(isCard);

      // Pre-select account/dest
      if (accounts.length > 0) setTxAccountId(accounts[0].id);
      if (targetType === 'TRANSFER' && accounts.length > 1) {
        setTxDestAccountId(accounts[1].id);
      } else if (accounts.length > 0) {
        setTxDestAccountId(accounts[0].id);
      }

      // Pre-select category matching type
      const filteredCats = categories.filter((cat) => targetType === 'TRANSFER' || cat.type === targetType);
      if (filteredCats.length > 0) setTxCategoryId(filteredCats[0].id);

      setTxDesc('');
      setTxValue('R$ 0,00');
      setTxDate(new Date().toISOString().split('T')[0]);
      setTxNotes('');
      setTxTags('');
      setTxInstallments('1');
      setTxTimeVal('08:34');
      setTempHour(8);
      setTempMinute(34);

      setModalOpen(true);
    }
  }, [searchParams, cards, accounts, categories]);

  // Handle Create/Update Transaction Submit
  const handleSubmitTx = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        description: txDesc,
        value: parseBRLToFloat(txValue),
        date: txDate,
        type: txType,
        accountId: txAccountId || null,
        destinationAccountId: txType === 'TRANSFER' ? txDestAccountId : null,
        categoryId: txSubcategoryId || txCategoryId || null,
        creditCardId: txType === 'EXPENSE' && txCardId ? txCardId : null,
        notes: txNotes,
        tags: txTags,
        installmentsCount: parseInt(txInstallments) > 1 ? parseInt(txInstallments) : null,
      };

      if (isEditing && activeTx) {
        await api.put(`/transactions/${activeTx.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }

      handleCloseModal();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar transação.');
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setSearchParams((prev) => {
      prev.delete('new_tx');
      prev.delete('tx_type');
      return prev;
    });
  };

  const handleOpenEdit = (tx: Transaction) => {
    setMenuAnchor(null);
    setActiveTx(tx);
    setIsEditing(true);

    setTxDesc(tx.description);
    setTxValue(formatBRL(tx.value));
    setTxDate(tx.date);
    setTxType(tx.type);
    setTxAccountId(tx.accountId || '');
    setTxDestAccountId(tx.destinationAccountId || '');
    const cat = categories.find(c => c.id === tx.categoryId);
    if (cat && cat.parentCategoryId) {
      setTxCategoryId(cat.parentCategoryId);
      setTxSubcategoryId(cat.id);
    } else {
      setTxCategoryId(tx.categoryId || '');
      setTxSubcategoryId('');
    }
    setTxCardId(tx.creditCardId || '');
    setTxNotes(tx.notes || '');
    setTxTags(tx.tags || '');
    setIsCardExpense(!!tx.creditCardId);
    setTxInstallments(tx.installments?.length?.toString() || '1');

    // Parse time if possible or default
    setTxTimeVal('08:34');
    setTempHour(8);
    setTempMinute(34);

    setModalOpen(true);
  };

  const handleQuickCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: quickCatName,
        type: txType,
        color: quickCatColor,
        icon: quickCatIcon || 'CategoryIcon',
      };
      const res = await api.post('/categories', payload);
      setCategories((prev) => [...prev, res.data]);
      setTxCategoryId(res.data.id);
      setTxSubcategoryId('');
      setQuickCatName('');
      setQuickCatOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar categoria rápida.');
    }
  };

  const handleQuickCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txCategoryId) return;
    try {
      const parent = categories.find(c => c.id === txCategoryId);
      const payload = {
        name: quickSubName,
        type: txType,
        parentCategoryId: txCategoryId,
        color: quickSubColor || parent?.color || '#7E8494',
        icon: quickSubIcon || 'SubcategoryIcon',
      };
      const res = await api.post('/categories', payload);
      setCategories((prev) => [...prev, res.data]);
      setTxSubcategoryId(res.data.id);
      setQuickSubName('');
      setQuickSubOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar subcategoria rápida.');
    }
  };

  const handleDeleteTx = async () => {
    if (!activeTx) return;
    if (window.confirm('Tem certeza de que deseja excluir esta transação?')) {
      try {
        await api.delete(`/transactions/${activeTx.id}`);
        setMenuAnchor(null);
        setActiveTx(null);
        fetchData();
      } catch (err) {
        alert('Erro ao excluir transação.');
      }
    }
  };

  // ── Helpers ──────────────────────────────────────────────────
  const getThemeColor = () => {
    if (txType === 'REVENUE') return '#4EBE87';
    if (txType === 'TRANSFER') return '#F4A261';
    if (isCardExpense) return '#3B82F6';
    return '#E05A5A';
  };

  const formatDateToPtBr = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const formatSelectedDatePtBr = (d: Date) => {
    if (!d || isNaN(d.getTime())) return '';
    const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    const monthsShort = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const dayName = weekdays[d.getDay()];
    const dayNum = d.getDate();
    const monthName = monthsShort[d.getMonth()];
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}., ${dayNum} de ${monthName}.`;
  };

  const getDaysInMonthGrid = (viewDate: Date) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const daysGrid = [];
    for (let i = 0; i < firstDayIndex; i++) daysGrid.push(null);
    for (let i = 1; i <= totalDays; i++) daysGrid.push(new Date(year, month, i));
    return daysGrid;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    if (!d1 || !d2) return false;
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const handleClockInteraction = (clientX: number, clientY: number, currentTarget: SVGSVGElement) => {
    const rect = currentTarget.getBoundingClientRect();
    const clickX = clientX - rect.left - 110;
    const clickY = clientY - rect.top - 110;

    let angleRad = Math.atan2(clickY, clickX);
    let angleDeg = (angleRad * 180) / Math.PI;
    let normalized = angleDeg + 90;
    if (normalized < 0) normalized += 360;

    if (timePickerMode === 'HOURS') {
      const distance = Math.sqrt(clickX * clickX + clickY * clickY);
      const position = Math.round(normalized / 30) % 12;
      const isInner = distance < 68;
      let hour = isInner ? (position === 0 ? 0 : position + 12) : (position === 0 ? 12 : position);
      setTempHour(hour);
    } else {
      const minute = Math.round(normalized / 6) % 60;
      setTempMinute(minute);
    }
  };

  // Rendering brand logo SVG
  const renderCardBrandIcon = (brand: string) => {
    const bName = brand?.toUpperCase() || '';
    if (bName === 'MASTERCARD') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', width: 22, height: 14 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#EB001B', position: 'absolute', left: 0 }} />
          <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#FF5F00', position: 'absolute', left: 8, opacity: 0.85 }} />
        </Box>
      );
    }
    if (bName === 'VISA') {
      return (
        <Box sx={{
          bgcolor: '#0E4595',
          borderRadius: '3px',
          px: 0.5,
          py: 0.1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 14,
        }}>
          <Typography sx={{ color: '#FFFFFF', fontSize: '8px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.5px', lineHeight: 1 }}>
            VISA
          </Typography>
        </Box>
      );
    }
    return (
      <Box sx={{
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '3px',
        px: 0.5,
        py: 0.1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 14,
      }}>
        <Typography sx={{ color: '#7E8494', fontSize: '8px', fontWeight: 800, lineHeight: 1 }}>
          {brand}
        </Typography>
      </Box>
    );
  };

  // Rendering bank logo
  const renderBankLogo = (institution: string) => {
    const name = institution?.toLowerCase() || '';
    if (name.includes('nubank')) {
      return (
        <Avatar
          sx={{
            bgcolor: '#830AD1',
            color: '#FFFFFF',
            width: 24,
            height: 24,
            fontSize: '0.7rem',
            fontWeight: 700,
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          nu
        </Avatar>
      );
    }
    if (name.includes('c6')) {
      return (
        <Avatar
          sx={{
            bgcolor: '#000000',
            color: '#F5C124',
            width: 24,
            height: 24,
            fontSize: '0.7rem',
            fontWeight: 800,
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          C6
        </Avatar>
      );
    }
    if (name.includes('inter')) {
      return (
        <Avatar
          sx={{
            bgcolor: '#FF7A00',
            color: '#FFFFFF',
            width: 24,
            height: 24,
            fontSize: '0.7rem',
            fontWeight: 700,
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          IN
        </Avatar>
      );
    }
    if (name.includes('itau') || name.includes('itaú')) {
      return (
        <Avatar
          sx={{
            bgcolor: '#EC7000',
            color: '#002E7A',
            width: 24,
            height: 24,
            fontSize: '0.7rem',
            fontWeight: 800,
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          IT
        </Avatar>
      );
    }
    return (
      <Avatar
        sx={{
          bgcolor: '#2D303E',
          color: '#7E8494',
          width: 24,
          height: 24,
          fontSize: '0.7rem',
          fontWeight: 700,
        }}
      >
        {institution?.charAt(0).toUpperCase() || 'B'}
      </Avatar>
    );
  };

  const renderCategoryChip = (cat: Category) => {
    const color = cat.color || '#7E8494';
    return (
      <Box
        key={cat.id}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          bgcolor: `${color}15`,
          color: color,
          border: `1.5px solid ${color}30`,
          borderRadius: '16px',
          px: 1.25,
          py: 0.25,
          fontSize: '0.7rem',
          fontWeight: 700,
        }}
      >
        {cat.name}
        <Typography component="span" sx={{ fontSize: '0.7rem', fontWeight: 800, ml: 0.25 }}>
          ❯
        </Typography>
      </Box>
    );
  };

  const getCategoryChips = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return null;
    if (cat.parentCategoryId) {
      const parent = categories.find(p => p.id === cat.parentCategoryId);
      return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {parent && renderCategoryChip(parent)}
          {renderCategoryChip(cat)}
        </Box>
      );
    }
    return renderCategoryChip(cat);
  };

  // ── Filter and Sums ──────────────────────────────────────────
  const monthlyFiltered = transactions.filter((t) => {
    if (!t.date) return false;
    const tDate = new Date(t.date);
    const tMonth = tDate.getMonth() + 1;
    const tYear = tDate.getFullYear();
    return tMonth === queryMonth && tYear === queryYear;
  });

  const tabFiltered = monthlyFiltered.filter((t) => {
    if (activeTab === 'STATEMENT') return true;
    if (activeTab === 'EXPENSE') return t.type === 'EXPENSE';
    if (activeTab === 'REVENUE') return t.type === 'REVENUE';
    if (activeTab === 'TRANSFER') return t.type === 'TRANSFER';
    return true;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const sumEffective = tabFiltered
    .filter((t) => t.date <= todayStr)
    .reduce((acc, t) => {
      if (activeTab === 'STATEMENT') {
        if (t.type === 'REVENUE') return acc + Number(t.value || 0);
        if (t.type === 'EXPENSE') return acc - Number(t.value || 0);
        return acc; // transfer neutral
      }
      return acc + Number(t.value || 0);
    }, 0);

  const sumPending = tabFiltered
    .filter((t) => t.date > todayStr)
    .reduce((acc, t) => {
      if (activeTab === 'STATEMENT') {
        if (t.type === 'REVENUE') return acc + Number(t.value || 0);
        if (t.type === 'EXPENSE') return acc - Number(t.value || 0);
        return acc;
      }
      return acc + Number(t.value || 0);
    }, 0);

  const sumTotal = sumEffective + sumPending;

  // Tabs headers configurations
  const TABS_CONFIG = [
    { key: 'EXPENSE', label: 'Despesas', color: '#E05A5A' },
    { key: 'REVENUE', label: 'Receitas', color: '#4EBE87' },
    { key: 'TRANSFER', label: 'Transferências', color: '#F4A261' },
    { key: 'STATEMENT', label: 'Extrato', color: '#3B82F6' },
  ] as const;

  const monthsFull = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 10 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Tabs Header */}
      <Box
        sx={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
          mb: 3,
          gap: 4,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {TABS_CONFIG.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              sx={{
                color: isActive ? tab.color : '#7E8494',
                fontSize: '0.9rem',
                fontWeight: 700,
                px: 2,
                py: 1.5,
                borderRadius: 0,
                textTransform: 'none',
                borderBottom: isActive ? `3px solid ${tab.color}` : '3px solid transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'transparent',
                  color: isActive ? tab.color : '#FFFFFF',
                },
              }}
            >
              {tab.label}
            </Button>
          );
        })}
      </Box>

      {/* Main Table */}
      {tabFiltered.length === 0 ? (
        <Paper sx={{ bgcolor: '#111217', border: '1px solid rgba(255,255,255,0.03)', py: 6, textAlign: 'center' }}>
          <Typography sx={{ color: '#7E8494' }}>Nenhuma transação encontrada neste período.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: '#111217', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '16px', overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#7E8494', fontWeight: 600, fontSize: '0.825rem' } }}>
                <TableCell>Situação</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Conta</TableCell>
                <TableCell>Efetivação</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tabFiltered.map((tx) => {
                const isEffective = tx.date <= todayStr;
                const account = accounts.find((a) => a.id === tx.accountId);
                const destAccount = accounts.find((a) => a.id === tx.destinationAccountId);
                const card = cards.find((c) => c.id === tx.creditCardId);

                return (
                  <TableRow key={tx.id} sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.01)', py: 1.5, fontSize: '0.875rem' }, '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' } }}>
                    {/* Status */}
                    <TableCell>
                      {isEffective ? (
                        <CheckCircleIcon sx={{ color: '#4EBE87', fontSize: '1.25rem' }} />
                      ) : (
                        <AccessTimeIcon sx={{ color: '#6F768E', fontSize: '1.25rem' }} />
                      )}
                    </TableCell>

                    {/* Description */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ color: '#FFFFFF', fontWeight: 500 }}>
                          {tx.description}
                        </Typography>
                        {card && (
                          <>
                            {renderCardBrandIcon(card.brand)}
                            <Box
                              sx={{
                                bgcolor: 'rgba(235, 87, 87, 0.15)',
                                color: '#EB5757',
                                border: '1px solid rgba(235, 87, 87, 0.2)',
                                borderRadius: '12px',
                                px: 1,
                                py: 0.25,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                              }}
                            >
                              Fatura fechada
                            </Box>
                          </>
                        )}
                      </Box>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      {getCategoryChips(tx.categoryId)}
                    </TableCell>

                    {/* Account */}
                    <TableCell>
                      {tx.type === 'TRANSFER' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {account && renderBankLogo(account.institution)}
                          <Typography sx={{ color: '#FFFFFF', fontSize: '0.8rem' }}>
                            {account?.name}
                          </Typography>
                          <Typography sx={{ color: '#7E8494', mx: 0.5 }}>➔</Typography>
                          {destAccount && renderBankLogo(destAccount.institution)}
                          <Typography sx={{ color: '#FFFFFF', fontSize: '0.8rem' }}>
                            {destAccount?.name}
                          </Typography>
                        </Box>
                      ) : (
                        account && (
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', px: 1.5, py: 0.5 }}>
                            {renderBankLogo(account.institution)}
                            <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.8rem' }}>
                              {account.name}
                            </Typography>
                          </Box>
                        )
                      )}
                    </TableCell>

                    {/* Date */}
                    <TableCell sx={{ color: '#FFFFFF' }}>
                      {formatDateToPtBr(tx.date)}
                    </TableCell>

                    {/* Value */}
                    <TableCell sx={{ fontWeight: 700 }}>
                      {(() => {
                        const formatted = `R$ ${tx.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                        if (activeTab === 'STATEMENT') {
                          if (tx.type === 'REVENUE') return <Typography component="span" sx={{ color: '#4EBE87', fontWeight: 700, fontSize: '0.875rem' }}>+ {formatted}</Typography>;
                          if (tx.type === 'EXPENSE') return <Typography component="span" sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.875rem' }}>- {formatted}</Typography>;
                          return <Typography component="span" sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.875rem' }}>{formatted}</Typography>;
                        }
                        return <Typography component="span" sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.875rem' }}>{formatted}</Typography>;
                      })()}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton size="small" onClick={() => handleOpenEdit(tx)} sx={{ color: '#7E8494', '&:hover': { color: '#FFFFFF' } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setMenuAnchor(e.currentTarget);
                            setActiveTx(tx);
                          }}
                          sx={{ color: '#7E8494', '&:hover': { color: '#FFFFFF' } }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Options Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { bgcolor: '#1D1E26', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' } }}
      >
        <MenuItem onClick={handleDeleteTx} sx={{ color: '#E05A5A', fontWeight: 600 }}>Excluir Transação</MenuItem>
      </Menu>

      {/* Bottom Summary Bar */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          left: { xs: 16, md: 'calc(var(--total-sidebar-width, 100px) + 16px)' },
          right: 16,
          bgcolor: '#13141B',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          borderRadius: '24px',
          boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.7)',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          zIndex: 1000,
          transition: 'left 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {/* Efetivadas */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ color: '#4EBE87', fontSize: '1.1rem' }} />
            <Typography sx={{ color: '#7E8494', fontSize: '0.8rem', fontWeight: 600 }}>
              Efetivadas:{' '}
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                R$ {sumEffective.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Box>
            </Typography>
          </Box>

          {/* Pendentes */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon sx={{ color: '#6F768E', fontSize: '1.1rem' }} />
            <Typography sx={{ color: '#7E8494', fontSize: '0.8rem', fontWeight: 600 }}>
              Pendentes:{' '}
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                R$ {sumPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Box>
            </Typography>
          </Box>

          {/* Total */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#E05A5A15', border: '1px solid #E05A5A40', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E05A5A', fontSize: '0.7rem', fontWeight: 700 }}>$</Box>
            <Typography sx={{ color: '#7E8494', fontSize: '0.8rem', fontWeight: 600 }}>
              Total:{' '}
              <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 800 }}>
                R$ {sumTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Box>
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          sx={{
            bgcolor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.04)',
            color: '#FFFFFF',
            borderRadius: '20px',
            px: 3,
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
          }}
        >
          Detalhes
        </Button>
      </Box>

      {/* DIALOG: Create / Edit Transaction Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: '#111217',
            backgroundImage: 'none',
            border: '1px solid rgba(255,255,255,0.04)',
            color: '#FFFFFF',
            '& .MuiFormLabel-asterisk': {
              display: 'none'
            }
          }
        }}
      >
        <form onSubmit={handleSubmitTx}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton onClick={handleCloseModal} sx={{ color: '#7E8494' }}>
                <CloseIcon />
              </IconButton>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                  {isEditing 
                    ? (txType === 'REVENUE' ? 'Editar Receita' : txType === 'TRANSFER' ? 'Editar Transferência' : 'Editar Despesa') 
                    : (txType === 'REVENUE' ? 'Nova Receita' : txType === 'TRANSFER' ? 'Nova Transferência' : 'Nova Despesa')
                  }
                </Typography>
                {isCardExpense && (
                  <Typography variant="caption" sx={{ color: '#7E8494', display: 'block', mt: -0.2 }}>
                    Cartão de Crédito
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  borderRadius: '24px',
                  px: 3.5,
                  py: 0.7,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  bgcolor: txType === 'REVENUE' ? '#4EBE87' : txType === 'TRANSFER' ? '#F4A261' : (isCardExpense ? '#3B82F6' : '#E05A5A'),
                  backgroundImage: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: txType === 'REVENUE' ? '#3ea673' : txType === 'TRANSFER' ? '#e08f4c' : (isCardExpense ? '#2563EB' : '#c94747'),
                    boxShadow: 'none'
                  }
                }}
              >
                Salvar
              </Button>
              <IconButton sx={{ color: '#7E8494' }}>
                <OptionsIcon />
              </IconButton>
            </Box>
          </Box>

          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              {/* LEFT COLUMN */}
              <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Perfil */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 0.5 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.04)', color: '#7E8494', width: 36, height: 36 }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                  <TextField
                    select
                    fullWidth
                    label="Perfil"
                    value="felipe"
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    sx={{
                      '& .MuiInputLabel-root': { color: '#7E8494', fontSize: '0.825rem' },
                      '& .MuiSelect-select': { color: '#FFFFFF', py: 0.5, fontSize: '0.95rem' }
                    }}
                  >
                    <MenuItem value="felipe">Felipe</MenuItem>
                  </TextField>
                </Box>

                {/* Descrição */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 0.5 }}>
                  <NotesIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                  <TextField
                    fullWidth
                    placeholder="Descrição"
                    value={txDesc}
                    onChange={(e) => setTxDesc(e.target.value)}
                    required
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    sx={{ '& input': { color: '#FFFFFF', py: 0.5, fontSize: '0.95rem' } }}
                  />
                </Box>

                {/* Valor */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 0.5 }}>
                  <TextField
                    fullWidth
                    type="text"
                    placeholder="R$ 0,00"
                    value={txValue}
                    onChange={(e) => setTxValue(maskBRL(e.target.value))}
                    required
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    sx={{ '& input': { color: '#FFFFFF', py: 0.5, fontSize: '1.45rem', fontWeight: 700 } }}
                  />
                  <IconButton size="small" sx={{ color: '#7E8494' }}>
                    <HelpIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Recorrência */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7E8494" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>Não recorrente</Typography>
                  </Box>
                  <ChevronRightIcon sx={{ color: '#7E8494', fontSize: '1rem' }} />
                </Box>

                {/* Multicategorias */}
                {txType !== 'TRANSFER' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CategoryIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>Multicategorias</Typography>
                    </Box>
                    <Switch size="small" />
                  </Box>
                )}

                {/* Conditional Fields based on Card Expense vs Normal vs Transfer */}
                {isCardExpense ? (
                  <>
                    {/* Cartão de Crédito */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 0.5 }}>
                      <CardIcon sx={{ color: '#3B82F6', fontSize: '1.25rem' }} />
                      <TextField
                        select
                        fullWidth
                        label="Cartão de Crédito"
                        value={txCardId}
                        onChange={(e) => setTxCardId(e.target.value)}
                        required
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{
                          '& .MuiInputLabel-root': { color: '#7E8494', fontSize: '0.825rem' },
                          '& .MuiSelect-select': { color: '#FFFFFF', py: 0.5, fontSize: '0.95rem' }
                        }}
                      >
                        {cards.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.name} ({c.brand})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>

                    {/* Fatura */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 0.5 }}>
                      <CalendarIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                      <TextField
                        select
                        fullWidth
                        label="Fatura"
                        value="jul_2026"
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{
                          '& .MuiInputLabel-root': { color: '#7E8494', fontSize: '0.825rem' },
                          '& .MuiSelect-select': { color: '#FFFFFF', py: 0.5, fontSize: '0.95rem' }
                        }}
                      >
                        <MenuItem value="jul_2026">Julho, 2026</MenuItem>
                        <MenuItem value="ago_2026">Agosto, 2026</MenuItem>
                      </TextField>
                    </Box>
                  </>
                ) : txType === 'TRANSFER' ? (
                  <>
                    {/* Perfil de Origem */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 0.5 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.04)', color: '#7E8494', width: 36, height: 36 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <TextField
                        select
                        fullWidth
                        label="Perfil de Origem"
                        value="felipe"
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{
                          '& .MuiInputLabel-root': { color: '#7E8494', fontSize: '0.825rem' },
                          '& .MuiSelect-select': { color: '#FFFFFF', py: 0.5, fontSize: '0.95rem' }
                        }}
                      >
                        <MenuItem value="felipe">Felipe</MenuItem>
                      </TextField>
                    </Box>

                    {/* Conta de Origem */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 0.5 }}>
                      <AccountIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                      <TextField
                        select
                        fullWidth
                        label="Conta de Origem"
                        value={txAccountId}
                        onChange={(e) => setTxAccountId(e.target.value)}
                        required
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{
                          '& .MuiInputLabel-root': { color: '#7E8494', fontSize: '0.825rem' },
                          '& .MuiSelect-select': { color: '#FFFFFF', py: 0.5, fontSize: '0.95rem' }
                        }}
                      >
                        {accounts.map((acc) => (
                          <MenuItem key={acc.id} value={acc.id}>
                            {acc.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>

                    {/* Perfil de Destino */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 0.5 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.04)', color: '#7E8494', width: 36, height: 36 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <TextField
                        select
                        fullWidth
                        label="Perfil de Destino"
                        value="felipe"
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{
                          '& .MuiInputLabel-root': { color: '#7E8494', fontSize: '0.825rem' },
                          '& .MuiSelect-select': { color: '#FFFFFF', py: 0.5, fontSize: '0.95rem' }
                        }}
                      >
                        <MenuItem value="felipe">Felipe</MenuItem>
                      </TextField>
                    </Box>

                    {/* Conta de Destino */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 0.5 }}>
                      <AccountIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                      <TextField
                        select
                        fullWidth
                        label="Conta de Destino"
                        value={txDestAccountId}
                        onChange={(e) => setTxDestAccountId(e.target.value)}
                        required
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{
                          '& .MuiInputLabel-root': { color: '#7E8494', fontSize: '0.825rem' },
                          '& .MuiSelect-select': { color: '#FFFFFF', py: 0.5, fontSize: '0.95rem' }
                        }}
                      >
                        {accounts.map((acc) => (
                          <MenuItem key={acc.id} value={acc.id}>
                            {acc.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </>
                ) : (
                  <>
                    {/* Data de Vencimento */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1,
                        borderBottom: '1px solid rgba(255,255,255,0.03)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CalendarIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                        <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>
                          Data de Vencimento
                        </Typography>
                      </Box>
                      <Box
                        onClick={() => {
                          const parsed = txDate ? new Date(txDate + 'T12:00:00') : new Date();
                          setTempDate(isNaN(parsed.getTime()) ? new Date() : parsed);
                          setCalendarViewDate(isNaN(parsed.getTime()) ? new Date() : parsed);
                          setDatePickerOpen(true);
                        }}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.8 }
                        }}
                      >
                        <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>
                          {formatDateToPtBr(txDate)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Efetivada Switch */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', py: 1, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7E8494" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>Efetivada</Typography>
                      </Box>
                      <Switch
                        size="small"
                        defaultChecked
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: txType === 'REVENUE' ? '#4EBE87' : '#E05A5A',
                            '& + .MuiSwitch-track': {
                              backgroundColor: txType === 'REVENUE' ? '#4EBE87' : '#E05A5A',
                            }
                          }
                        }}
                      />
                    </Box>
                  </>
                )}

                {/* Common non-transfer Category / Subcategory / Account */}
                {txType !== 'TRANSFER' && (
                  <>
                    {/* Categoria */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 0.5 }}>
                      {(() => {
                        const selectedCat = categories.find((c) => c.id === txCategoryId);
                        const color = selectedCat?.color || '#7E8494';
                        return (
                          <Box sx={{ display: 'flex', color: color, width: 24, justifyContent: 'center', alignItems: 'center' }}>
                            {selectedCat ? getCategoryIcon(selectedCat.icon, selectedCat.name) : <CategoryIcon sx={{ fontSize: '1.25rem' }} />}
                          </Box>
                        );
                      })()}
                      <TextField
                        select
                        fullWidth
                        label="Categoria"
                        value={txCategoryId}
                        onChange={(e) => {
                          setTxCategoryId(e.target.value);
                          setTxSubcategoryId('');
                        }}
                        required
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        SelectProps={{
                          renderValue: (val) => {
                            const cat = categories.find((c) => c.id === val);
                            return cat ? cat.name : '';
                          }
                        }}
                        sx={{
                          '& .MuiInputLabel-root': { color: '#7E8494', fontSize: '0.825rem' },
                          '& .MuiSelect-select': { color: '#FFFFFF', py: 0.5, fontSize: '0.95rem' }
                        }}
                      >
                        {categories
                          .filter((cat) => cat.type === txType && !cat.parentCategoryId)
                          .map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', color: cat.color || '#7E8494' }}>
                                  {getCategoryIcon(cat.icon, cat.name)}
                                </Box>
                                {cat.name}
                              </Box>
                            </MenuItem>
                          ))}
                      </TextField>
                      <IconButton size="small" onClick={() => {
                        setQuickCatColor('#7E8494');
                        setQuickCatIcon('HelpIcon');
                        setQuickCatOpen(true);
                      }} sx={{ color: '#7E8494' }}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Subcategoria */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 0.5 }}>
                      {(() => {
                        const selectedSub = categories.find((c) => c.id === txSubcategoryId);
                        const color = selectedSub?.color || '#7E8494';
                        return (
                          <Box sx={{ display: 'flex', color: color, width: 24, justifyContent: 'center', alignItems: 'center' }}>
                            {selectedSub ? getCategoryIcon(selectedSub.icon, selectedSub.name) : <SubcategoryIcon sx={{ fontSize: '1.25rem' }} />}
                          </Box>
                        );
                      })()}
                      <TextField
                        select
                        fullWidth
                        label="Subcategoria"
                        value={txSubcategoryId || ''}
                        onChange={(e) => setTxSubcategoryId(e.target.value)}
                        disabled={!txCategoryId || categories.filter((c) => c.parentCategoryId === txCategoryId).length === 0}
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        SelectProps={{
                          renderValue: (val) => {
                            const sub = categories.find((c) => c.id === val);
                            return sub ? sub.name : '';
                          }
                        }}
                        sx={{
                          '& .MuiInputLabel-root': { color: '#7E8494', fontSize: '0.825rem' },
                          '& .MuiSelect-select': { color: '#FFFFFF', py: 0.5, fontSize: '0.95rem' }
                        }}
                      >
                        {txSubcategoryId === '' && <MenuItem value="" sx={{ display: 'none' }} />}
                        {categories
                          .filter((c) => c.parentCategoryId === txCategoryId)
                          .map((sub) => (
                            <MenuItem key={sub.id} value={sub.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', color: sub.color || '#7E8494' }}>
                                  {getCategoryIcon(sub.icon, sub.name)}
                                </Box>
                                {sub.name}
                              </Box>
                            </MenuItem>
                          ))}
                      </TextField>
                      <IconButton size="small" onClick={() => {
                        const parent = categories.find(c => c.id === txCategoryId);
                        setQuickSubColor(parent?.color || '#7E8494');
                        setQuickSubIcon('HelpIcon');
                        setQuickSubOpen(true);
                      }} disabled={!txCategoryId} sx={{ color: '#7E8494' }}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Conta */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 0.5 }}>
                      <AccountIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                      <TextField
                        select
                        fullWidth
                        label="Conta"
                        value={txAccountId}
                        onChange={(e) => setTxAccountId(e.target.value)}
                        required={!isCardExpense}
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{
                          '& .MuiInputLabel-root': { color: '#7E8494', fontSize: '0.825rem' },
                          '& .MuiSelect-select': { color: '#FFFFFF', py: 0.5, fontSize: '0.95rem' }
                        }}
                      >
                        {accounts.map((acc) => (
                          <MenuItem key={acc.id} value={acc.id}>
                            {acc.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </>
                )}
              </Grid>

              {/* RIGHT COLUMN */}
              <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Tags */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <TagIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                    <TextField
                      fullWidth
                      placeholder="Tags"
                      value={txTags}
                      onChange={(e) => setTxTags(e.target.value)}
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                      sx={{ '& input': { color: '#FFFFFF', py: 0.5, fontSize: '0.95rem' } }}
                    />
                  </Box>
                  <Typography sx={{ color: '#7E8494', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Selecionar <ChevronRightIcon sx={{ fontSize: '0.8rem' }} />
                  </Typography>
                </Box>

                {/* Data de Lançamento */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1,
                    borderBottom: '1px solid rgba(255,255,255,0.03)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                    <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>
                      Data de Lançamento
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Box
                      onClick={() => {
                        const parsed = txDate ? new Date(txDate + 'T12:00:00') : new Date();
                        setTempDate(isNaN(parsed.getTime()) ? new Date() : parsed);
                        setCalendarViewDate(isNaN(parsed.getTime()) ? new Date() : parsed);
                        setDatePickerOpen(true);
                      }}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.8 }
                      }}
                    >
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>
                        {formatDateToPtBr(txDate)}
                      </Typography>
                    </Box>
                    <Box
                      onClick={() => {
                        const timeParts = txTimeVal.split(':');
                        if (timeParts.length === 2) {
                          setTempHour(parseInt(timeParts[0]));
                          setTempMinute(parseInt(timeParts[1]));
                        }
                        setTimePickerMode('HOURS');
                        setTimePickerViewMode('DIAL');
                        setTimePickerOpen(true);
                      }}
                      sx={{
                        cursor: 'pointer',
                        width: '45px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        '&:hover': { opacity: 0.8 }
                      }}
                    >
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>
                        {txTimeVal}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Data de Efetivação */}
                {txType === 'TRANSFER' || !isCardExpense ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: '1px solid rgba(255,255,255,0.03)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CalendarIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>
                        Data de Efetivação
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                      <Box
                        onClick={() => {
                          const parsed = txDate ? new Date(txDate + 'T12:00:00') : new Date();
                          setTempDate(isNaN(parsed.getTime()) ? new Date() : parsed);
                          setCalendarViewDate(isNaN(parsed.getTime()) ? new Date() : parsed);
                          setDatePickerOpen(true);
                        }}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.8 }
                        }}
                      >
                        <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>
                          {formatDateToPtBr(txDate)}
                        </Typography>
                      </Box>
                      {/* Empty Spacer to align with date grid when time is present above */}
                      <Box sx={{ width: '45px' }} />
                    </Box>
                  </Box>
                ) : null}

                {/* Encargos */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 0.5 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7E8494" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  <TextField
                    fullWidth
                    label="Encargos"
                    value="R$ 0,00"
                    variant="standard"
                    InputProps={{ disableUnderline: true, readOnly: true }}
                    sx={{
                      '& .MuiInputLabel-root': { color: '#7E8494', fontSize: '0.825rem' },
                      '& input': { color: '#FFFFFF', py: 0.5, fontSize: '0.95rem' }
                    }}
                  />
                </Box>

                {/* Observações */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 0.5 }}>
                  <NotesIcon sx={{ color: '#7E8494', fontSize: '1.25rem', mt: 1 }} />
                  <TextField
                    fullWidth
                    multiline
                    rows={1}
                    placeholder="Observações e hashtags"
                    value={txNotes}
                    onChange={(e) => setTxNotes(e.target.value)}
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    sx={{ '& textarea': { color: '#FFFFFF', py: 0.5, fontSize: '0.95rem' } }}
                  />
                </Box>

                {/* Installments field (reused/styled to match Resume layout seamlessly if needed) */}
                {txType === 'EXPENSE' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.03)', pb: 0.5 }}>
                    <SubcategoryIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                    <TextField
                      fullWidth
                      label="Número de Parcelas"
                      type="number"
                      value={txInstallments}
                      onChange={(e) => setTxInstallments(e.target.value)}
                      variant="standard"
                      InputProps={{ disableUnderline: true }}
                      inputProps={{ min: 1 }}
                      sx={{
                        '& .MuiInputLabel-root': { color: '#7E8494', fontSize: '0.825rem' },
                        '& input': { color: '#FFFFFF', py: 0.5, fontSize: '0.95rem' }
                      }}
                    />
                  </Box>
                )}

                {/* Não efetivar automaticamente */}
                {txType !== 'TRANSFER' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <HelpIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>Não efetivar automaticamente</Typography>
                    </Box>
                    <Switch size="small" />
                  </Box>
                )}

                {/* Adicionar Anexo */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AttachmentIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                    <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>Adicionar anexo</Typography>
                  </Box>
                </Box>

                {/* Ignore flags & bottom switches */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#7E8494', fontSize: '0.85rem', fontWeight: 500 }}>Ignorar nos gráficos</Typography>
                    <Switch size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#7E8494', fontSize: '0.85rem', fontWeight: 500 }}>Ignorar em Orçamentos</Typography>
                    <Switch size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#7E8494', fontSize: '0.85rem', fontWeight: 500 }}>Ignorar em Economia Mensal</Typography>
                    <Switch size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#7E8494', fontSize: '0.85rem', fontWeight: 500 }}>Ignorar nos totais</Typography>
                    <Switch size="small" />
                  </Box>
                  {isCardExpense && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: '#7E8494', fontSize: '0.85rem', fontWeight: 500 }}>Ignorar no limite do cartão</Typography>
                      <Switch size="small" />
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 600 }}>Salvar e continuar</Typography>
                    <Switch size="small" />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
        </form>
      </Dialog>

      {/* DIALOG: Custom Date Picker */}
      <Dialog
        open={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: '#1b1c21',
            backgroundImage: 'none',
            color: '#FFFFFF',
            maxWidth: '500px',
            width: '100%',
          }
        }}
      >
        <Box sx={{ display: 'flex', minHeight: '380px', flexDirection: { xs: 'column', sm: 'row' } }}>
          {/* Left Panel */}
          <Box sx={{ width: { xs: '100%', sm: '210px' }, bgcolor: '#111217', p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid rgba(255,255,255,0.03)' }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#7E8494', fontWeight: 600, letterSpacing: '0.5px', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {tempDate.getFullYear()}
              </Typography>
              <Typography variant="h4" sx={{ color: '#FFFFFF', fontWeight: 700, mt: 1, fontSize: '1.8rem', lineHeight: 1.25 }}>
                {formatSelectedDatePtBr(tempDate)}
              </Typography>
            </Box>
          </Box>

          {/* Right Panel */}
          <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.95rem' }}>
                  {monthsFull[calendarViewDate.getMonth()].charAt(0).toUpperCase() + monthsFull[calendarViewDate.getMonth()].slice(1)} de {calendarViewDate.getFullYear()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1))} sx={{ color: '#FFFFFF' }}>
                    <ChevronRightIcon sx={{ transform: 'rotate(180deg)', fontSize: '1.1rem' }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1))} sx={{ color: '#FFFFFF' }}>
                    <ChevronRightIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, justifyItems: 'center', mb: 1.5 }}>
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                  <Typography key={idx} variant="caption" sx={{ color: '#7E8494', fontWeight: 600, fontSize: '0.75rem', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {day}
                  </Typography>
                ))}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, justifyItems: 'center' }}>
                {getDaysInMonthGrid(calendarViewDate).map((day, idx) => {
                  if (!day) return <Box key={`empty-${idx}`} sx={{ width: 36, height: 36 }} />;
                  const isSelected = isSameDay(day, tempDate);
                  const isToday = isSameDay(day, new Date());
                  const themeColor = getThemeColor();

                  return (
                    <Box
                      key={day.getTime()}
                      onClick={() => setTempDate(day)}
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#FFFFFF',
                        bgcolor: isSelected ? themeColor : 'transparent',
                        border: !isSelected && isToday ? `1.5px solid ${themeColor}` : 'none',
                        '&:hover': { bgcolor: isSelected ? themeColor : 'rgba(255,255,255,0.05)' }
                      }}
                    >
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: isSelected ? 700 : 500 }}>
                        {day.getDate()}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button onClick={() => setDatePickerOpen(false)} sx={{ color: getThemeColor(), fontWeight: 600, textTransform: 'none' }}>
                CANCELAR
              </Button>
              <Button onClick={() => { setTxDate(tempDate.toISOString().split('T')[0]); setDatePickerOpen(false); }} sx={{ color: getThemeColor(), fontWeight: 600, textTransform: 'none' }}>
                OK
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* DIALOG: Custom Time Picker */}
      <Dialog
        open={timePickerOpen}
        onClose={() => setTimePickerOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            bgcolor: '#1b1c21',
            backgroundImage: 'none',
            color: '#FFFFFF',
            maxWidth: timePickerViewMode === 'KEYBOARD' ? '320px' : '540px',
            width: '100%',
            transition: 'max-width 0.15s ease-out',
          }
        }}
      >
        <Box sx={{ display: 'flex', minHeight: timePickerViewMode === 'KEYBOARD' ? '220px' : '320px', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ width: { xs: '100%', sm: timePickerViewMode === 'KEYBOARD' ? '100%' : '240px' }, bgcolor: '#111217', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', borderRight: timePickerViewMode === 'KEYBOARD' ? 'none' : '1px solid rgba(255,255,255,0.03)' }}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="caption" sx={{ color: '#7E8494', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                {timePickerViewMode === 'KEYBOARD' ? 'Insira o horário' : 'Selecione o horário'}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', my: 1.5 }}>
              {timePickerViewMode === 'DIAL' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                  <Box onClick={() => setTimePickerMode('HOURS')} sx={{ bgcolor: '#1e1f25', border: '1.5px solid', borderColor: timePickerMode === 'HOURS' ? getThemeColor() : 'transparent', borderRadius: '8px', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Typography sx={{ fontSize: '3.2rem', fontWeight: 700, color: timePickerMode === 'HOURS' ? getThemeColor() : '#FFFFFF', lineHeight: 1 }}>
                      {tempHour.toString().padStart(2, '0')}
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ color: '#7E8494', fontWeight: 700, mx: 0.5 }}>:</Typography>
                  <Box onClick={() => setTimePickerMode('MINUTES')} sx={{ bgcolor: '#1e1f25', border: '1.5px solid', borderColor: timePickerMode === 'MINUTES' ? getThemeColor() : 'transparent', borderRadius: '8px', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Typography sx={{ fontSize: '3.2rem', fontWeight: 700, color: timePickerMode === 'MINUTES' ? getThemeColor() : '#FFFFFF', lineHeight: 1 }}>
                      {tempMinute.toString().padStart(2, '0')}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <input
                      type="text"
                      maxLength={2}
                      value={rawHourStr}
                      onFocus={() => setFocusedField('HOURS')}
                      onBlur={() => {
                        setFocusedField(null);
                        const val = parseInt(rawHourStr.replace(/[^0-9]/g, ''));
                        if (!isNaN(val) && val >= 0 && val < 24) {
                          setTempHour(val);
                          setRawHourStr(val.toString().padStart(2, '0'));
                        } else {
                          setRawHourStr(tempHour.toString().padStart(2, '0'));
                        }
                      }}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9]/g, '');
                        setRawHourStr(cleaned);
                        const val = parseInt(cleaned);
                        if (!isNaN(val) && val >= 0 && val < 24) setTempHour(val);
                      }}
                      style={{ width: '80px', height: '80px', backgroundColor: '#1e1f25', color: '#FFFFFF', border: '1.5px solid', borderColor: focusedField === 'HOURS' ? getThemeColor() : 'transparent', borderRadius: '8px', fontSize: '3.2rem', fontWeight: 700, textAlign: 'center', outline: 'none' }}
                    />
                    <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.75rem', mt: 0.5 }}>Hora</Typography>
                  </Box>
                  <Typography variant="h3" sx={{ color: '#7E8494', fontWeight: 700, mt: -3.5 }}>:</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <input
                      type="text"
                      maxLength={2}
                      value={rawMinuteStr}
                      onFocus={() => setFocusedField('MINUTES')}
                      onBlur={() => {
                        setFocusedField(null);
                        const val = parseInt(rawMinuteStr.replace(/[^0-9]/g, ''));
                        if (!isNaN(val) && val >= 0 && val < 60) {
                          setTempMinute(val);
                          setRawMinuteStr(val.toString().padStart(2, '0'));
                        } else {
                          setRawMinuteStr(tempMinute.toString().padStart(2, '0'));
                        }
                      }}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9]/g, '');
                        setRawMinuteStr(cleaned);
                        const val = parseInt(cleaned);
                        if (!isNaN(val) && val >= 0 && val < 60) setTempMinute(val);
                      }}
                      style={{ width: '80px', height: '80px', backgroundColor: '#1e1f25', color: '#FFFFFF', border: '1.5px solid', borderColor: focusedField === 'MINUTES' ? getThemeColor() : 'transparent', borderRadius: '8px', fontSize: '3.2rem', fontWeight: 700, textAlign: 'center', outline: 'none' }}
                    />
                    <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.75rem', mt: 0.5 }}>Minuto</Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {timePickerViewMode === 'DIAL' ? (
              <Box sx={{ mt: 1 }}>
                <IconButton size="small" onClick={() => setTimePickerViewMode('KEYBOARD')} sx={{ color: '#7E8494' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mt: 1 }}>
                <IconButton size="small" onClick={() => setTimePickerViewMode('DIAL')} sx={{ color: '#7E8494' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </IconButton>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button onClick={() => setTimePickerOpen(false)} sx={{ color: getThemeColor(), fontWeight: 600, textTransform: 'none' }}>CANCELAR</Button>
                  <Button
                    onClick={() => {
                      let finalHour = tempHour;
                      let finalMinute = tempMinute;
                      const parsedHour = parseInt(rawHourStr.replace(/[^0-9]/g, ''));
                      if (!isNaN(parsedHour) && parsedHour >= 0 && parsedHour < 24) finalHour = parsedHour;
                      const parsedMinute = parseInt(rawMinuteStr.replace(/[^0-9]/g, ''));
                      if (!isNaN(parsedMinute) && parsedMinute >= 0 && parsedMinute < 60) finalMinute = parsedMinute;
                      setTempHour(finalHour);
                      setTempMinute(finalMinute);
                      setTxTimeVal(`${finalHour.toString().padStart(2, '0')}:${finalMinute.toString().padStart(2, '0')}`);
                      setTimePickerOpen(false);
                    }}
                    sx={{ color: getThemeColor(), fontWeight: 600, textTransform: 'none' }}
                  >
                    OK
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          {timePickerViewMode === 'DIAL' && (
            <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', my: 0.5 }}>
                <svg
                  width="220"
                  height="220"
                  onMouseDown={(e) => { setIsDraggingTime(true); handleClockInteraction(e.clientX, e.clientY, e.currentTarget); }}
                  onMouseMove={(e) => { if (isDraggingTime) handleClockInteraction(e.clientX, e.clientY, e.currentTarget); }}
                  onMouseUp={() => setIsDraggingTime(false)}
                  onMouseLeave={() => setIsDraggingTime(false)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  <circle cx="110" cy="110" r="105" fill="rgba(255, 255, 255, 0.02)" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                  <circle cx="110" cy="110" r="4" fill={getThemeColor()} />

                  {(() => {
                    let angleDeg;
                    let handLength;
                    if (timePickerMode === 'HOURS') {
                      const isInner = [0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].includes(tempHour);
                      handLength = isInner ? 54 : 82;
                      const angleVal = isInner ? (tempHour === 0 ? 0 : tempHour - 12) : (tempHour === 12 ? 0 : tempHour);
                      angleDeg = angleVal * 30 - 90;
                    } else {
                      handLength = 82;
                      angleDeg = tempMinute * 6 - 90;
                    }
                    const angleRad = (angleDeg * Math.PI) / 180;
                    const handX = 110 + handLength * Math.cos(angleRad);
                    const handY = 110 + handLength * Math.sin(angleRad);

                    return (
                      <>
                        <line x1="110" y1="110" x2={handX} y2={handY} stroke={getThemeColor()} strokeWidth="2.5" />
                        <circle cx={handX} cy={handY} r="14" fill={getThemeColor()} />
                      </>
                    );
                  })()}

                  {timePickerMode === 'HOURS' ? (
                    <>
                      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hourVal, idx) => {
                        const angleDeg = idx * 30 - 90;
                        const angleRad = (angleDeg * Math.PI) / 180;
                        const textX = 110 + 82 * Math.cos(angleRad);
                        const textY = 110 + 82 * Math.sin(angleRad);
                        const isSelected = tempHour === hourVal;
                        return (
                          <text key={`outer-${hourVal}`} x={textX} y={textY + 4.5} textAnchor="middle" fill={isSelected ? '#FFFFFF' : '#B3B8C4'} style={{ fontSize: '0.85rem', fontWeight: isSelected ? '700' : '500', pointerEvents: 'none' }}>
                            {hourVal.toString()}
                          </text>
                        );
                      })}
                      {[0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((hourVal, idx) => {
                        const angleDeg = idx * 30 - 90;
                        const angleRad = (angleDeg * Math.PI) / 180;
                        const textX = 110 + 54 * Math.cos(angleRad);
                        const textY = 110 + 54 * Math.sin(angleRad);
                        const isSelected = tempHour === hourVal;
                        return (
                          <text key={`inner-${hourVal}`} x={textX} y={textY + 4} textAnchor="middle" fill={isSelected ? '#FFFFFF' : 'rgba(179, 184, 196, 0.6)'} style={{ fontSize: '0.75rem', fontWeight: isSelected ? '700' : '500', pointerEvents: 'none' }}>
                            {hourVal === 0 ? '00' : hourVal.toString()}
                          </text>
                        );
                      })}
                    </>
                  ) : (
                    [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((minVal) => {
                      const angleDeg = minVal * 6 - 90;
                      const angleRad = (angleDeg * Math.PI) / 180;
                      const textX = 110 + 82 * Math.cos(angleRad);
                      const textY = 110 + 82 * Math.sin(angleRad);
                      const isSelected = tempMinute === minVal;
                      return (
                        <text key={minVal} x={textX} y={textY + 4.5} textAnchor="middle" fill={isSelected ? '#FFFFFF' : '#B3B8C4'} style={{ fontSize: '0.85rem', fontWeight: isSelected ? '700' : '500', pointerEvents: 'none' }}>
                          {minVal.toString().padStart(2, '0')}
                        </text>
                      );
                    })
                  )}
                </svg>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, width: '100%', mt: 1 }}>
                <Button onClick={() => setTimePickerOpen(false)} sx={{ color: getThemeColor(), fontWeight: 600, textTransform: 'none' }}>CANCELAR</Button>
                <Button onClick={() => { setTxTimeVal(`${tempHour.toString().padStart(2, '0')}:${tempMinute.toString().padStart(2, '0')}`); setTimePickerOpen(false); }} sx={{ color: getThemeColor(), fontWeight: 600, textTransform: 'none' }}>OK</Button>
              </Box>
            </Box>
          )}
        </Box>
      </Dialog>

      {/* DIALOG: Quick Category Creation */}
      <Dialog
        open={quickCatOpen}
        onClose={() => setQuickCatOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: '#111217',
            backgroundImage: 'none',
            border: '1px solid rgba(255,255,255,0.04)',
            color: '#FFFFFF',
          }
        }}
      >
        <form onSubmit={handleQuickCreateCategory}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
              Nova Categoria
            </Typography>
            <IconButton onClick={() => setQuickCatOpen(false)} sx={{ color: '#7E8494' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 3 }}>
            <TextField
              label="Nome da Categoria"
              value={quickCatName}
              onChange={(e) => setQuickCatName(e.target.value)}
              required
              fullWidth
              variant="standard"
              InputLabelProps={{ style: { color: '#7E8494' } }}
              InputProps={{ disableUnderline: true }}
              sx={{
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                '& input': { color: '#FFFFFF', py: 0.5 }
              }}
            />
            <TextField
              select
              label="Cor"
              value={quickCatColor}
              onChange={(e) => setQuickCatColor(e.target.value)}
              fullWidth
              variant="standard"
              InputLabelProps={{ style: { color: '#7E8494' } }}
              InputProps={{ disableUnderline: true }}
              sx={{
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                '& .MuiSelect-select': { color: '#FFFFFF', py: 0.5 }
              }}
            >
              {AVAILABLE_COLORS.map((col) => (
                <MenuItem key={col.value} value={col.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: col.value }} />
                    {col.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Ícone"
              value={quickCatIcon}
              onChange={(e) => setQuickCatIcon(e.target.value)}
              fullWidth
              variant="standard"
              InputLabelProps={{ style: { color: '#7E8494' } }}
              InputProps={{ disableUnderline: true }}
              sx={{
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                '& .MuiSelect-select': { color: '#FFFFFF', py: 0.5 }
              }}
            >
              {AVAILABLE_ICONS.map((ico) => (
                <MenuItem key={ico.value} value={ico.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {ico.component}
                    {ico.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, px: 3, pb: 3 }}>
            <Button onClick={() => setQuickCatOpen(false)} sx={{ color: '#7E8494', fontWeight: 600, textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: '20px',
                px: 3,
                fontWeight: 600,
                textTransform: 'none',
                bgcolor: getThemeColor(),
                '&:hover': { bgcolor: getThemeColor(), opacity: 0.9 }
              }}
            >
              Salvar
            </Button>
          </Box>
        </form>
      </Dialog>

      {/* DIALOG: Quick Subcategory Creation */}
      <Dialog
        open={quickSubOpen}
        onClose={() => setQuickSubOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: '#111217',
            backgroundImage: 'none',
            border: '1px solid rgba(255,255,255,0.04)',
            color: '#FFFFFF',
          }
        }}
      >
        <form onSubmit={handleQuickCreateSubcategory}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
              Nova Subcategoria
            </Typography>
            <IconButton onClick={() => setQuickSubOpen(false)} sx={{ color: '#7E8494' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 3 }}>
            <TextField
              label="Nome da Subcategoria"
              value={quickSubName}
              onChange={(e) => setQuickSubName(e.target.value)}
              required
              fullWidth
              variant="standard"
              InputLabelProps={{ style: { color: '#7E8494' } }}
              InputProps={{ disableUnderline: true }}
              sx={{
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                '& input': { color: '#FFFFFF', py: 0.5 }
              }}
            />
            <TextField
              select
              label="Cor"
              value={quickSubColor}
              onChange={(e) => setQuickSubColor(e.target.value)}
              fullWidth
              variant="standard"
              InputLabelProps={{ style: { color: '#7E8494' } }}
              InputProps={{ disableUnderline: true }}
              sx={{
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                '& .MuiSelect-select': { color: '#FFFFFF', py: 0.5 }
              }}
            >
              {AVAILABLE_COLORS.map((col) => (
                <MenuItem key={col.value} value={col.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: col.value }} />
                    {col.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Ícone"
              value={quickSubIcon}
              onChange={(e) => setQuickSubIcon(e.target.value)}
              fullWidth
              variant="standard"
              InputLabelProps={{ style: { color: '#7E8494' } }}
              InputProps={{ disableUnderline: true }}
              sx={{
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                '& .MuiSelect-select': { color: '#FFFFFF', py: 0.5 }
              }}
            >
              {AVAILABLE_ICONS.map((ico) => (
                <MenuItem key={ico.value} value={ico.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {ico.component}
                    {ico.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, px: 3, pb: 3 }}>
            <Button onClick={() => setQuickSubOpen(false)} sx={{ color: '#7E8494', fontWeight: 600, textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: '20px',
                px: 3,
                fontWeight: 600,
                textTransform: 'none',
                bgcolor: getThemeColor(),
                '&:hover': { bgcolor: getThemeColor(), opacity: 0.9 }
              }}
            >
              Salvar
            </Button>
          </Box>
        </form>
      </Dialog>
    </Box>
  );
};

export default TransactionsPage;
