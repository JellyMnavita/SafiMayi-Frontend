import { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert, Paper, CircularProgress, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logoblanc.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('https://safimayi-backend.onrender.com/api/users/login/', {
        email,
        password,
      });
      console.log(response);
      if (response.data.user.role !== 'agent' && response.data.user.role !== 'admin') {
        navigate('/404');
      } else {
        localStorage.setItem('token', response.data.token.access);
        navigate('/dashboard');
      }

    } catch (err) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #002445, #002445)',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <img src={logo} alt="SafiMayi Logo" width={250} />

      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, backgroundColor: '#fff', borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom align="center">
            Connexion
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              label="Mot de passe"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Box sx={{ textAlign: 'right', mb: 2 }}>
              <Link href="#" variant="body2" sx={{ color: '#0486d9' }}>
                Mot de passe oublié ?
              </Link>
            </Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              sx={{ mt: 2, backgroundColor: '#0486d9', '&:hover': { backgroundColor: '#004574ff' }, height: '50px' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;