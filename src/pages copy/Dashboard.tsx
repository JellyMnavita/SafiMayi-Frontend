import { Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>Bienvenue sur le dashboard</Typography>
      <Button variant="outlined" color="error" onClick={logout}>
        Se déconnecter
      </Button>
    </Container>
  );
};

export default Dashboard;
