import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { useAuth } from '../auth/AuthContext';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogContent,
  TextField,
  MenuItem,
  Switch,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Popover,
  Grid,
  Menu,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  AccountBalance as AccountIcon,
  Calculate as CalculateIcon,
  Tag as TagIcon,
  Description as DescriptionIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  DoNotDisturb as DoNotDisturbIcon,
  MoreVert as MoreVertIcon,
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
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';

interface Account {
  id: string;
  name: string;
  institution: string;
  balanceInitial: number;
  balanceCurrent: number;
  color: string;
  type: string;
  isActive: boolean;
  overdraft: number;
  accountNumber?: string;
  additionalData?: string;
  isDefault: boolean;
  showInResume: boolean;
  isInvestment: boolean;
  ignoreInTotals: boolean;
  accountGroup: string;
  icon: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
  color?: string;
  icon?: string;
  parentCategoryId?: string;
}

interface Transaction {
  id: string;
  accountId?: string;
  destinationAccountId?: string;
  value: number;
  date: string;
  type: 'REVENUE' | 'EXPENSE' | 'TRANSFER';
  description: string;
}

const ACCOUNT_TYPES: Record<string, string> = {
  CHECKING: 'Conta Corrente',
  SAVINGS: 'Poupança',
  DIGITAL_WALLET: 'Carteira Digital',
  INVESTMENT: 'Conta Investimentos',
  CASH: 'Dinheiro em Espécie',
};

const BRAND_ICONS = [
  { value: 'bank', label: '🏦 Genérico' },
  { value: 'nu', label: '🟣 Nubank' },
  { value: 'inter', label: '🟠 Inter' },
  { value: 'itau', label: '🍊 Itaú' },
  { value: 'bradesco', label: '🔴 Bradesco' },
  { value: 'santander', label: '🔻 Santander' },
  { value: 'caixa', label: '🔵 Caixa' },
  { value: 'dinheiro', label: '💵 Dinheiro' },
  { value: 'investimento', label: '📈 Investimentos' },
];

const PRESET_COLORS = [
  '#820AD1', // Nubank Purple
  '#FF7A00', // Inter Orange
  '#CC092F', // Bradesco Red
  '#EC7000', // Itaú Orange
  '#EC0000', // Santander Red
  '#1F559C', // Caixa Blue
  '#4EBE87', // Active Green
  '#26C6DA', // Cyan
  '#AB47BC', // Amethyst Purple
  '#7E8494', // Muted Grey
];

