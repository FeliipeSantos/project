import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  MoreHoriz as OptionsIcon,
  Add as AddIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  Remove as RemoveIcon,
  SwapVert as SwapIcon,
  Percent as PercentIcon,
  TrackChanges as TargetIcon,
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon,
  Category as CategoryIcon,
  LocalOffer as TagIcon,
  CalendarToday as CalendarIcon,
  AutoAwesome as SparklesIcon,
  Build as ToolsIcon,
  Settings as SettingsIcon,
  MonetizationOn as PriceIcon,
  HelpOutline as HelpIcon,
  InfoOutlined as InfoIcon,
  Sync as SyncIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';

import BrandLogo from './BrandLogo';

// ── Layout dimensions ──────────────────────────────────────────
const COLLAPSED_SIDEBAR_WIDTH = 68;
const EXPANDED_SIDEBAR_WIDTH  = 240;
const APPBAR_HEIGHT           = 68;

// ── Color tokens (match image exactly) ────────────────────────
const BG          = '#0F1016';
const ICON_BG     = '#13141B';
const NAV_BG      = '#171821';
const ACTIVE_BG   = 'rgba(59, 130, 246, 0.08)';
const ICON_ACTIVE = '#3B82F6';
const ICON_MUTED  = '#6F768E';
const TEXT_ACTIVE = '#FFFFFF';
const TEXT_MUTED  = '#6F768E';

// ── Nav items grouped by sections ─────────────────────────────
interface MenuItemType {
  text: string;
  icon: React.ReactNode;
  path: string;
}

interface MenuSectionType {
  title: string | null;
  items: MenuItemType[];
}

const menuSections: MenuSectionType[] = [
  {
    title: null,
    items: [
      { text: 'Resumo',             icon: <DashboardIcon fontSize="small" />, path: '/' },
      { text: 'Contas',             icon: <BankIcon fontSize="small" />,      path: '/contas' },
      { text: 'Transações',         icon: <SwapIcon fontSize="small" />,      path: '/transacoes' },
      { text: 'Cartões de crédito',  icon: <CardIcon fontSize="small" />,      path: '/cartoes' },
    ]
  },
  {
    title: 'PLANEJAR',
    items: [
      { text: 'Orçamentos',         icon: <PercentIcon fontSize="small" />,   path: '/orcamentos' },
      { text: 'Objetivos',          icon: <TargetIcon fontSize="small" />,    path: '/objetivos' },
    ]
  },
  {
    title: 'ANALISAR',
    items: [
      { text: 'Relatórios',         icon: <AssessmentIcon fontSize="small" />, path: '/relatorios' },
      { text: 'Gráficos',           icon: <PieChartIcon fontSize="small" />,   path: '/graficos' },
      { text: 'Categorias',         icon: <CategoryIcon fontSize="small" />,   path: '/categorias' },
      { text: 'Tags',               icon: <TagIcon fontSize="small" />,        path: '/tags' },
      { text: 'Calendário',         icon: <CalendarIcon fontSize="small" />,   path: '/calendario' },
    ]
  },
  {
    title: null,
    items: [
      { text: 'Mia',                icon: <SparklesIcon fontSize="small" style={{ color: '#F5A623' }} />, path: '/mia' },
      { text: 'Ferramentas',        icon: <ToolsIcon fontSize="small" />,      path: '/ferramentas' },
      { text: 'Configurações',      icon: <SettingsIcon fontSize="small" />,   path: '/configuracoes' },
    ]
  },
  {
    title: null,
    items: [
      { text: 'Planos e Preços',    icon: <PriceIcon fontSize="small" />,      path: '/planos' },
      { text: 'Ajuda',              icon: <HelpIcon fontSize="small" />,       path: '/ajuda' },
      { text: 'Sobre',              icon: <InfoIcon fontSize="small" />,       path: '/sobre' },
    ]
  },
  {
    title: null,
    items: [
      { text: 'Sincronizar',        icon: <SyncIcon fontSize="small" />,       path: '#sync' },
      { text: 'Modo claro',         icon: <LightModeIcon fontSize="small" />,  path: '#theme' },
    ]
  }
];

