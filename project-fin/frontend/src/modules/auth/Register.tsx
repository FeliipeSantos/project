import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Link,
  CircularProgress,
} from '@mui/material';
import BrandLogo from '../../components/BrandLogo';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password);
      navigate('/');
    } catch (err: any) {
      if (err.response && err.response.data && (err.response.data.detail || err.response.data.message)) {
        setError(err.response.data.detail || err.response.data.message);
      } else {
        setError('Ocorreu um erro ao criar a conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0F1016',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          top: '-100px',
          right: '-100px',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(78,190,135,0.05) 0%, transparent 70%)',
          bottom: '-80px',
          left: '-80px',
          pointerEvents: 'none',
        },
      }}
    >
      <Card
        sx={{
          maxWidth: 440,
          width: '100%',
          background: '#171821',
          border: '1px solid rgba(255,255,255,0.03)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          borderRadius: '24px',
          position: 'relative',
          zIndex: 1,
          '&:hover': { transform: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Box mb={2}>
              <BrandLogo size={48} />
            </Box>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(90deg, #3B82F6 0%, #4EBE87 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
              }}
            >
              Criar Conta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cadastre-se para começar a controlar seus gastos
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nome Completo"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              margin="normal"
              required
              autoFocus
            />
            <TextField
              fullWidth
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Senha (mínimo 6 caracteres)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Confirmar Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, height: 50, borderRadius: '12px', fontSize: '0.95rem' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Criar Conta'}
            </Button>
          </form>

          <Box mt={2} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Já possui uma conta?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/login')}
                sx={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Faça Login
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
