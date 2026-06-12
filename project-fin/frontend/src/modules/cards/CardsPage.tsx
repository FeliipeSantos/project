import React, { useState, useEffect } from 'react';
import api from '../../config/api';
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
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  CreditCard as CardIcon,
} from '@mui/icons-material';

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

const CARDS_BRANDS = ['VISA', 'MASTERCARD', 'AMEX', 'ELO'];

const CardsPage: React.FC = () => {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [open, setOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [brand, setBrand] = useState('VISA');
  const [limit, setLimit] = useState('R$ 0,00');
  const [closingDay, setClosingDay] = useState(5);
  const [dueDay, setDueDay] = useState(10);

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

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cards');
      setCards(res.data);
    } catch (err) {
      setError('Falha ao carregar os cartões de crédito.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/cards', {
        name,
        bank,
        brand,
        limitTotal: parseBRLToFloat(limit),
        closingDay,
        dueDay,
      });
      setOpen(false);
      setName('');
      setBank('');
      setBrand('VISA');
      setLimit('R$ 0,00');
      fetchCards();
    } catch (err) {
      alert('Erro ao cadastrar cartão.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

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
          onClick={() => setOpen(true)}
          sx={{ borderRadius: '12px', fontWeight: 700 }}
        >
          Cadastrar Cartão
        </Button>
      </Box>

      {cards.length === 0 ? (
        <Card sx={{ bgcolor: '#111217', border: '1px solid rgba(255,255,255,0.03)' }}>
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: '#7E8494' }}>
              Nenhum cartão de crédito cadastrado. Comece adicionando um cartão!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {cards.map((c) => {
            const usagePercent = c.limitTotal > 0 ? (c.limitUsed / c.limitTotal) * 100 : 0;
            return (
              <Grid item xs={12} sm={6} md={4} key={c.id}>
                <Card sx={{
                  bgcolor: '#111217',
                  border: '1px solid rgba(255,255,255,0.03)',
                  height: '100%',
                  background: 'linear-gradient(135deg, #161821 0%, #101116 100%)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                }}>
                  <CardContent sx={{ p: 2.8, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <CardIcon sx={{ color: '#3B82F6', fontSize: '1.6rem' }} />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1.05rem', lineHeight: 1.2 }}>
                            {c.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.72rem' }}>
                            {c.bank}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', px: 1, py: 0.25, fontSize: '0.68rem', fontWeight: 700, color: '#7E8494', bgcolor: 'rgba(255,255,255,0.02)' }}>
                        {c.brand}
                      </Box>
                    </Box>

                    {/* Limits breakdown */}
                    <Box display="flex" flexDirection="column" gap={0.8}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.72rem' }}>Limite Usado</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#E05A5A', fontSize: '0.85rem' }}>
                          R$ {c.limitUsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.72rem' }}>Limite Disponível</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#4EBE87', fontSize: '0.85rem' }}>
                          R$ {c.limitAvailable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                            backgroundColor: usagePercent >= 90 ? '#E05A5A' : '#3B82F6',
                            borderRadius: 4,
                          }
                        }}
                      />
                    </Box>

                    {/* Billing metadata */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ borderTop: '1px solid rgba(255,255,255,0.03)', pt: 1.8 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.68rem', display: 'block' }}>Fechamento</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.8rem', mt: 0.25 }}>Dia {c.closingDay}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.68rem', display: 'block' }}>Vencimento</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.8rem', mt: 0.25 }}>Dia {c.dueDay}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ color: '#7E8494', fontSize: '0.68rem', display: 'block' }}>Limite Total</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.825rem', mt: 0.25 }}>
                          R$ {c.limitTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

      {/* DIALOG: Criar Cartão de Crédito */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Cadastrar Cartão de Crédito</DialogTitle>
        <form onSubmit={handleCreate}>
          <DialogContent>
            <TextField fullWidth label="Nome do Cartão" value={name} onChange={(e) => setName(e.target.value)} margin="normal" required placeholder="Ex: Cartão Roxinho" />
            <TextField fullWidth label="Banco Emissor" value={bank} onChange={(e) => setBank(e.target.value)} margin="normal" required placeholder="Ex: Nubank, Itaú" />
            <TextField fullWidth label="Bandeira" select value={brand} onChange={(e) => setBrand(e.target.value)} margin="normal">
              {CARDS_BRANDS.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Limite Total (R$)" type="text" value={limit} onChange={(e) => setLimit(maskBRL(e.target.value))} margin="normal" required />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="Dia Fechamento" type="number" value={closingDay} onChange={(e) => setClosingDay(parseInt(e.target.value))} margin="normal" required inputProps={{ min: 1, max: 31 }} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Dia Vencimento" type="number" value={dueDay} onChange={(e) => setDueDay(parseInt(e.target.value))} margin="normal" required inputProps={{ min: 1, max: 31 }} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">Cadastrar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CardsPage;
