import { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logoblanc.png';

const Login = () => {
  const [telephone, setTelephone] = useState('');
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
        telephone,
        password,
      });
      
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Numéro ou mot de passe incorrect');
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
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
         <img src={logo} alt="SafiMayi Logo" width={200} />

      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, backgroundColor: '#fff', borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom align="center">
            Connexion
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Téléphone"
              variant="outlined"
              fullWidth
              margin="normal"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
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
            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              sx={{ mt: 2 ,backgroundColor: '#0486d9', '&:hover': { backgroundColor: '#004574ff' }}}
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
