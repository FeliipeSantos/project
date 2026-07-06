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
  MenuItem,
  Grid,
  Menu,
  Avatar,
  Popover,
  InputBase,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  Tv as TvIcon,
  CreditCard as CardIcon,
  DirectionsRun as RunIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  DesktopWindows as DesktopIcon,
  People as PeopleIcon,
  ShowChart as ChartIcon,
  SportsEsports as GameIcon,
  Home as HomeIcon,
  Help as HelpIcon,
  Menu as DragIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Palette as PaletteIcon,
  Image as ImageIcon,
  FormatListBulleted as ListIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

// ── Interfaces ────────────────────────────────────────────────
interface Category {
  id: string;
  userId?: string | null;
  name: string;
  type: string;
  parentCategoryId?: string;
  color?: string;
  icon?: string;
  showInAccountsByCategory?: boolean;
  showInCategorySummary?: boolean;
  showInCategoryBalance?: boolean;
}

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
  effective?: boolean;
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
  { value: 'AccountBalanceIcon', label: 'Banco / Conta Corrente', component: <AccountBalanceIcon fontSize="small" /> },
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

const CategoriesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryMonth = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1;
  const queryYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

  // ── States ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'REVENUE' | 'ACCOUNTS'>('EXPENSE');
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Menu action states
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Modals state
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Form states
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#7E8494');
  const [newCatIcon, setNewCatIcon] = useState('HelpIcon');
  const [showInAccountsByCategory, setShowInAccountsByCategory] = useState(true);
  const [showInCategorySummary, setShowInCategorySummary] = useState(true);
  const [showInCategoryBalance, setShowInCategoryBalance] = useState(true);
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('#7E8494');
  const [newSubIcon, setNewSubIcon] = useState('HelpIcon');

  // Sync newSubColor to the selected category's color when selectedCategory changes
  useEffect(() => {
    if (selectedCategory) {
      setNewSubColor(selectedCategory.color || '#7E8494');
    }
  }, [selectedCategory]);

  // Edit states
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#7E8494');
  const [editIcon, setEditIcon] = useState('HelpIcon');
  const [editShowInAccountsByCategory, setEditShowInAccountsByCategory] = useState(true);
  const [editShowInCategorySummary, setEditShowInCategorySummary] = useState(true);
  const [editShowInCategoryBalance, setEditShowInCategoryBalance] = useState(true);

  // Popover states
  const [colorAnchor, setColorAnchor] = useState<null | HTMLElement>(null);
  const [iconAnchor, setIconAnchor] = useState<null | HTMLElement>(null);

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, accRes, txRes] = await Promise.all([
        api.get('/categories'),
        api.get('/accounts'),
        api.get('/transactions'),
      ]);
      setCategories(catRes.data);
      setAccounts(accRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      setError('Falha ao carregar os dados de categorias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter transactions for period
  const periodTransactions = transactions.filter((t) => {
    if (!t.date) return false;
    const tDate = new Date(t.date);
    const tMonth = tDate.getMonth() + 1;
    const tYear = tDate.getFullYear();
    return tMonth === queryMonth && tYear === queryYear;
  });

  // Calculate totals
  const getSubcategoryTotal = (subCatId: string) => {
    return periodTransactions
      .filter((t) => t.categoryId === subCatId)
      .reduce((sum, t) => sum + Number(t.value || 0), 0);
  };

  const getCategoryTotal = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (cat && cat.type === 'ACCOUNTS') {
      return accounts
        .filter((acc) => acc.type === cat.name)
        .reduce((sum, acc) => sum + Number(acc.balanceCurrent || 0), 0);
    }
    const subCatIds = categories.filter((c) => c.parentCategoryId === catId).map((c) => c.id);
    const directSum = periodTransactions
      .filter((t) => t.categoryId === catId)
      .reduce((sum, t) => sum + Number(t.value || 0), 0);
    const subSum = periodTransactions
      .filter((t) => t.categoryId && subCatIds.includes(t.categoryId))
      .reduce((sum, t) => sum + Number(t.value || 0), 0);
    return directSum + subSum;
  };

  // Filter parent categories
  const filteredParents = categories.filter(
    (c) => !c.parentCategoryId && c.type === activeTab
  );

  // Auto-select first category if none is selected
  useEffect(() => {
    if (filteredParents.length > 0 && !selectedCategory) {
      setSelectedCategory(filteredParents[0]);
    }
  }, [filteredParents, selectedCategory]);

  // Handle category / subcategory creation
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: newCatName,
        type: activeTab,
        color: newCatColor,
        icon: newCatIcon,
        showInAccountsByCategory: activeTab === 'ACCOUNTS' ? showInAccountsByCategory : true,
        showInCategorySummary: activeTab === 'ACCOUNTS' ? showInCategorySummary : true,
        showInCategoryBalance: activeTab === 'ACCOUNTS' ? showInCategoryBalance : true,
      };
      const res = await api.post('/categories', payload);
      setCategories((prev) => [...prev, res.data]);
      setNewCatName('');
      setNewCatColor('#7E8494');
      setNewCatIcon('HelpIcon');
      setShowInAccountsByCategory(true);
      setShowInCategorySummary(true);
      setShowInCategoryBalance(true);
      setCatModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar categoria.');
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    try {
      const payload = {
        name: newSubName,
        type: activeTab,
        parentCategoryId: selectedCategory.id,
        color: newSubColor,
        icon: newSubIcon,
      };
      const res = await api.post('/categories', payload);
      setCategories((prev) => [...prev, res.data]);
      setNewSubName('');
      setNewSubIcon('HelpIcon');
      setSubModalOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar subcategoria.');
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async () => {
    if (!activeCategory) return;
    const isSub = !!activeCategory.parentCategoryId;
    if (
      window.confirm(
        isSub
          ? `Tem certeza de que deseja excluir a subcategoria "${activeCategory.name}"?`
          : `Tem certeza de que deseja excluir a categoria "${activeCategory.name}"? As subcategorias e orçamentos vinculados a ela serão impactados.`
      )
    ) {
      try {
        await api.delete(`/categories/${activeCategory.id}`);
        setCategories((prev) => prev.filter((c) => c.id !== activeCategory.id));
        if (selectedCategory?.id === activeCategory.id) {
          setSelectedCategory(null);
        }
        setMenuAnchor(null);
        setActiveCategory(null);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Erro ao excluir.');
      }
    }
  };

  const handleOpenEditModal = () => {
    if (!activeCategory) return;
    setEditName(activeCategory.name);
    setEditColor(activeCategory.color || '#7E8494');
    setEditIcon(activeCategory.icon || 'HelpIcon');
    setEditShowInAccountsByCategory(activeCategory.showInAccountsByCategory ?? true);
    setEditShowInCategorySummary(activeCategory.showInCategorySummary ?? true);
    setEditShowInCategoryBalance(activeCategory.showInCategoryBalance ?? true);
    setEditModalOpen(true);
    setMenuAnchor(null);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory) return;
    try {
      const payload = {
        name: editName,
        type: activeCategory.type,
        parentCategoryId: activeCategory.parentCategoryId || null,
        color: editColor,
        icon: editIcon,
        showInAccountsByCategory: activeCategory.type === 'ACCOUNTS' ? editShowInAccountsByCategory : true,
        showInCategorySummary: activeCategory.type === 'ACCOUNTS' ? editShowInCategorySummary : true,
        showInCategoryBalance: activeCategory.type === 'ACCOUNTS' ? editShowInCategoryBalance : true,
      };
      const res = await api.put(`/categories/${activeCategory.id}`, payload);
      setCategories((prev) =>
        prev.map((c) => (c.id === activeCategory.id ? res.data : c))
      );
      if (selectedCategory?.id === activeCategory.id) {
        setSelectedCategory(res.data);
      }
      setEditModalOpen(false);
      setActiveCategory(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atualizar.');
    }
  };

  // Helper icons mapper
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
      if (iconName === 'ChartIcon' || iconName === 'ShowChartIcon') return <ChartIcon fontSize="small" />;
      if (iconName === 'GameIcon') return <GameIcon fontSize="small" />;
      if (iconName === 'HomeIcon') return <HomeIcon fontSize="small" />;
      if (iconName === 'HelpIcon') return <HelpIcon fontSize="small" />;
      if (iconName === 'AccountBalanceIcon' || iconName === 'AccountBalance') return <AccountBalanceIcon fontSize="small" />;
      if (iconName === 'AttachMoneyIcon') return <AttachMoneyIcon fontSize="small" />;
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

  const getCategoryColor = (cat: Category) => {
    if (cat.color) return cat.color;
    const n = cat.name.toLowerCase();
    if (n.includes('alimentação')) return '#9E9E9E';
    if (n.includes('assinatura')) return '#EC407A';
    if (n.includes('cartão') || n.includes('crédito')) return '#5C6BC0';
    if (n.includes('reembolsável') || n.includes('reembolso')) return '#26A69A';
    if (n.includes('educação')) return '#26C6DA';
    if (n.includes('empresa') || n.includes('trabalho')) return '#42A5F5';
    if (n.includes('escritório') || n.includes('papelaria')) return '#78909C';
    if (n.includes('família')) return '#AB47BC';
    if (n.includes('investimento')) return '#66BB6A';
    if (n.includes('lazer')) return '#FFCA28';
    if (n.includes('moradia')) return '#7E57C2';
    return '#7E8494';
  };



  // Subcategories of selected parent category
  const selectedSubcategories = selectedCategory
    ? categories.filter((c) => c.parentCategoryId === selectedCategory.id)
    : [];

  const leftColumnTotal = filteredParents.reduce(
    (sum, c) => sum + Number(getCategoryTotal(c.id) || 0),
    0
  );

  const rightColumnTotal = selectedSubcategories.reduce(
    (sum, c) => sum + Number(getSubcategoryTotal(c.id) || 0),
    0
  );

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
        }}
      >
        <Button
          onClick={() => { setActiveTab('EXPENSE'); setSelectedCategory(null); }}
          sx={{
            color: activeTab === 'EXPENSE' ? '#E05A5A' : '#7E8494',
            fontSize: '0.9rem',
            fontWeight: 700,
            px: 2,
            py: 1.5,
            borderRadius: 0,
            textTransform: 'none',
            borderBottom: activeTab === 'EXPENSE' ? '3px solid #E05A5A' : '3px solid transparent',
            transition: 'all 0.2s',
            '&:hover': { bgcolor: 'transparent', color: activeTab === 'EXPENSE' ? '#E05A5A' : '#FFFFFF' },
          }}
        >
          Despesas
        </Button>
        <Button
          onClick={() => { setActiveTab('REVENUE'); setSelectedCategory(null); }}
          sx={{
            color: activeTab === 'REVENUE' ? '#4EBE87' : '#7E8494',
            fontSize: '0.9rem',
            fontWeight: 700,
            px: 2,
            py: 1.5,
            borderRadius: 0,
            textTransform: 'none',
            borderBottom: activeTab === 'REVENUE' ? '3px solid #4EBE87' : '3px solid transparent',
            transition: 'all 0.2s',
            '&:hover': { bgcolor: 'transparent', color: activeTab === 'REVENUE' ? '#4EBE87' : '#FFFFFF' },
          }}
        >
          Receitas
        </Button>
        <Button
          onClick={() => { setActiveTab('ACCOUNTS'); setSelectedCategory(null); }}
          sx={{
            color: activeTab === 'ACCOUNTS' ? '#3B82F6' : '#7E8494',
            fontSize: '0.9rem',
            fontWeight: 700,
            px: 2,
            py: 1.5,
            borderRadius: 0,
            textTransform: 'none',
            borderBottom: activeTab === 'ACCOUNTS' ? '3px solid #3B82F6' : '3px solid transparent',
            transition: 'all 0.2s',
            '&:hover': { bgcolor: 'transparent', color: activeTab === 'ACCOUNTS' ? '#3B82F6' : '#FFFFFF' },
          }}
        >
          Contas
        </Button>
      </Box>

      {activeTab === 'ACCOUNTS' ? (
        /* ACCOUNTS CATEGORIES LISTING */
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              sx={{
                bgcolor: '#111217',
                border: '1px solid rgba(255,255,255,0.03)',
                borderRadius: '16px',
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                  Categorias de Contas
                </Typography>
                <Button
                  onClick={() => setCatModalOpen(true)}
                  startIcon={<AddIcon />}
                  sx={{
                    color: '#3B82F6',
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: 'rgba(59,130,246,0.06)',
                    borderRadius: '12px',
                    px: 2,
                    '&:hover': {
                      bgcolor: 'rgba(59,130,246,0.12)',
                    },
                  }}
                >
                  Nova categoria
                </Button>
              </Box>

              <TableContainer sx={{ minHeight: '350px' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#7E8494', fontWeight: 600 } }}>
                      <TableCell>Nome</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredParents.map((cat) => {
                      const catColor = getCategoryColor(cat);
                      const totalValue = getCategoryTotal(cat.id);

                      return (
                        <TableRow
                          key={cat.id}
                          sx={{
                            '& td': { borderBottom: '1px solid rgba(255,255,255,0.01)', py: 1.5 },
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{
                                  bgcolor: `${catColor}15`,
                                  color: catColor,
                                  width: 32,
                                  height: 32,
                                }}
                              >
                                {getCategoryIcon(cat.icon, cat.name)}
                              </Avatar>
                              <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.875rem' }}>
                                {cat.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                              <IconButton
                                size="small"
                                sx={{ color: '#7E8494' }}
                              >
                                <ListIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  setMenuAnchor(e.currentTarget);
                                  setActiveCategory(cat);
                                }}
                                sx={{ color: '#7E8494' }}
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

              {/* Bottom Summary Accounts */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '12px',
                  p: 1.5,
                  mt: 'auto',
                }}
              >
                <Typography variant="body2" sx={{ color: '#7E8494', fontWeight: 600 }}>
                  Categorias ({filteredParents.length})
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                  Total: R$ {leftColumnTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        /* CATEGORIES & SUBCATEGORIES TAB LISTING */
        <Grid container spacing={3}>
          {/* LEFT COLUMN: Categories */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                bgcolor: '#111217',
                border: '1px solid rgba(255,255,255,0.03)',
                borderRadius: '16px',
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                  {activeTab === 'EXPENSE' ? 'Categorias de Despesas' : 'Categorias de Receitas'}
                </Typography>
                <Button
                  onClick={() => setCatModalOpen(true)}
                  startIcon={<AddIcon />}
                  sx={{
                    color: activeTab === 'EXPENSE' ? '#E05A5A' : '#4EBE87',
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: activeTab === 'EXPENSE' ? 'rgba(224,90,90,0.06)' : 'rgba(78,190,135,0.06)',
                    borderRadius: '12px',
                    px: 2,
                    '&:hover': {
                      bgcolor: activeTab === 'EXPENSE' ? 'rgba(224,90,90,0.12)' : 'rgba(78,190,135,0.12)',
                    },
                  }}
                >
                  Nova categoria
                </Button>
              </Box>

              <TableContainer sx={{ minHeight: '400px' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#7E8494', fontWeight: 600 } }}>
                      <TableCell>Nome</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredParents.map((cat) => {
                      const isSelected = selectedCategory?.id === cat.id;
                      const catColor = getCategoryColor(cat);
                      const totalValue = getCategoryTotal(cat.id);

                      return (
                        <TableRow
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat)}
                          sx={{
                            cursor: 'pointer',
                            bgcolor: isSelected ? 'rgba(255,255,255,0.02)' : 'transparent',
                            borderLeft: isSelected ? `4px solid ${activeTab === 'EXPENSE' ? '#E05A5A' : '#4EBE87'}` : '4px solid transparent',
                            '& td': { borderBottom: '1px solid rgba(255,255,255,0.01)', py: 1.5 },
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{
                                  bgcolor: `${catColor}15`,
                                  color: catColor,
                                  width: 32,
                                  height: 32,
                                }}
                              >
                                {getCategoryIcon(cat.icon, cat.name)}
                              </Avatar>
                              <Typography sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.875rem' }}>
                                {cat.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                              <DragIcon sx={{ color: '#4E5366', fontSize: '1.2rem', cursor: 'grab' }} />
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  setMenuAnchor(e.currentTarget);
                                  setActiveCategory(cat);
                                }}
                                sx={{ color: '#7E8494' }}
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

              {/* Bottom Summary Left */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  bgcolor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '12px',
                  p: 1.5,
                  mt: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: '#7E8494', fontWeight: 600 }}>
                  Categorias ({filteredParents.length})
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                  Total: R$ {leftColumnTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* RIGHT COLUMN: Subcategories */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                bgcolor: '#111217',
                border: '1px solid rgba(255,255,255,0.03)',
                borderRadius: '16px',
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minHeight: '520px',
              }}
            >
              {selectedCategory ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                      Subcategorias de {selectedCategory.name}
                    </Typography>
                    <Button
                      onClick={() => setSubModalOpen(true)}
                      startIcon={<AddIcon />}
                      sx={{
                        color: activeTab === 'EXPENSE' ? '#E05A5A' : '#4EBE87',
                        fontWeight: 700,
                        textTransform: 'none',
                        border: `1.5px solid ${activeTab === 'EXPENSE' ? 'rgba(224,90,90,0.3)' : 'rgba(78,190,135,0.3)'}`,
                        borderRadius: '12px',
                        px: 2,
                        '&:hover': {
                          bgcolor: activeTab === 'EXPENSE' ? 'rgba(224,90,90,0.04)' : 'rgba(78,190,135,0.04)',
                        },
                      }}
                    >
                      Nova subcategoria
                    </Button>
                  </Box>

                  <TableContainer sx={{ minHeight: '350px' }}>
                    {selectedSubcategories.length === 0 ? (
                      <Box display="flex" justifyContent="center" alignItems="center" height="250px">
                        <Typography sx={{ color: '#7E8494' }}>Nenhuma subcategoria cadastrada.</Typography>
                      </Box>
                    ) : (
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.03)', color: '#7E8494', fontWeight: 600 } }}>
                            <TableCell>Nome</TableCell>
                            <TableCell align="right">Total</TableCell>
                            <TableCell align="right">Ações</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedSubcategories.map((sub) => {
                            const subTotal = getSubcategoryTotal(sub.id);
                            const subColor = sub.color || getCategoryColor(sub);
                            return (
                              <TableRow
                                key={sub.id}
                                sx={{
                                  '& td': { borderBottom: '1px solid rgba(255,255,255,0.01)', py: 1.5 },
                                  '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' },
                                }}
                              >
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar
                                      sx={{
                                        bgcolor: `${subColor}15`,
                                        color: subColor,
                                        width: 32,
                                        height: 32,
                                      }}
                                    >
                                      {getCategoryIcon(sub.icon, sub.name)}
                                    </Avatar>
                                    <Typography sx={{ color: '#FFFFFF', fontWeight: 500, fontSize: '0.875rem' }}>
                                      {sub.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="right" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                                  R$ {subTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell align="right">
                                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                                    <DragIcon sx={{ color: '#4E5366', fontSize: '1.2rem', cursor: 'grab' }} />
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        setMenuAnchor(e.currentTarget);
                                        setActiveCategory(sub);
                                      }}
                                      sx={{ color: '#7E8494' }}
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
                    )}
                  </TableContainer>

                  {/* Bottom Summary Right */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      borderRadius: '12px',
                      p: 1.5,
                      mt: 'auto',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#7E8494', fontWeight: 600 }}>
                      Subcategorias ({selectedSubcategories.length})
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
                      Total: R$ {rightColumnTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                  <Typography sx={{ color: '#7E8494' }}>Selecione uma categoria para ver suas subcategorias.</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Options Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { bgcolor: '#1D1E26', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' } }}
      >
        <MenuItem
          onClick={handleOpenEditModal}
          disabled={!activeCategory?.userId}
          sx={{ color: '#FFFFFF', fontWeight: 600 }}
        >
          {activeCategory?.parentCategoryId ? 'Editar Subcategoria' : 'Editar Categoria'}
        </MenuItem>
        <MenuItem
          onClick={handleDeleteCategory}
          disabled={!activeCategory?.userId}
          sx={{ color: '#E05A5A', fontWeight: 600 }}
        >
          {activeCategory?.parentCategoryId ? 'Excluir Subcategoria' : 'Excluir Categoria'}
        </MenuItem>
      </Menu>

      {/* DIALOG: Nova Categoria */}
      <Dialog
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: '#111217',
            backgroundImage: 'none',
            border: '1px solid rgba(255,255,255,0.04)',
            color: '#FFFFFF',
            width: '100%',
            maxWidth: 400,
          },
        }}
      >
        <form onSubmit={handleCreateCategory}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton onClick={() => setCatModalOpen(false)} sx={{ color: '#7E8494', p: 0.5 }}>
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.2rem' }}>Nova Categoria</Typography>
            </Box>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: activeTab === 'EXPENSE' ? '#E05A5A' : activeTab === 'REVENUE' ? '#4EBE87' : '#3B82F6',
                color: '#FFFFFF',
                borderRadius: '20px',
                fontWeight: 700,
                textTransform: 'none',
                px: 3,
                '&:hover': { bgcolor: activeTab === 'EXPENSE' ? '#E05A5A' : activeTab === 'REVENUE' ? '#4EBE87' : '#3B82F6', opacity: 0.9 },
              }}
            >
              Salvar
            </Button>
          </Box>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 3, gap: 1.5 }}>
            {/* Nome row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <DragIcon sx={{ color: '#7E8494' }} />
              <InputBase
                placeholder="Nome"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
                fullWidth
                sx={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}
              />
            </Box>

            {/* Cor row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PaletteIcon sx={{ color: '#7E8494' }} />
                <Typography sx={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}>Cor da categoria</Typography>
              </Box>
              <Box
                onClick={(e) => setColorAnchor(e.currentTarget)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: newCatColor,
                  cursor: 'pointer',
                  border: '2px solid rgba(255,255,255,0.15)',
                  '&:hover': { opacity: 0.8 },
                }}
              />
            </Box>

            {/* Icone row */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1.5,
                borderBottom: activeTab === 'ACCOUNTS' ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ImageIcon sx={{ color: '#7E8494' }} />
                <Typography sx={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}>Ícone</Typography>
              </Box>
              <IconButton
                onClick={(e) => setIconAnchor(e.currentTarget)}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: activeTab === 'EXPENSE' ? '#E05A5A' : activeTab === 'REVENUE' ? '#4EBE87' : '#3B82F6',
                  borderRadius: '50%',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                {AVAILABLE_ICONS.find((i) => i.value === newCatIcon)?.component || <HelpIcon fontSize="small" />}
              </IconButton>
            </Box>

            {/* Checkboxes for Accounts tab */}
            {activeTab === 'ACCOUNTS' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                  <DashboardIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                  <Typography sx={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}>Cards na tela de Resumo:</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 4.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showInAccountsByCategory}
                        onChange={(e) => setShowInAccountsByCategory(e.target.checked)}
                        sx={{ color: '#7E8494', '&.Mui-checked': { color: '#3B82F6' }, p: 0.5 }}
                      />
                    }
                    label={
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>
                        Considerar em Contas por Categoria
                      </Typography>
                    }
                    sx={{ ml: 0, gap: 1 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showInCategorySummary}
                        onChange={(e) => setShowInCategorySummary(e.target.checked)}
                        sx={{ color: '#7E8494', '&.Mui-checked': { color: '#3B82F6' }, p: 0.5 }}
                      />
                    }
                    label={
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>
                        Considerar no Resumo das Categorias
                      </Typography>
                    }
                    sx={{ ml: 0, gap: 1 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showInCategoryBalance}
                        onChange={(e) => setShowInCategoryBalance(e.target.checked)}
                        sx={{ color: '#7E8494', '&.Mui-checked': { color: '#3B82F6' }, p: 0.5 }}
                      />
                    }
                    label={
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>
                        Considerar no Balanço das Categorias
                      </Typography>
                    }
                    sx={{ ml: 0, gap: 1 }}
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
        </form>
      </Dialog>

      {/* DIALOG: Nova Subcategoria */}
      <Dialog
        open={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: '#111217',
            backgroundImage: 'none',
            border: '1px solid rgba(255,255,255,0.04)',
            color: '#FFFFFF',
            width: '100%',
            maxWidth: 400,
          },
        }}
      >
        <form onSubmit={handleCreateSubcategory}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton onClick={() => setSubModalOpen(false)} sx={{ color: '#7E8494', p: 0.5 }}>
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.2rem' }}>Nova Subcategoria</Typography>
            </Box>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: activeTab === 'EXPENSE' ? '#E05A5A' : '#4EBE87',
                color: '#FFFFFF',
                borderRadius: '20px',
                fontWeight: 700,
                textTransform: 'none',
                px: 3,
                '&:hover': { bgcolor: activeTab === 'EXPENSE' ? '#E05A5A' : '#4EBE87', opacity: 0.9 },
              }}
            >
              Salvar
            </Button>
          </Box>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 3, gap: 1.5 }}>
            {/* Nome row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <DragIcon sx={{ color: '#7E8494' }} />
              <InputBase
                placeholder="Nome"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                required
                fullWidth
                sx={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}
              />
            </Box>

            {/* Cor row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PaletteIcon sx={{ color: '#7E8494' }} />
                <Typography sx={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}>Cor da subcategoria</Typography>
              </Box>
              <Box
                onClick={(e) => setColorAnchor(e.currentTarget)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: newSubColor,
                  cursor: 'pointer',
                  border: '2px solid rgba(255,255,255,0.15)',
                  '&:hover': { opacity: 0.8 },
                }}
              />
            </Box>

            {/* Icone row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ImageIcon sx={{ color: '#7E8494' }} />
                <Typography sx={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}>Ícone</Typography>
              </Box>
              <IconButton
                onClick={(e) => setIconAnchor(e.currentTarget)}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: activeTab === 'EXPENSE' ? '#E05A5A' : '#4EBE87',
                  borderRadius: '50%',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                {AVAILABLE_ICONS.find((i) => i.value === newSubIcon)?.component || <HelpIcon fontSize="small" />}
              </IconButton>
            </Box>

            <Typography variant="caption" sx={{ color: '#7E8494', mt: 1 }}>
              Vincular à categoria principal: <strong>{selectedCategory?.name}</strong>
            </Typography>
          </DialogContent>
        </form>
      </Dialog>

      {/* DIALOG: Editar Categoria / Subcategoria */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: '#111217',
            backgroundImage: 'none',
            border: '1px solid rgba(255,255,255,0.04)',
            color: '#FFFFFF',
            width: '100%',
            maxWidth: 400,
          },
        }}
      >
        <form onSubmit={handleUpdateCategory}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton onClick={() => setEditModalOpen(false)} sx={{ color: '#7E8494', p: 0.5 }}>
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.2rem' }}>
                {activeCategory?.parentCategoryId ? 'Editar Subcategoria' : 'Editar Categoria'}
              </Typography>
            </Box>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: activeCategory?.type === 'EXPENSE' ? '#E05A5A' : activeCategory?.type === 'REVENUE' ? '#4EBE87' : '#3B82F6',
                color: '#FFFFFF',
                borderRadius: '20px',
                fontWeight: 700,
                textTransform: 'none',
                px: 3,
                '&:hover': { bgcolor: activeCategory?.type === 'EXPENSE' ? '#E05A5A' : activeCategory?.type === 'REVENUE' ? '#4EBE87' : '#3B82F6', opacity: 0.9 },
              }}
            >
              Salvar
            </Button>
          </Box>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', p: 3, gap: 1.5 }}>
            {/* Nome row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <DragIcon sx={{ color: '#7E8494' }} />
              <InputBase
                placeholder="Nome"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                fullWidth
                sx={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}
              />
            </Box>

            {/* Cor row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PaletteIcon sx={{ color: '#7E8494' }} />
                <Typography sx={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}>
                  {activeCategory?.parentCategoryId ? 'Cor da subcategoria' : 'Cor da categoria'}
                </Typography>
              </Box>
              <Box
                onClick={(e) => setColorAnchor(e.currentTarget)}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: editColor,
                  cursor: 'pointer',
                  border: '2px solid rgba(255,255,255,0.15)',
                  '&:hover': { opacity: 0.8 },
                }}
              />
            </Box>

            {/* Icone row */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1.5,
                borderBottom: activeCategory?.type === 'ACCOUNTS' ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ImageIcon sx={{ color: '#7E8494' }} />
                <Typography sx={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}>Ícone</Typography>
              </Box>
              <IconButton
                onClick={(e) => setIconAnchor(e.currentTarget)}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: activeCategory?.type === 'EXPENSE' ? '#E05A5A' : activeCategory?.type === 'REVENUE' ? '#4EBE87' : '#3B82F6',
                  borderRadius: '50%',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                {AVAILABLE_ICONS.find((i) => i.value === editIcon)?.component || <HelpIcon fontSize="small" />}
              </IconButton>
            </Box>

            {/* Checkboxes for Accounts tab */}
            {activeCategory?.type === 'ACCOUNTS' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                  <DashboardIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                  <Typography sx={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 500 }}>Cards na tela de Resumo:</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 4.5 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editShowInAccountsByCategory}
                        onChange={(e) => setEditShowInAccountsByCategory(e.target.checked)}
                        sx={{ color: '#7E8494', '&.Mui-checked': { color: '#3B82F6' }, p: 0.5 }}
                      />
                    }
                    label={
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>
                        Considerar em Contas por Categoria
                      </Typography>
                    }
                    sx={{ ml: 0, gap: 1 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editShowInCategorySummary}
                        onChange={(e) => setEditShowInCategorySummary(e.target.checked)}
                        sx={{ color: '#7E8494', '&.Mui-checked': { color: '#3B82F6' }, p: 0.5 }}
                      />
                    }
                    label={
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>
                        Considerar no Resumo das Categorias
                      </Typography>
                    }
                    sx={{ ml: 0, gap: 1 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editShowInCategoryBalance}
                        onChange={(e) => setEditShowInCategoryBalance(e.target.checked)}
                        sx={{ color: '#7E8494', '&.Mui-checked': { color: '#3B82F6' }, p: 0.5 }}
                      />
                    }
                    label={
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 500 }}>
                        Considerar no Balanço das Categorias
                      </Typography>
                    }
                    sx={{ ml: 0, gap: 1 }}
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
        </form>
      </Dialog>

      {/* COLOR PICKER POPOVER */}
      <Popover
        open={Boolean(colorAnchor)}
        anchorEl={colorAnchor}
        onClose={() => setColorAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            bgcolor: '#1D1E26',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            p: 2.5,
            width: 240,
            backgroundImage: 'none',
          },
        }}
      >
        <Grid container spacing={1.5}>
          {AVAILABLE_COLORS.map((col) => {
            const isCurrent = catModalOpen 
              ? newCatColor === col.value 
              : subModalOpen 
              ? newSubColor === col.value 
              : editColor === col.value;
            return (
              <Grid item xs={2.4} key={col.value} display="flex" justifyContent="center">
                <Box
                  onClick={() => {
                    if (catModalOpen) setNewCatColor(col.value);
                    else if (subModalOpen) setNewSubColor(col.value);
                    else if (editModalOpen) setEditColor(col.value);
                    setColorAnchor(null);
                  }}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: col.value,
                    cursor: 'pointer',
                    border: isCurrent ? '2.5px solid #FFFFFF' : '2.5px solid transparent',
                    boxShadow: isCurrent ? '0 0 8px rgba(255,255,255,0.3)' : 'none',
                    '&:hover': { transform: 'scale(1.15)', border: '2.5px solid rgba(255,255,255,0.5)' },
                    transition: 'all 0.15s',
                  }}
                  title={col.label}
                />
              </Grid>
            );
          })}
        </Grid>
      </Popover>

      {/* ICON PICKER POPOVER */}
      <Popover
        open={Boolean(iconAnchor)}
        anchorEl={iconAnchor}
        onClose={() => setIconAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            bgcolor: '#1D1E26',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            p: 2,
            width: 250,
            backgroundImage: 'none',
          },
        }}
      >
        <Grid container spacing={1}>
          {AVAILABLE_ICONS.map((ico) => {
            const isCurrent = catModalOpen
              ? newCatIcon === ico.value
              : subModalOpen
              ? newSubIcon === ico.value
              : editIcon === ico.value;
            const themeColor = activeTab === 'EXPENSE' ? '#E05A5A' : '#4EBE87';
            return (
              <Grid item xs={3} key={ico.value} display="flex" justifyContent="center">
                <IconButton
                  onClick={() => {
                    if (catModalOpen) setNewCatIcon(ico.value);
                    else if (subModalOpen) setNewSubIcon(ico.value);
                    else if (editModalOpen) setEditIcon(ico.value);
                    setIconAnchor(null);
                  }}
                  sx={{
                    color: isCurrent ? themeColor : '#7E8494',
                    bgcolor: isCurrent ? 'rgba(255,255,255,0.05)' : 'transparent',
                    borderRadius: '10px',
                    p: 1.2,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#FFFFFF' },
                    transition: 'all 0.15s',
                  }}
                  title={ico.label}
                >
                  {ico.component}
                </IconButton>
              </Grid>
            );
          })}
        </Grid>
      </Popover>
    </Box>
  );
};

export default CategoriesPage;