const AccountsPage: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accountCategories, setAccountCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [open, setOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('R$ 0,00');
  const [overdraft, setOverdraft] = useState('R$ 0,00');
  const [type, setType] = useState('Conta Corrente');
  const [accountGroup, setAccountGroup] = useState('Nenhum');
  const [accountNumber, setAccountNumber] = useState('');
  const [additionalData, setAdditionalData] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [showInResume, setShowInResume] = useState(true);
  const [isInvestment, setIsInvestment] = useState(false);
  const [ignoreInTotals, setIgnoreInTotals] = useState(false);
  const [color, setColor] = useState('#820AD1');
  const [icon, setIcon] = useState('bank');
  const [iconSelectedByUser, setIconSelectedByUser] = useState(false);

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

  // Icon Selector Popover
  const [iconAnchor, setIconAnchor] = useState<HTMLButtonElement | null>(null);

  // Actions Menu State
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedAccountForMenu, setSelectedAccountForMenu] = useState<Account | null>(null);

  const fetchAccountsAndTransactions = async () => {
    try {
      setLoading(true);
      const [accRes, txRes, catRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/transactions'),
        api.get('/categories'),
      ]);
      setAccounts(accRes.data);
      setTransactions(txRes.data);
      const filteredCats = (catRes.data || []).filter(
        (c: Category) => c.type === 'ACCOUNTS' && !c.parentCategoryId
      );
      setAccountCategories(filteredCats);
    } catch (err) {
      setError('Falha ao carregar contas e movimentações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountsAndTransactions();
  }, []);

  // Auto-detect bank logo & color based on name if the user hasn't overridden
  useEffect(() => {
    if (!iconSelectedByUser && !editingAccount) {
      const lower = name.toLowerCase();
      if (lower.includes('nubank')) {
        setIcon('nu');
        setColor('#820AD1');
      } else if (lower.includes('inter')) {
        setIcon('inter');
        setColor('#FF7A00');
      } else if (lower.includes('itau') || lower.includes('itaú')) {
        setIcon('itau');
        setColor('#EC7000');
      } else if (lower.includes('bradesco')) {
        setIcon('bradesco');
        setColor('#CC092F');
      } else if (lower.includes('santander')) {
        setIcon('santander');
        setColor('#EC0000');
      } else if (lower.includes('caixa')) {
        setIcon('caixa');
        setColor('#1F559C');
      }
    }
  }, [name, iconSelectedByUser, editingAccount]);

  const handleOpenCreateModal = () => {
    setEditingAccount(null);
    setName('');
    setInitialBalance('R$ 0,00');
    setOverdraft('R$ 0,00');
    setType('Conta Corrente');
    setAccountGroup('Nenhum');
    setAccountNumber('');
    setAdditionalData('');
    setIsDefault(false);
    setShowInResume(true);
    setIsInvestment(false);
    setIgnoreInTotals(false);
    setColor('#7E8494');
    setIcon('bank');
    setIconSelectedByUser(false);
    setOpen(true);
  };

  const handleOpenEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setInitialBalance(formatBRL(acc.balanceInitial));
    setOverdraft(formatBRL(acc.overdraft || 0));
    setType(acc.type);
    setAccountGroup(acc.accountGroup || 'Nenhum');
    setAccountNumber(acc.accountNumber || '');
    setAdditionalData(acc.additionalData || '');
    setIsDefault(acc.isDefault);
    setShowInResume(acc.showInResume);
    setIsInvestment(acc.isInvestment);
    setIgnoreInTotals(acc.ignoreInTotals);
    setColor(acc.color);
    setIcon(acc.icon || 'bank');
    setIconSelectedByUser(true);
    setOpen(true);
    setMenuAnchor(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        institution: name, // Default institution to description name
        balanceInitial: parseBRLToFloat(initialBalance),
        color,
        type,
        overdraft: parseBRLToFloat(overdraft),
        accountNumber,
        additionalData,
        isDefault,
        showInResume,
        isInvestment,
        ignoreInTotals,
        accountGroup,
        icon,
      };

      if (editingAccount) {
        await api.put(`/accounts/${editingAccount.id}`, payload);
      } else {
        await api.post('/accounts', payload);
      }
      setOpen(false);
      fetchAccountsAndTransactions();
    } catch (err) {
      alert('Erro ao salvar conta bancária.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir esta conta? Todas as transações relacionadas serão afetadas.')) return;
    try {
      await api.delete(`/accounts/${id}`);
      setMenuAnchor(null);
      fetchAccountsAndTransactions();
    } catch (err) {
      alert('Erro ao excluir conta.');
    }
  };

  // Calculations per account
  const calculateReceitas = (acc: Account) => {
    return transactions
      .filter((t) => t.accountId === acc.id && t.type === 'REVENUE')
      .reduce((sum, t) => sum + Number(t.value || 0), 0);
  };

  const calculateDespesas = (acc: Account) => {
    return transactions
      .filter((t) => t.accountId === acc.id && t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.value || 0), 0);
  };

  const calculateTransfCred = (acc: Account) => {
    return transactions
      .filter((t) => t.destinationAccountId === acc.id && t.type === 'TRANSFER')
      .reduce((sum, t) => sum + Number(t.value || 0), 0);
  };

  const calculateTransfDeb = (acc: Account) => {
    return transactions
      .filter((t) => t.accountId === acc.id && t.type === 'TRANSFER')
      .reduce((sum, t) => sum + Number(t.value || 0), 0);
  };

  const calculatePrevisto = (acc: Account) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Future transactions
    const futureTxs = transactions.filter((t) => new Date(t.date) > today);
    let delta = 0;
    futureTxs.forEach((t) => {
      if (t.accountId === acc.id) {
        if (t.type === 'REVENUE') delta += Number(t.value || 0);
        if (t.type === 'EXPENSE') delta -= Number(t.value || 0);
        if (t.type === 'TRANSFER') delta -= Number(t.value || 0);
      }
      if (t.destinationAccountId === acc.id && t.type === 'TRANSFER') {
        delta += Number(t.value || 0);
      }
    });
    return acc.balanceCurrent + delta;
  };

  // Overall sums
  const totalReceitas = accounts.reduce((sum, acc) => sum + calculateReceitas(acc), 0);
  const totalDespesas = accounts.reduce((sum, acc) => sum + calculateDespesas(acc), 0);
  const totalSaldo = accounts.filter(a => !a.ignoreInTotals).reduce((sum, acc) => sum + acc.balanceCurrent, 0);
  const totalPrevisto = accounts.filter(a => !a.ignoreInTotals).reduce((sum, acc) => sum + calculatePrevisto(acc), 0);

  // Logo rendering helper
  const renderAccountLogo = (accIcon: string, accColor: string, _accName: string) => {
    const normIcon = (accIcon || '').toLowerCase();


    if (normIcon === 'nu') {
      return (
        <Box sx={{ bgcolor: '#820AD1', color: '#FFFFFF', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: 'sans-serif', fontSize: '0.75rem' }}>
          nu
        </Box>
      );
    }
    if (normIcon === 'inter') {
      return (
        <Box sx={{ bgcolor: '#FF7A00', color: '#FFFFFF', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: 'sans-serif', fontSize: '0.65rem' }}>
          inter
        </Box>
      );
    }
    if (normIcon === 'itau') {
      return (
        <Box sx={{ bgcolor: '#EC7000', color: '#FFFFFF', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: 'sans-serif', fontSize: '0.75rem' }}>
          itau
        </Box>
      );
    }
    if (normIcon === 'bradesco') {
      return (
        <Box sx={{ bgcolor: '#CC092F', color: '#FFFFFF', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: 'sans-serif', fontSize: '0.8rem' }}>
          B
        </Box>
      );
    }
    if (normIcon === 'santander') {
      return (
        <Box sx={{ bgcolor: '#EC0000', color: '#FFFFFF', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: 'sans-serif', fontSize: '0.8rem' }}>
          S
        </Box>
      );
    }
    if (normIcon === 'caixa') {
      return (
        <Box sx={{ bgcolor: '#1F559C', color: '#FFFFFF', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: 'sans-serif', fontSize: '0.8rem' }}>
          X
        </Box>
      );
    }
    if (normIcon === 'dinheiro') {
      return (
        <Box sx={{ bgcolor: '#4EBE87', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
          💵
        </Box>
      );
    }
    if (normIcon === 'investimento') {
      return (
        <Box sx={{ bgcolor: '#26C6DA', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
          📈
        </Box>
      );
    }

    return (
      <Box sx={{ bgcolor: `${accColor}15`, color: accColor, width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${accColor}25` }}>
        <AccountIcon sx={{ fontSize: '1.1rem' }} />
      </Box>
    );
  };

  const getCategoryColor = (catTypeName: string) => {
    const found = accountCategories.find((c) => c.name === catTypeName);
    if (found && found.color) return found.color;
    
    // Fallback/Legacy colors
    const name = catTypeName.toLowerCase();
    if (name.includes('corrente') || catTypeName === 'CHECKING') return '#4EBE87';
    if (name.includes('poupança') || catTypeName === 'SAVINGS') return '#FFCA28';
    if (name.includes('carteira') || catTypeName === 'DIGITAL_WALLET') return '#26C6DA';
    if (name.includes('investimento') || catTypeName === 'INVESTMENT') return '#42A5F5';
    return '#66BB6A';
  };

  const getCategoryIcon = (catTypeName: string) => {
    const found = accountCategories.find((c) => c.name === catTypeName);
    const iconName = found?.icon;
    if (iconName) {
      if (iconName === 'RestaurantIcon') return <RestaurantIcon fontSize="small" />;
      if (iconName === 'TvIcon') return <TvIcon fontSize="small" />;
      if (iconName === 'CardIcon' || iconName === 'CreditCardIcon') return <CardIcon fontSize="small" />;
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
    return <AccountIcon sx={{ fontSize: '1rem' }} />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const formatCurrency = (val: number) => {
    const sign = val < -0.005 ? '-' : '';
    return `${sign}R$ ${Math.abs(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Box sx={{ pb: 8 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3.5}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
            Contas Bancárias
          </Typography>
          <Typography variant="body2" sx={{ color: '#7E8494', mt: 0.5 }}>
            Visualize e configure suas contas correntes, poupanças e investimentos.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateModal}
          sx={{ borderRadius: '12px', fontWeight: 700, px: 2.5, py: 1 }}
        >
          Nova Conta
        </Button>
      </Box>

      {accounts.length === 0 ? (
        <Paper sx={{ bgcolor: '#111217', border: '1px solid rgba(255,255,255,0.03)', py: 6, textAlign: 'center', borderRadius: '12px' }}>
          <Typography variant="body1" sx={{ color: '#7E8494' }}>
            Nenhuma conta bancária cadastrada. Comece criando sua primeira conta!
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: '#111217', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <TableCell sx={{ color: '#7E8494', fontWeight: 700, fontSize: '0.75rem', py: 1.5 }}>Descrição</TableCell>
                <TableCell align="right" sx={{ color: '#7E8494', fontWeight: 700, fontSize: '0.75rem', py: 1.5 }}>Saldo inicial</TableCell>
                <TableCell align="right" sx={{ color: '#7E8494', fontWeight: 700, fontSize: '0.75rem', py: 1.5 }}>Receitas</TableCell>
                <TableCell align="right" sx={{ color: '#7E8494', fontWeight: 700, fontSize: '0.75rem', py: 1.5 }}>Despesas</TableCell>
                <TableCell align="right" sx={{ color: '#7E8494', fontWeight: 700, fontSize: '0.75rem', py: 1.5 }}>Transf. cred.</TableCell>
                <TableCell align="right" sx={{ color: '#7E8494', fontWeight: 700, fontSize: '0.75rem', py: 1.5 }}>Transf. deb.</TableCell>
                <TableCell align="right" sx={{ color: '#7E8494', fontWeight: 700, fontSize: '0.75rem', py: 1.5 }}>Saldo</TableCell>
                <TableCell align="right" sx={{ color: '#7E8494', fontWeight: 700, fontSize: '0.75rem', py: 1.5 }}>Previsto</TableCell>
                <TableCell align="center" sx={{ color: '#7E8494', fontWeight: 700, fontSize: '0.75rem', py: 1.5 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((acc) => {
                const receitas = calculateReceitas(acc);
                const despesas = calculateDespesas(acc);
                const transfCred = calculateTransfCred(acc);
                const transfDeb = calculateTransfDeb(acc);
                const previsto = calculatePrevisto(acc);

                return (
                  <TableRow key={acc.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' }, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        {renderAccountLogo(acc.icon, acc.color, acc.name)}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                            {acc.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#7E8494', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {ACCOUNT_TYPES[acc.type] || acc.type}
                            {acc.isDefault && (
                              <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                                Padrão
                              </span>
                            )}
                          </Typography>
                        </Box>
                        {acc.isDefault && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4EBE87', ml: 'auto' }} />}
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5, color: acc.balanceInitial < 0 ? '#E05A5A' : '#7E8494', fontWeight: 600 }}>
                      {formatCurrency(acc.balanceInitial)}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5, color: '#7E8494', fontWeight: 600 }}>
                      {formatCurrency(receitas)}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5, color: '#7E8494', fontWeight: 600 }}>
                      {formatCurrency(despesas)}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5, color: '#7E8494', fontWeight: 600 }}>
                      {formatCurrency(transfCred)}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5, color: '#7E8494', fontWeight: 600 }}>
                      {formatCurrency(transfDeb)}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5, color: acc.balanceCurrent < 0 ? '#E05A5A' : '#4EBE87', fontWeight: 700 }}>
                      {formatCurrency(acc.balanceCurrent)}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5, color: previsto < 0 ? '#E05A5A' : '#FFFFFF', fontWeight: 700 }}>
                      {formatCurrency(previsto)}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
                      <IconButton
                        size="small"
                        sx={{ color: '#7E8494' }}
                        onClick={(e) => {
                          setMenuAnchor(e.currentTarget);
                          setSelectedAccountForMenu(acc);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Row Action Dropdown Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{
          sx: {
            bgcolor: '#1E1F29',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            color: '#FFFFFF',
          },
        }}
      >
        <MenuItem onClick={() => selectedAccountForMenu && handleOpenEditModal(selectedAccountForMenu)}>
          Editar Conta
        </MenuItem>
        <MenuItem
          onClick={() => selectedAccountForMenu && handleDelete(selectedAccountForMenu.id)}
          sx={{ color: '#E05A5A' }}
        >
          Excluir Conta
        </MenuItem>
      </Menu>

      {/* DIALOG: Nova Conta / Editar Conta (Matches Mockup Design) */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1E1F29',
            backgroundImage: 'none',
            borderRadius: '24px',
            p: 1.5,
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.4)',
          },
        }}
      >
        <form onSubmit={handleSave}>
          <Box display="flex" justifyContent="space-between" alignItems="center" px={1.5} pt={1.5} pb={1}>
            <IconButton onClick={() => setOpen(false)} sx={{ color: '#7E8494' }}>
              <CloseIcon />
            </IconButton>
            <Box textAlign="center" flexGrow={1}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1.15rem', lineHeight: 1.2 }}>
                {editingAccount ? 'Editar Conta' : 'Nova Conta'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.75rem' }}>
                {user?.fullName || 'Felipe'}
              </Typography>
            </Box>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: '#3B82F6',
                color: '#FFFFFF',
                borderRadius: '20px',
                fontWeight: 700,
                textTransform: 'none',
                px: 3.2,
                py: 0.6,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#2563EB', boxShadow: 'none' },
              }}
            >
              Salvar
            </Button>
          </Box>

          <DialogContent sx={{ px: 2.5, py: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {/* Field: Descrição */}
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Box sx={{ width: 24, display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: 14, height: 2, bgcolor: '#7E8494', position: 'relative', '&::before, &::after': { content: '""', position: 'absolute', width: 14, height: 2, bgcolor: '#7E8494' }, '&::before': { top: -4 }, '&::after': { top: 4 } }} />
              </Box>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Descrição"
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputProps={{
                  disableUnderline: false,
                  style: { color: '#FFFFFF', fontSize: '1rem', fontWeight: 600 },
                }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.08)' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#3B82F6' },
                }}
                required
              />
              <IconButton
                onClick={(e) => setIconAnchor(e.currentTarget)}
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  bgcolor: icon === 'bank' ? 'rgba(255,255,255,0.05)' : color,
                  color: '#FFFFFF',
                  flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.08)',
                  '&:hover': { bgcolor: icon === 'bank' ? 'rgba(255,255,255,0.1)' : color },
                }}
              >
                {icon === 'bank' ? <AccountIcon sx={{ fontSize: '1.2rem' }} /> : (
                  icon === 'nu' ? 'nu' : (
                    icon === 'inter' ? 'i' : (
                      icon === 'itau' ? 'it' : (
                        icon === 'bradesco' ? 'B' : (
                          icon === 'santander' ? 'S' : (
                            icon === 'caixa' ? 'X' : (
                              icon === 'dinheiro' ? '💵' : '📈'
                            )
                          )
                        )
                      )
                    )
                  )
                )}
              </IconButton>
            </Box>

            {/* Field: Saldo inicial */}
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Box sx={{ width: 24, display: 'flex', justifyContent: 'center', color: '#7E8494' }}>
                <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #7E8494', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.65rem' }}>$</Box>
              </Box>
              <Typography sx={{ color: '#7E8494', fontSize: '0.92rem', fontWeight: 500, flexGrow: 1 }}>Saldo inicial</Typography>
              <TextField
                variant="standard"
                placeholder="R$ 0,00"
                value={initialBalance}
                onChange={(e) => setInitialBalance(maskBRL(e.target.value))}
                InputProps={{
                  disableUnderline: false,
                  style: { color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700, textAlign: 'right' },
                }}
                inputProps={{
                  style: { textAlign: 'right', width: 120 },
                }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.08)' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#3B82F6' },
                }}
                required
              />
              <Box sx={{ width: 34, height: 34, bgcolor: '#242530', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7E8494', flexShrink: 0 }}>
                <CalculateIcon fontSize="small" sx={{ fontSize: '1rem' }} />
              </Box>
            </Box>

            {/* Field: Cheque especial */}
            <Box display="flex" alignItems="center" gap={2} mb={3.5}>
              <Box sx={{ width: 24, display: 'flex', justifyContent: 'center', color: '#7E8494' }}>
                <DescriptionIcon sx={{ fontSize: '1.25rem' }} />
              </Box>
              <Typography sx={{ color: '#7E8494', fontSize: '0.92rem', fontWeight: 500, flexGrow: 1 }}>Cheque especial</Typography>
              <TextField
                variant="standard"
                placeholder="R$ 0,00"
                value={overdraft}
                onChange={(e) => setOverdraft(maskBRL(e.target.value))}
                InputProps={{
                  disableUnderline: false,
                  style: { color: '#FFFFFF', fontSize: '1rem', fontWeight: 600, textAlign: 'right' },
                }}
                inputProps={{
                  style: { textAlign: 'right', width: 120 },
                }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.08)' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#3B82F6' },
                }}
              />
              <Box sx={{ width: 34, flexShrink: 0 }} /> {/* Spacer */}
            </Box>

            {/* Field: Categoria */}
            <Box mb={3}>
              <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.72rem', display: 'block', mb: 0.5 }}>
                Categoria
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: `${getCategoryColor(type)}15`,
                    color: getCategoryColor(type),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getCategoryIcon(type)}
                </Box>
                <TextField
                  select
                  fullWidth
                  variant="standard"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  InputProps={{
                    disableUnderline: false,
                    style: { color: '#FFFFFF', fontWeight: 600, fontSize: '0.92rem' },
                  }}
                  sx={{
                    '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.08)' },
                    '& .MuiInput-underline:after': { borderBottomColor: '#3B82F6' },
                  }}
                >
                  {accountCategories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </MenuItem>
                  ))}
                  {/* Fallback menu items for compatibility with legacy data */}
                  {type && !accountCategories.find(c => c.name === type) && (
                    <MenuItem value={type}>
                      {type === 'CHECKING' ? 'Conta Corrente' : type === 'SAVINGS' ? 'Poupança' : type}
                    </MenuItem>
                  )}
                </TextField>
              </Box>
            </Box>

            {/* Field: Agrupar em */}
            <Box mb={3}>
              <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.72rem', display: 'block', mb: 0.5 }}>
                Agrupar em
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.04)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AccountIcon sx={{ fontSize: '1rem' }} />
                </Box>
                <TextField
                  select
                  fullWidth
                  variant="standard"
                  value={accountGroup}
                  onChange={(e) => setAccountGroup(e.target.value)}
                  InputProps={{
                    disableUnderline: false,
                    style: { color: '#FFFFFF', fontWeight: 600, fontSize: '0.92rem' },
                  }}
                  sx={{
                    '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.08)' },
                    '& .MuiInput-underline:after': { borderBottomColor: '#3B82F6' },
                  }}
                >
                  <MenuItem value="Nenhum">Nenhum</MenuItem>
                  <MenuItem value="Contas Bancárias">Contas Bancárias</MenuItem>
                  <MenuItem value="Investimentos">Investimentos</MenuItem>
                  <MenuItem value="Dinheiro">Dinheiro</MenuItem>
                  <MenuItem value="Outros">Outros</MenuItem>
                </TextField>
              </Box>
            </Box>

            {/* Field: Número da conta */}
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Box sx={{ width: 24, display: 'flex', justifyContent: 'center', color: '#7E8494' }}>
                <TagIcon sx={{ fontSize: '1.25rem' }} />
              </Box>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Número da conta"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                InputProps={{
                  disableUnderline: false,
                  style: { color: '#FFFFFF', fontSize: '0.92rem' },
                }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.08)' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#3B82F6' },
                }}
              />
            </Box>

            {/* Field: Dados adicionais */}
            <Box display="flex" alignItems="center" gap={2} mb={4}>
              <Box sx={{ width: 24, display: 'flex', justifyContent: 'center', color: '#7E8494' }}>
                <DescriptionIcon sx={{ fontSize: '1.25rem' }} />
              </Box>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Dados adicionais"
                value={additionalData}
                onChange={(e) => setAdditionalData(e.target.value)}
                InputProps={{
                  disableUnderline: false,
                  style: { color: '#FFFFFF', fontSize: '0.92rem' },
                }}
                sx={{
                  '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.08)' },
                  '& .MuiInput-underline:after': { borderBottomColor: '#3B82F6' },
                }}
              />
            </Box>

            {/* Toggle: Padrão para ser descontado */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <AccountIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem' }}>Padrão para ser descontado</Typography>
              </Box>
              <Switch
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#3B82F6' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#3B82F6' },
                }}
              />
            </Box>

            {/* Toggle: Exibir na tela de Resumo */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <DashboardIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem' }}>Exibir na tela de Resumo</Typography>
              </Box>
              <Switch
                checked={showInResume}
                onChange={(e) => setShowInResume(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#3B82F6' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#3B82F6' },
                }}
              />
            </Box>

            {/* Toggle: Conta para investimentos */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUpIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem' }}>Conta para investimentos</Typography>
              </Box>
              <Switch
                checked={isInvestment}
                onChange={(e) => setIsInvestment(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#3B82F6' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#3B82F6' },
                }}
              />
            </Box>

            {/* Toggle: Ignorar nos totais */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Box display="flex" alignItems="center" gap={2}>
                <DoNotDisturbIcon sx={{ color: '#7E8494', fontSize: '1.25rem' }} />
                <Typography sx={{ color: '#FFFFFF', fontSize: '0.9rem' }}>Ignorar nos totais</Typography>
              </Box>
              <Switch
                checked={ignoreInTotals}
                onChange={(e) => setIgnoreInTotals(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#3B82F6' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#3B82F6' },
                }}
              />
            </Box>
          </DialogContent>
        </form>
      </Dialog>

      {/* POPOVER: Brand & Color Selection */}
      <Popover
        open={Boolean(iconAnchor)}
        anchorEl={iconAnchor}
        onClose={() => setIconAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{
          sx: {
            bgcolor: '#242530',
            border: '1px solid rgba(255,255,255,0.08)',
            p: 2,
            width: 280,
            borderRadius: '16px',
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1, fontWeight: 700 }}>
          Selecione a Instituição
        </Typography>
        <Grid container spacing={1} mb={2}>
          {BRAND_ICONS.map((brand) => (
            <Grid item xs={4} key={brand.value}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setIcon(brand.value);
                  setIconSelectedByUser(true);
                  if (brand.value === 'nu') setColor('#820AD1');
                  else if (brand.value === 'inter') setColor('#FF7A00');
                  else if (brand.value === 'itau') setColor('#EC7000');
                  else if (brand.value === 'bradesco') setColor('#CC092F');
                  else if (brand.value === 'santander') setColor('#EC0000');
                  else if (brand.value === 'caixa') setColor('#1F559C');
                  else if (brand.value === 'dinheiro') setColor('#4EBE87');
                  else if (brand.value === 'investimento') setColor('#26C6DA');
                }}
                sx={{
                  py: 1,
                  fontSize: '0.68rem',
                  textTransform: 'none',
                  color: icon === brand.value ? '#3B82F6' : '#7E8494',
                  borderColor: icon === brand.value ? '#3B82F6' : 'rgba(255,255,255,0.06)',
                  bgcolor: icon === brand.value ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                  '&:hover': { borderColor: '#3B82F6' },
                }}
              >
                {brand.label.split(' ')[1]}
              </Button>
            </Grid>
          ))}
        </Grid>

        <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1, fontWeight: 700 }}>
          Selecione a Cor Customizada
        </Typography>
        <Grid container spacing={1}>
          {PRESET_COLORS.map((c) => (
            <Grid item xs={2.4} key={c}>
              <Box
                onClick={() => {
                  setColor(c);
                  setIconSelectedByUser(true);
                }}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: c,
                  cursor: 'pointer',
                  border: color === c ? '2.5px solid #FFFFFF' : 'none',
                  '&:hover': { opacity: 0.8 },
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Popover>

      {/* BOTTOM SUMMARY BAR (Matches Mockup Footer) */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: { xs: 0, md: 'calc(var(--total-sidebar-width, 100px))' },
          right: 0,
          bgcolor: '#111217',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          py: 1.8,
          px: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
          transition: 'left 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box display="flex" alignItems="center" gap={4}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4EBE87' }} />
            <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.75rem' }}>
              Receitas: <strong style={{ color: '#7E8494' }}>{formatCurrency(totalReceitas)}</strong>
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#E05A5A' }} />
            <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.75rem' }}>
              Despesas: <strong style={{ color: '#7E8494' }}>{formatCurrency(totalDespesas)}</strong>
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#3B82F6' }} />
            <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.75rem' }}>
              Saldo: <strong style={{ color: '#FFFFFF', fontSize: '0.85rem' }}>{formatCurrency(totalSaldo)}</strong>
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#7E8494' }} />
            <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.75rem' }}>
              Previsto: <strong style={{ color: '#FFFFFF' }}>{formatCurrency(totalPrevisto)}</strong>
            </Typography>
          </Box>
        </Box>
        <Button
          variant="text"
          sx={{
            color: '#3B82F6',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.05)' },
          }}
        >
          Detalhes
        </Button>
      </Box>
    </Box>
  );
};

export default AccountsPage;
