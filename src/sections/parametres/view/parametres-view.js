import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/views/parametres-view.tsx
import { useState, useEffect } from 'react';
import { Box, Card, Typography, TextField, Button, Grid, Paper, Alert, Snackbar, InputAdornment, CircularProgress, } from '@mui/material';
import { DashboardContent } from '../../../layouts/dashboard';
import { Iconify } from '../../../components/iconify';
import apiClient from '../../../utils/api';
export function ParametresView() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [taux, setTaux] = useState([]);
    const [parametres, setParametres] = useState({
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
            tauxData.forEach((t) => {
                if (t.type_taux === 'litrage') {
                    nouveauxParametres.taux_litrage = t.taux.toString();
                }
                else if (t.type_taux === 'commission') {
                    nouveauxParametres.taux_commission = t.taux.toString();
                }
                // On ignore le taux postpay
            });
            setParametres(nouveauxParametres);
        }
        catch (error) {
            console.error('Erreur chargement paramètres:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des paramètres',
                severity: 'error'
            });
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        chargerParametres();
    }, []);
    const handleChange = (field) => (event) => {
        setParametres(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };
    const sauvegarderParametres = async () => {
        try {
            setSaving(true);
            const donneesTaux = {};
            if (parametres.taux_litrage)
                donneesTaux.taux_litrage = parseFloat(parametres.taux_litrage);
            if (parametres.taux_commission)
                donneesTaux.taux_commission = parseFloat(parametres.taux_commission);
            // On n'envoie pas le taux postpay
            await apiClient.put('/api/paiements/parametres/taux/', donneesTaux);
            setSnackbar({
                open: true,
                message: 'Paramètres sauvegardés avec succès',
                severity: 'success'
            });
            // Recharger les données
            chargerParametres();
        }
        catch (error) {
            console.error('Erreur sauvegarde paramètres:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.error || 'Erreur lors de la sauvegarde',
                severity: 'error'
            });
        }
        finally {
            setSaving(false);
        }
    };
    const fermerSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };
    if (loading) {
        return (_jsx(DashboardContent, { children: _jsx(Box, { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }, children: _jsx(CircularProgress, {}) }) }));
    }
    return (_jsxs(DashboardContent, { children: [_jsxs(Box, { sx: { mb: 4 }, children: [_jsx(Typography, { variant: "h4", gutterBottom: true, children: "Param\u00E8tres du Syst\u00E8me" }), _jsx(Typography, { variant: "body1", color: "text.secondary", children: "Configurez les taux et limites du syst\u00E8me" })] }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { sx: { width: '100%' }, children: _jsxs(Card, { sx: { p: 3 }, children: [_jsxs(Typography, { variant: "h6", gutterBottom: true, sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Iconify, { icon: "solar:settings-bold-duotone", width: 24 }), "Configuration des Taux"] }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: _jsx(TextField, { fullWidth: true, label: "Prix par Litre", value: parametres.taux_litrage, onChange: handleChange('taux_litrage'), InputProps: {
                                                    endAdornment: _jsx(InputAdornment, { position: "end", children: "FC/L" }),
                                                }, helperText: "Prix de vente d'un litre d'eau", type: "number" }) }), _jsx(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: _jsx(TextField, { fullWidth: true, label: "Taux de Commission", value: parametres.taux_commission, onChange: handleChange('taux_commission'), InputProps: {
                                                    endAdornment: _jsx(InputAdornment, { position: "end", children: "%" }),
                                                }, helperText: "Commission sur les ventes", type: "number" }) })] }), _jsxs(Box, { sx: { mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }, children: [_jsx(Button, { variant: "contained", onClick: sauvegarderParametres, disabled: saving, startIcon: saving ? _jsx(CircularProgress, { size: 20 }) : _jsx(Iconify, { icon: "solar:check-circle-bold" }), children: saving ? 'Sauvegarde...' : 'Sauvegarder' }), _jsx(Button, { variant: "outlined", onClick: chargerParametres, startIcon: _jsx(Iconify, { icon: "solar:restart-bold" }), children: "Actualiser" })] })] }) }), _jsx(Grid, { sx: { width: '100%' }, children: _jsxs(Card, { sx: { p: 3 }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Taux Actuels" }), _jsx(Grid, { container: true, spacing: 2, children: taux
                                        .filter(t => t.type_taux !== 'postpay') // Filtrer pour ne pas afficher le postpay
                                        .map((t) => (_jsx(Grid, { sx: { width: { xs: '100%', sm: '50%', md: '33.333%' } }, children: _jsxs(Paper, { sx: { p: 2, textAlign: 'center' }, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: t.description }), _jsx(Typography, { variant: "h6", color: "primary.main", sx: { fontWeight: 600 }, children: t.type_taux === 'litrage' ? `${t.taux} FC/L` : `${t.taux}%` })] }) }, t.id))) })] }) })] }), _jsx(Snackbar, { open: snackbar.open, autoHideDuration: 6000, onClose: fermerSnackbar, anchorOrigin: { vertical: 'bottom', horizontal: 'right' }, children: _jsx(Alert, { onClose: fermerSnackbar, severity: snackbar.severity, children: snackbar.message }) })] }));
}
