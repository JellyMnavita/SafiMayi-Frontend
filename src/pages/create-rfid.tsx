import { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';
import logo from '../assets/logoblanc.png';

const CreateRFIDCard = () => {
  const [codeUid, setCodeUid] = useState('');
  const [telephone, setTelephone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://safimayi-backend.onrender.com/api/rfid/create/',
        {
          code_uid: codeUid,
          telephone: telephone
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSuccess('Carte RFID créée avec succès!');
      setCodeUid('');
      setTelephone('');
    } catch (err) {
      setError('Erreur lors de la création de la carte RFID');
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
        paddingTop: 4,
      }}
    >
      <img src={logo} alt="SafiMayi Logo" width={250} />
      
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, backgroundColor: '#fff', borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom align="center">
            Créer une carte RFID
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Code UID de la carte"
              variant="outlined"
              fullWidth
              margin="normal"
              value={codeUid}
              onChange={(e) => setCodeUid(e.target.value)}
              disabled={loading}
              required
            />
            <TextField
              label="Téléphone"
              variant="outlined"
              fullWidth
              margin="normal"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              disabled={loading}
              required
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              type="submit"
              sx={{ 
                mt: 2,
                backgroundColor: '#0486d9', 
                '&:hover': { backgroundColor: '#004574ff' },
                height: '50px' 
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Créer la carte'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreateRFIDCard;