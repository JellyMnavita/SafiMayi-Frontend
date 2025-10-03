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
  taux_postpay: string;
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
    taux_postpay: '',
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
        } else if (t.type_taux === 'postpay') {
          nouveauxParametres.taux_postpay = t.taux.toString();
        }
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
      if (parametres.taux_postpay) donneesTaux.taux_postpay = parseFloat(parametres.taux_postpay);

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
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
          Paramètres du Système
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Configurez les taux et limites du système de distribution d'eau
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Section Taux et Prix */}
        <Grid sx={{ width: { xs: '100%', lg: '66.666%' } }}>
          <Card sx={{ 
            p: 4, 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)'
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 4,
              pb: 2,
              borderBottom: '2px solid',
              borderColor: 'primary.100'
            }}>
              <Box sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: 'primary.50',
                mr: 2
              }}>
                <Iconify icon="solar:settings-bold-duotone" width={28} sx={{ color: 'primary.main' }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Configuration des Taux
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Modifiez les prix et commissions du système
                </Typography>
              </Box>
            </Box>

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
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.default'
                    }
                  }}
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
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.default'
                    }
                  }}
                />
              </Grid>

              <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                <TextField
                  fullWidth
                  label="Taux Postpay"
                  value={parametres.taux_postpay}
                  onChange={handleChange('taux_postpay')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  helperText="Taux pour les paiements différés"
                  type="number"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.default'
                    }
                  }}
                />
              </Grid>

              <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
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
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.default'
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ 
              mt: 4, 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              justifyContent: 'center',
              pt: 3,
              borderTop: '2px solid',
              borderColor: 'grey.100'
            }}>
              <Button
                variant="contained"
                size="large"
                onClick={sauvegarderParametres}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <Iconify icon="solar:check-circle-bold" />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {saving ? 'Sauvegarde en cours...' : 'Sauvegarder les paramètres'}
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={chargerParametres}
                startIcon={<Iconify icon="solar:restart-bold" />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600
                }}
              >
                Actualiser
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Section Taux Actuels */}
        <Grid sx={{ width: { xs: '100%', lg: '33.333%' } }}>
          <Card sx={{ 
            p: 3, 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            height: 'fit-content'
          }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Taux Actuels
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configuration en vigueur
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {taux.map((t, index) => (
                <Paper 
                  key={t.id} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    bgcolor: index === 0 ? 'primary.50' : 
                             index === 1 ? 'success.50' : 
                             'warning.50',
                    border: '1px solid',
                    borderColor: index === 0 ? 'primary.200' : 
                                 index === 1 ? 'success.200' : 
                                 'warning.200',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    {t.description}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      color: index === 0 ? 'primary.main' : 
                             index === 1 ? 'success.main' : 
                             'warning.main'
                    }}
                  >
                    {t.type_taux === 'litrage' ? `${t.taux} FC/L` : `${t.taux}%`}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* Section Aperçu des Changements */}
        <Grid sx={{ width: '100%' }}>
          <Card sx={{ 
            p: 4, 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)'
          }}>
            <Typography variant="h5" sx={{ fontWeight: 600, textAlign: 'center', mb: 1 }}>
              Aperçu des Paramètres
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
              Vue d'ensemble de la configuration système
            </Typography>
            
            <Grid container spacing={3}>
              <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                <Paper sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  bgcolor: 'primary.50',
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: 'primary.200'
                }}>
                  <Iconify icon="solar:cart-3-bold" width={40} sx={{ color: 'primary.main', mb: 2 }} />
                  <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                    {taux.find(t => t.type_taux === 'litrage')?.taux || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    FC par Litre
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                <Paper sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  bgcolor: 'success.50',
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: 'success.200'
                }}>
                  <Iconify icon="solar:shield-keyhole-bold-duotone" width={40} sx={{ color: 'success.main', mb: 2 }} />
                  <Typography variant="h3" color="success.main" sx={{ fontWeight: 700, mb: 1 }}>
                    {taux.find(t => t.type_taux === 'commission')?.taux || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Commission
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                <Paper sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  bgcolor: 'warning.50',
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: 'warning.200'
                }}>
                  <Iconify icon="solar:clock-circle-outline" width={40} sx={{ color: 'warning.main', mb: 2 }} />
                  <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700, mb: 1 }}>
                    {parametres.limite_recharge_jour}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Limite Recharge/J
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid sx={{ width: { xs: '100%', sm: '50%', md: '25%' } }}>
                <Paper sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  bgcolor: 'info.50',
                  borderRadius: 3,
                  border: '2px solid',
                  borderColor: 'info.200'
                }}>
                  <Iconify icon="solar:settings-bold-duotone" width={40} sx={{ color: 'info.main', mb: 2 }} />
                  <Typography variant="h3" color="info.main" sx={{ fontWeight: 700, mb: 1 }}>
                    {taux.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Paramètres Actifs
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={fermerSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={fermerSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: 2,
            fontWeight: 600
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}