// ─────────────────────────────────────────────────────────────
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  const handleSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1500);
  };

  const handleToggleTheme = () => {
    setIsLightMode(!isLightMode);
    document.body.classList.toggle('light-theme');
  };

  const getMenuIcon = (item: MenuItemType) => {
    if (item.text === 'Sincronizar') {
      return (
        <SyncIcon
          fontSize="small"
          sx={{
            animation: isSyncing ? 'spin 1.5s linear infinite' : 'none',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            }
          }}
        />
      );
    }
    if (item.text === 'Modo claro' || item.text === 'Modo escuro') {
      return isLightMode ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />;
    }
    return item.icon;
  };

  const getMenuText = (item: MenuItemType) => {
    if (item.text === 'Modo claro' || item.text === 'Modo escuro') {
      return isLightMode ? 'Modo escuro' : 'Modo claro';
    }
    return item.text;
  };

  const currentMonth = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1;
  const currentYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

  const SIDEBAR_WIDTH = isExpanded ? EXPANDED_SIDEBAR_WIDTH : COLLAPSED_SIDEBAR_WIDTH;
  const TOTAL_SIDEBAR = SIDEBAR_WIDTH + 32; // sidebar width + 16px left + 16px right margins

  React.useEffect(() => {
    document.documentElement.style.setProperty('--total-sidebar-width', `${TOTAL_SIDEBAR}px`);
  }, [TOTAL_SIDEBAR]);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  const handlePrevMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setSearchParams((prev) => {
      prev.set('month', newMonth.toString());
      prev.set('year', newYear.toString());
      return prev;
    });
  };

  const handleNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setSearchParams((prev) => {
      prev.set('month', newMonth.toString());
      prev.set('year', newYear.toString());
      return prev;
    });
  };

  const handleOpenAddMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleCloseAddMenu = () => {
    setAddMenuAnchor(null);
  };

  const handleSelectAddOption = (type: string) => {
    setAddMenuAnchor(null);
    setSearchParams((prev) => {
      prev.set('new_tx', 'true');
      prev.set('tx_type', type);
      return prev;
    });
  };

  const userInitials = (user?.fullName ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // ── Collapsible Sidebar Content ──────────────────────────────
  const SidebarContent = (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: { xs: 'calc(100vh - 32px)', md: `calc(100vh - ${APPBAR_HEIGHT + 24}px)` },
        mt: { xs: 2, md: `${APPBAR_HEIGHT + 8}px` },
        mb: 2,
        ml: 2,
        mr: 2,
        borderRadius: '24px',
        bgcolor: isExpanded ? NAV_BG : ICON_BG,
        display: 'flex',
        flexDirection: 'column',
        pt: 3,
        pb: 3,
        border: '1px solid rgba(255,255,255,0.02)',
        transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {isExpanded ? (
        <>
          {/* Spacer to separate header from menu */}
          <Box sx={{ height: 16 }} />

          {/* Nav list */}
          <List sx={{ px: 1.25, py: 0, flexGrow: 1, overflowY: 'auto', overscrollBehaviorY: 'contain', '&::-webkit-scrollbar': { width: 0 } }}>
            {menuSections.map((section, secIdx) => (
              <React.Fragment key={secIdx}>
                {section.title && (
                  <Typography
                    sx={{
                      color: '#4E5366',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      px: 1.75,
                      mt: 2.5,
                      mb: 0.75,
                      letterSpacing: '0.12em',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                    }}
                  >
                    {section.title}
                  </Typography>
                )}
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const itemText = getMenuText(item);
                  const itemIcon = getMenuIcon(item);
                  return (
                    <ListItem key={item.text} disablePadding sx={{ mb: 0.25 }}>
                      <ListItemButton
                        onClick={() => {
                          if (item.path === '#sync') {
                            handleSync();
                          } else if (item.path === '#theme') {
                            handleToggleTheme();
                          } else {
                            navigate(item.path);
                          }
                          setMobileOpen(false);
                        }}
                        sx={{
                          borderRadius: '12px',
                          py: 0.75,
                          px: 1.5,
                          bgcolor: isActive ? ACTIVE_BG : 'transparent',
                          transition: 'all 0.18s ease',
                          '&:hover': {
                            bgcolor: isActive ? ACTIVE_BG : 'rgba(255,255,255,0.04)',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: isActive ? ICON_ACTIVE : ICON_MUTED,
                            minWidth: 32,
                            transition: 'color 0.18s',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {itemIcon}
                        </ListItemIcon>
                        <ListItemText
                          primary={itemText}
                          primaryTypographyProps={{
                            fontSize: '0.825rem',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? TEXT_ACTIVE : TEXT_MUTED,
                            noWrap: true,
                            fontFamily: '"Plus Jakarta Sans", sans-serif',
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
                {secIdx < menuSections.length - 1 && (
                  <Box sx={{ my: 1.5, mx: 1.5, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }} />
                )}
              </React.Fragment>
            ))}
          </List>


        </>
      ) : (
        <>
          {/* Spacer to separate header from menu */}
          <Box sx={{ height: 16 }} />

          {/* Centered Icons List */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, width: '100%', overflowY: 'auto', overscrollBehaviorY: 'contain', '&::-webkit-scrollbar': { width: 0 } }}>
            {menuSections.map((section, secIdx) => (
              <React.Fragment key={secIdx}>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const itemText = getMenuText(item);
                  const itemIcon = getMenuIcon(item);
                  return (
                    <Tooltip key={item.path} title={itemText} placement="right" arrow>
                      <IconButton
                        onClick={() => {
                          if (item.path === '#sync') {
                            handleSync();
                          } else if (item.path === '#theme') {
                            handleToggleTheme();
                          } else {
                            navigate(item.path);
                          }
                          setMobileOpen(false);
                        }}
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: '12px',
                          color: isActive ? ICON_ACTIVE : ICON_MUTED,
                          bgcolor: isActive ? ACTIVE_BG : 'transparent',
                          transition: 'all 0.18s ease',
                          '&:hover': {
                            bgcolor: isActive ? ACTIVE_BG : 'rgba(255,255,255,0.06)',
                            color: isActive ? ICON_ACTIVE : '#EEEEF5',
                          },
                        }}
                      >
                        {itemIcon}
                      </IconButton>
                    </Tooltip>
                  );
                })}
                {secIdx < menuSections.length - 1 && (
                  <Box sx={{ my: 1, width: '60%', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }} />
                )}
              </React.Fragment>
            ))}
          </Box>


        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: BG }}>
      <CssBaseline />

      {/* ── Desktop: fixed collapsible sidebar ── */}
      <Box
        component="nav"
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 1100,
          width: TOTAL_SIDEBAR,
          transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {SidebarContent}
      </Box>

      {/* ── Mobile: temporary drawer ── */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: TOTAL_SIDEBAR,
            border: 0,
            bgcolor: 'transparent',
            backgroundImage: 'none',
            transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
      >
        {SidebarContent}
      </Drawer>

      {/* ── Top AppBar ── */}
      <AppBar
        position="fixed"
        sx={{
          left: 0,
          width: '100%',
          bgcolor: BG,
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
          boxShadow: 'none',
          zIndex: 1200,
          transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Toolbar
          sx={{
            minHeight: `${APPBAR_HEIGHT}px !important`,
            px: { xs: 2, md: 3 },
            gap: 2,
          }}
        >
          {/* Mobile hamburger */}
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' }, color: TEXT_MUTED }}
          >
            <MenuIcon />
          </IconButton>

          {/* Desktop Hamburger trigger */}
          <IconButton
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ display: { xs: 'none', md: 'inline-flex' }, color: TEXT_MUTED, mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo and name next to hamburger trigger */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mr: 2 }}>
            <BrandLogo size={24} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: '0.95rem',
                color: '#FFFFFF',
                letterSpacing: '0.02em',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              FinControl
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Month Navigator moved next to the blue + button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'rgba(255,255,255,0.03)',
              borderRadius: '20px',
              px: 0.5,
              py: 0.25,
              gap: 0.5,
              border: '1px solid rgba(255,255,255,0.04)',
              mr: 1.5,
            }}
          >
            <IconButton size="small" onClick={handlePrevMonth} sx={{ color: TEXT_MUTED, p: 0.5 }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ fontSize: '0.825rem', fontWeight: 600, px: 1, color: '#FFFFFF', minWidth: 60, textAlign: 'center' }}>
              {MONTHS[currentMonth - 1]}
            </Typography>
            <IconButton size="small" onClick={handleNextMonth} sx={{ color: TEXT_MUTED, p: 0.5 }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Circular Quick Add button */}
          <Tooltip title="Registrar Transação">
            <IconButton
              onClick={handleOpenAddMenu}
              sx={{
                color: '#FFFFFF',
                bgcolor: '#3B82F6',
                borderRadius: '50%',
                width: 36,
                height: 36,
                '&:hover': { bgcolor: '#1D4ED8' },
                mr: 1.5,
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Quick Insert Menu Dropdown */}
          <Menu
            anchorEl={addMenuAnchor}
            open={Boolean(addMenuAnchor)}
            onClose={handleCloseAddMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 230,
                borderRadius: '24px',
                bgcolor: '#13141B',
                border: '1px solid rgba(255,255,255,0.04)',
                boxShadow: '0px 10px 45px rgba(0, 0, 0, 0.65)',
                p: 0.75,
              }
            }}
          >
            {/* Despesa */}
            <MenuItem
              onClick={() => handleSelectAddOption('EXPENSE')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1.5,
                px: 2,
                borderRadius: '16px',
                color: '#FFFFFF',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.04)',
                }
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  bgcolor: '#1E1F28',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#E05A5A',
                }}
              >
                <RemoveIcon sx={{ fontSize: '1.25rem' }} />
              </Box>
              <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}>
                Despesa
              </Typography>
            </MenuItem>

            {/* Despesa cartão */}
            <MenuItem
              onClick={() => handleSelectAddOption('EXPENSE_CARD')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1.5,
                px: 2,
                borderRadius: '16px',
                color: '#FFFFFF',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.04)',
                }
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  bgcolor: '#1E1F28',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3B82F6',
                }}
              >
                <CardIcon sx={{ fontSize: '1.25rem' }} />
              </Box>
              <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}>
                Despesa cartão
              </Typography>
            </MenuItem>

            {/* Receita */}
            <MenuItem
              onClick={() => handleSelectAddOption('REVENUE')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1.5,
                px: 2,
                borderRadius: '16px',
                color: '#FFFFFF',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.04)',
                }
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  bgcolor: '#1E1F28',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4EBE87',
                }}
              >
                <AddIcon sx={{ fontSize: '1.25rem' }} />
              </Box>
              <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}>
                Receita
              </Typography>
            </MenuItem>

            {/* Transferência */}
            <MenuItem
              onClick={() => handleSelectAddOption('TRANSFER')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1.5,
                px: 2,
                borderRadius: '16px',
                color: '#FFFFFF',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.04)',
                }
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  bgcolor: '#1E1F28',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F4A261',
                }}
              >
                <SwapIcon sx={{ fontSize: '1.25rem' }} />
              </Box>
              <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}>
                Transferência
              </Typography>
            </MenuItem>
          </Menu>

          {/* More options button */}
          <Tooltip title="Opções">
            <IconButton
              sx={{
                color: TEXT_MUTED,
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '50%',
                width: 36,
                height: 36,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                mr: 1.5,
              }}
            >
              <OptionsIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* User widget profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Space/Pill widget */}
            <Box
              id="user-menu-button"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                px: 1.5,
                py: 0.5,
                borderRadius: '20px',
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.04)',
                transition: 'all 0.18s',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
              }}
            >
              {/* Dead-face icon custom circle */}
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: '#5B6B7C', // Slate grey background
                  color: '#0F1016',   // Dark charcoal color for stroke
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Left eye 'X' */}
                  <line x1="7.5" y1="8.5" x2="11.5" y2="12.5" />
                  <line x1="11.5" y1="8.5" x2="7.5" y2="12.5" />
                  
                  {/* Right eye 'X' */}
                  <line x1="12.5" y1="8.5" x2="16.5" y2="12.5" />
                  <line x1="16.5" y1="8.5" x2="12.5" y2="12.5" />
                  
                  {/* Sad mouth curve */}
                  <path d="M 8 16.5 Q 12 13.5 16 16.5" />
                </svg>
              </Box>

              <Typography
                variant="body2"
                sx={{ color: '#FFFFFF', fontWeight: 500, fontSize: '0.825rem', display: { xs: 'none', sm: 'block' } }}
              >
                {user?.fullName?.split(' ')[0] || 'Felipe'}
              </Typography>
              <ArrowDownIcon sx={{ fontSize: '0.9rem', color: TEXT_MUTED }} />
            </Box>

            {/* Profile Avatar showing FS initials */}
            <Tooltip title="Menu do Usuário">
              <Avatar
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                {userInitials}
              </Avatar>
            </Tooltip>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ sx: { mt: 1, minWidth: 150, borderRadius: '12px' } }}
          >
            <MenuItem onClick={handleLogout} sx={{ gap: 1.5 }}>
              <LogoutIcon fontSize="small" sx={{ color: '#FF5252' }} />
              <Typography color="error" variant="body2" sx={{ fontWeight: 500 }}>Sair</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ── Main content ── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: `${TOTAL_SIDEBAR}px` },
          mt: `${APPBAR_HEIGHT}px`,
          p: { xs: 2, md: 3 },
          minHeight: `calc(100vh - ${APPBAR_HEIGHT}px)`,
          bgcolor: BG,
          transition: 'margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
