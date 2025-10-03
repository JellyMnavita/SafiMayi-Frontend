// src/views/parametres-view.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  Snackbar,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { DashboardContent } from '../../../layouts/dashboard';
import { Iconify } from '../../../components/iconify';
import apiClient from '../../../utils/api';

interface Taux {
  id: number;
  type_taux: string;
  taux: number;
  description: string;
}

interface ParametresState {
  taux_litrage: string;
  taux_commission: string;
  limite_recharge_jour: string;
}

export function ParametresView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [taux, setTaux] = useState<Taux[]>([]);
  const [parametres, setParametres] = useState<ParametresState>({
    taux_litrage: '',
    taux_commission: '',
    limite_recharge_jour: '1000',
  });

  // Charger les paramètres
  const chargerParametres = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/paiements/parametres/taux/');
      const tauxData = response.data.taux;
      
      setTaux(tauxData);
      
      // Mettre à jour le state avec les valeurs actuelles
      const nouveauxParametres = { ...parametres };
      tauxData.forEach((t: Taux) => {
        if (t.type_taux === 'litrage') {
          nouveauxParametres.taux_litrage = t.taux.toString();
        } else if (t.type_taux === 'commission') {
          nouveauxParametres.taux_commission = t.taux.toString();
        }
        // On ignore le taux postpay
      });
      
      setParametres(nouveauxParametres);
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors du chargement des paramètres',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerParametres();
  }, []);

  const handleChange = (field: keyof ParametresState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setParametres(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const sauvegarderParametres = async () => {
    try {
      setSaving(true);
      
      const donneesTaux: any = {};
      if (parametres.taux_litrage) donneesTaux.taux_litrage = parseFloat(parametres.taux_litrage);
      if (parametres.taux_commission) donneesTaux.taux_commission = parseFloat(parametres.taux_commission);
      // On n'envoie pas le taux postpay

      await apiClient.put('/api/paiements/parametres/taux/', donneesTaux);
      
      setSnackbar({
        open: true,
        message: 'Paramètres sauvegardés avec succès',
        severity: 'success'
      });
      
      // Recharger les données
      chargerParametres();
    } catch (error: any) {
      console.error('Erreur sauvegarde paramètres:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Erreur lors de la sauvegarde',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const fermerSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Paramètres du Système
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configurez les taux et limites du système
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Section Configuration des Taux - Pleine largeur */}
        <Grid sx={{ width: '100%' }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:settings-bold-duotone" width={24} />
              Configuration des Taux
            </Typography>

            <Grid container spacing={3}>
              <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                <TextField
                  fullWidth
                  label="Prix par Litre"
                  value={parametres.taux_litrage}
                  onChange={handleChange('taux_litrage')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">FC/L</InputAdornment>,
                  }}
                  helperText="Prix de vente d'un litre d'eau"
                  type="number"
                />
              </Grid>

              <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                <TextField
                  fullWidth
                  label="Taux de Commission"
                  value={parametres.taux_commission}
                  onChange={handleChange('taux_commission')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  helperText="Commission sur les ventes"
                  type="number"
                />
              </Grid>

              {/* <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                <TextField
                  fullWidth
                  label="Limite Recharge Journalière"
                  value={parametres.limite_recharge_jour}
                  onChange={handleChange('limite_recharge_jour')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">L/jour</InputAdornment>,
                  }}
                  helperText="Limite maximale de recharge par utilisateur"
                  type="number"
                />
              </Grid> */}
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={sauvegarderParametres}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <Iconify icon="solar:check-circle-bold" />}
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={chargerParametres}
                startIcon={<Iconify icon="solar:restart-bold" />}
              >
                Actualiser
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Section Taux Actuels - Pleine largeur */}
        <Grid sx={{ width: '100%' }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Taux Actuels
            </Typography>
            
            <Grid container spacing={2}>
              {taux
                .filter(t => t.type_taux !== 'postpay') // Filtrer pour ne pas afficher le postpay
                .map((t) => (
                <Grid key={t.id} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%' } }}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {t.description}
                    </Typography>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                      {t.type_taux === 'litrage' ? `${t.taux} FC/L` : `${t.taux}%`}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={fermerSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={fermerSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}