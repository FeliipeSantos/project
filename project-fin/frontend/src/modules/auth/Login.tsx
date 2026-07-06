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

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password, mfaRequired ? otpToken : undefined);

      if (result.mfaRequired) {
        setMfaRequired(true);
        setLoading(false);
        return;
      }

      navigate('/');
    } catch (err: any) {
      if (err.response && err.response.data && (err.response.data.detail || err.response.data.message)) {
        setError(err.response.data.detail || err.response.data.message);
      } else {
        setError('Ocorreu um erro ao fazer login. Tente novamente.');
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
        // Decorative background blobs
        '&::before': {
          content: '""',
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          top: '-100px',
          left: '-100px',
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
          right: '-80px',
          pointerEvents: 'none',
        },
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          background: '#171821',
          border: '1px solid rgba(255,255,255,0.03)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          borderRadius: '24px',
          position: 'relative',
          zIndex: 1,
          // Override hover animation for auth cards
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
              FinControl
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie suas finanças com inteligência
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {!mfaRequired ? (
              <>
                <TextField
                  fullWidth
                  label="E-mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  autoFocus
                />
                <TextField
                  fullWidth
                  label="Senha"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                />
              </>
            ) : (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}>
                  Autenticação Multifator ativada. Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador.
                </Alert>
                <TextField
                  fullWidth
                  label="Código MFA (6 dígitos)"
                  type="text"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
                  required
                  autoFocus
                  placeholder="000000"
                />
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, height: 50, borderRadius: '12px', fontSize: '0.95rem' }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : mfaRequired ? (
                'Verificar Código'
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {!mfaRequired && (
            <Box mt={2} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Não tem uma conta?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/register')}
                  sx={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  Cadastre-se
                </Link>
              </Typography>
            </Box>
          )}
          {mfaRequired && (
            <Box mt={2} textAlign="center">
              <Link
                component="button"
                variant="body2"
                onClick={() => setMfaRequired(false)}
                sx={{ color: '#8E8EA0', textDecoration: 'none' }}
              >
                Voltar para credenciais
              </Link>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
