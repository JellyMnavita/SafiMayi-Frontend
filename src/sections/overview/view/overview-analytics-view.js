import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import apiClient from '../../../utils/api';
import Typography from '@mui/material/Typography';
import { DashboardContent } from '../../../layouts/dashboard';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { CircularProgress, Box, Button, Stack, Chip, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import '../../../index.css';
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
export function OverviewAnalyticsView() {
    const [stats, setStats] = useState(null);
    const [graphStats, setGraphStats] = useState(null);
    const [yearRange, setYearRange] = useState('');
    const [dateDebut, setDateDebut] = useState(null);
    const [dateFin, setDateFin] = useState(null);
    const [dateDebutGraph, setDateDebutGraph] = useState(null);
    const [dateFinGraph, setDateFinGraph] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingGraph, setLoadingGraph] = useState(false);
    const [showDatePickers, setShowDatePickers] = useState(false);
    const [showDatePickersGraph, setShowDatePickersGraph] = useState(false);
    const [periodMenuAnchor, setPeriodMenuAnchor] = useState(null);
    const [periodMenuAnchorGraph, setPeriodMenuAnchorGraph] = useState(null);
    const isMobile = useMediaQuery('(max-width:768px)');
    const isTablet = useMediaQuery('(max-width:1200px)');
    const fetchStats = async (dateDebutParam, dateFinParam) => {
        setLoading(true);
        try {
            const params = {};
            if (dateDebutParam) {
                params.date_debut = format(dateDebutParam, 'yyyy-MM-dd');
            }
            if (dateFinParam) {
                params.date_fin = format(dateFinParam, 'yyyy-MM-dd');
            }
            const res = await apiClient.get('/api/users/stats/', { params });
            setStats(res.data);
        }
        catch (error) {
            console.error('Erreur lors de la récupération des stats:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchGraphStats = async (dateDebutParam, dateFinParam) => {
        setLoadingGraph(true);
        try {
            const params = {};
            if (dateDebutParam) {
                params.date_debut = format(dateDebutParam, 'yyyy-MM-dd');
            }
            if (dateFinParam) {
                params.date_fin = format(dateFinParam, 'yyyy-MM-dd');
            }
            const res = await apiClient.get('/api/compteur/global/last-date-stat/', { params });
            setGraphStats(res.data);
            setYearRange(res.data.year_range || '');
        }
        catch (error) {
            console.error('Erreur lors de la récupération des graph_stats:', error);
        }
        finally {
            setLoadingGraph(false);
        }
    };
    useEffect(() => {
        fetchStats();
        fetchGraphStats();
    }, []);
    const handleFiltrer = () => {
        fetchStats(dateDebut, dateFin);
        setShowDatePickers(false);
    };
    const handleFiltrerGraph = () => {
        fetchGraphStats(dateDebutGraph, dateFinGraph);
        setShowDatePickersGraph(false);
    };
    const handleResetFiltre = () => {
        setDateDebut(null);
        setDateFin(null);
        setPeriodMenuAnchor(null);
        setShowDatePickers(false);
        fetchStats(null, null);
    };
    const handleResetFiltreGraph = () => {
        setDateDebutGraph(null);
        setDateFinGraph(null);
        setPeriodMenuAnchorGraph(null);
        setShowDatePickersGraph(false);
        fetchGraphStats(null, null);
    };
    // Réinitialiser tous les filtres
    const handleResetAllFilters = () => {
        handleResetFiltre();
        handleResetFiltreGraph();
    };
    // Périodes prédéfinies pour les stats générales
    const applyPredefinedPeriod = (period) => {
        const today = new Date();
        let startDate;
        let endDate = today;
        switch (period) {
            case 'today':
                startDate = today;
                break;
            case 'yesterday':
                startDate = subDays(today, 1);
                endDate = subDays(today, 1);
                break;
            case 'last7days':
                startDate = subDays(today, 7);
                break;
            case 'last30days':
                startDate = subDays(today, 30);
                break;
            case 'thisWeek':
                startDate = startOfWeek(today, { weekStartsOn: 1 });
                endDate = endOfWeek(today, { weekStartsOn: 1 });
                break;
            case 'thisMonth':
                startDate = startOfMonth(today);
                endDate = endOfMonth(today);
                break;
            case 'thisYear':
                startDate = startOfYear(today);
                endDate = endOfYear(today);
                break;
            default:
                startDate = today;
        }
        setDateDebut(startDate);
        setDateFin(endDate);
        fetchStats(startDate, endDate);
        setPeriodMenuAnchor(null);
    };
    // Périodes prédéfinies pour le graph
    const applyPredefinedPeriodGraph = (period) => {
        const today = new Date();
        let startDate;
        let endDate = today;
        switch (period) {
            case 'today':
                startDate = today;
                break;
            case 'yesterday':
                startDate = subDays(today, 1);
                endDate = subDays(today, 1);
                break;
            case 'last7days':
                startDate = subDays(today, 7);
                break;
            case 'last30days':
                startDate = subDays(today, 30);
                break;
            case 'thisWeek':
                startDate = startOfWeek(today, { weekStartsOn: 1 });
                endDate = endOfWeek(today, { weekStartsOn: 1 });
                break;
            case 'thisMonth':
                startDate = startOfMonth(today);
                endDate = endOfMonth(today);
                break;
            case 'thisYear':
                startDate = startOfYear(today);
                endDate = endOfYear(today);
                break;
            default:
                startDate = today;
        }
        setDateDebutGraph(startDate);
        setDateFinGraph(endDate);
        fetchGraphStats(startDate, endDate);
        setPeriodMenuAnchorGraph(null);
    };
    const getPeriodLabel = () => {
        if (!dateDebut)
            return 'Toute période';
        const start = format(dateDebut, 'dd/MM/yyyy');
        const end = dateFin ? format(dateFin, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');
        if (start === end)
            return `Le ${start}`;
        return `Du ${start} au ${end}`;
    };
    const getPeriodLabelGraph = () => {
        if (!dateDebutGraph)
            return 'Toute période';
        const start = format(dateDebutGraph, 'dd/MM/yyyy');
        const end = dateFinGraph ? format(dateFinGraph, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');
        if (start === end)
            return `Le ${start}`;
        return `Du ${start} au ${end}`;
    };
    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: isMobile ? 1 : isTablet ? 2 : 4,
        slidesToScroll: 1,
        arrows: true,
        responsive: [
            {
                breakpoint: 1200,
                settings: { slidesToShow: 2 },
            },
            {
                breakpoint: 768,
                settings: { slidesToShow: 1 },
            },
        ],
    };
    const username = JSON.parse(localStorage.getItem('user') || '{}').nom;
    // Vérifier si au moins un filtre est actif
    const hasActiveFilters = dateDebut || dateDebutGraph;
    // Transformation des graph_stats pour le chart
    const chartData = graphStats
        ? {
            categories: graphStats.graph_stats.map((item) => item.date),
            series: [
                {
                    name: 'Consommation (L)',
                    data: graphStats.graph_stats.map((item) => item.total_consommation_litres),
                },
                {
                    name: 'Recharge (L)',
                    data: graphStats.graph_stats.map((item) => item.total_recharge_litres),
                },
            ],
        }
        : { categories: [], series: [] };
    return (_jsxs(DashboardContent, { maxWidth: "xl", children: [_jsxs(Box, { sx: {
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    mb: 3,
                    gap: 2
                }, children: [_jsxs(Box, { children: [_jsxs(Typography, { variant: "h4", sx: { fontSize: { xs: '1.5rem', sm: '2rem' } }, children: ["Hey, ", username] }), _jsx(Typography, { variant: "body1", color: "text.secondary", sx: { mt: 0.5 }, children: "Bienvenue dans l'espace d'administration" })] }), _jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(Chip, { label: getPeriodLabel(), onClick: () => setShowDatePickers(!showDatePickers), onDelete: dateDebut ? handleResetFiltre : undefined, deleteIcon: _jsx(FilterListIcon, {}), variant: "outlined", color: dateDebut ? "primary" : "default", size: isMobile ? "small" : "medium" }), _jsx(Tooltip, { title: "P\u00E9riodes rapides", children: _jsx(IconButton, { size: "small", onClick: (e) => setPeriodMenuAnchor(e.currentTarget), children: _jsx(CalendarTodayIcon, {}) }) }), hasActiveFilters && (_jsx(Tooltip, { title: "R\u00E9initialiser tous les filtres", children: _jsx(IconButton, { size: "small", onClick: handleResetAllFilters, color: "error", children: _jsx(RestartAltIcon, {}) }) }))] })] }), showDatePickers && (_jsx(Box, { sx: {
                    mb: 3,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    backgroundColor: 'background.default'
                }, children: _jsx(LocalizationProvider, { dateAdapter: AdapterDateFns, adapterLocale: fr, children: _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 2, alignItems: { xs: 'stretch', sm: 'center' }, children: [_jsx(DatePicker, { label: "Date de d\u00E9but", value: dateDebut, onChange: setDateDebut, slotProps: {
                                    textField: {
                                        size: 'small',
                                        fullWidth: true
                                    }
                                } }), _jsx(DatePicker, { label: "Date de fin", value: dateFin, onChange: setDateFin, slotProps: {
                                    textField: {
                                        size: 'small',
                                        fullWidth: true
                                    }
                                } }), _jsx(Button, { variant: "contained", onClick: handleFiltrer, disabled: loading || !dateDebut, size: "small", sx: { minWidth: 100 }, children: loading ? _jsx(CircularProgress, { size: 20 }) : 'Appliquer' }), _jsx(Button, { variant: "outlined", onClick: () => setShowDatePickers(false), size: "small", children: "Annuler" })] }) }) })), _jsxs(Menu, { anchorEl: periodMenuAnchor, open: Boolean(periodMenuAnchor), onClose: () => setPeriodMenuAnchor(null), children: [_jsx(MenuItem, { onClick: () => applyPredefinedPeriod('today'), children: "Aujourd'hui" }), _jsx(MenuItem, { onClick: () => applyPredefinedPeriod('yesterday'), children: "Hier" }), _jsx(MenuItem, { onClick: () => applyPredefinedPeriod('last7days'), children: "7 derniers jours" }), _jsx(MenuItem, { onClick: () => applyPredefinedPeriod('last30days'), children: "30 derniers jours" }), _jsx(MenuItem, { onClick: () => applyPredefinedPeriod('thisWeek'), children: "Cette semaine" }), _jsx(MenuItem, { onClick: () => applyPredefinedPeriod('thisMonth'), children: "Ce mois" }), _jsx(MenuItem, { onClick: () => applyPredefinedPeriod('thisYear'), children: "Cette ann\u00E9e" })] }), !stats ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }, children: _jsx(CircularProgress, {}) })) : (_jsxs(Box, { sx: { px: { xs: 0, sm: 2 } }, children: [_jsxs(Slider, { ...settings, children: [_jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Total Utilisateurs", total: stats.utilisateurs.total, color: "primary", icon: _jsx("img", { alt: "Users", src: "/assets/icons/glass/ic-glass-users.svg" }) }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Litres Disponibles", total: stats.litrage.total_disponible_litres, color: "success", suffix: " L", icon: _jsx("img", { alt: "Water", src: "/assets/icons/glass/ic-glass-message.svg" }) }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Revenus Totaux", total: stats.paiements.montant_total, color: "warning", suffix: "FC", isCurrency: true, icon: _jsx("img", { alt: "Revenue", src: "/assets/icons/glass/ic-glass-buy.svg" }) }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Ventes Total", total: stats.ventes.montant_total, color: "info", suffix: "$", isCurrency: true, icon: _jsx("img", { alt: "Sales", src: "/assets/icons/glass/ic-glass-bag.svg" }) }) })] }), _jsxs(Grid, { style: { marginTop: '25px' }, size: { xs: 12, md: 6, lg: 8 }, children: [_jsxs(Box, { sx: {
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    justifyContent: 'space-between',
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    mb: 2,
                                    gap: 1
                                }, children: [_jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [_jsx(Typography, { variant: "h6", sx: {
                                                    fontSize: { xs: '1rem', sm: '1.25rem' },
                                                    lineHeight: 1.3
                                                }, children: "Statistiques Consommation & Recharge" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 0.5 }, children: graphStats?.periode?.date_debut
                                                    ? `Période: du ${graphStats.periode.date_debut} au ${graphStats.periode.date_fin || 'aujourd\'hui'}`
                                                    : `Dernières données ${yearRange}` })] }), _jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(Chip, { label: getPeriodLabelGraph(), onClick: () => setShowDatePickersGraph(!showDatePickersGraph), onDelete: dateDebutGraph ? handleResetFiltreGraph : undefined, deleteIcon: _jsx(FilterListIcon, {}), variant: "outlined", color: dateDebutGraph ? "primary" : "default", size: "small", sx: {
                                                    maxWidth: { xs: 120, sm: 'none' },
                                                    '& .MuiChip-label': {
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }
                                                } }), _jsx(Tooltip, { title: "P\u00E9riodes rapides", children: _jsx(IconButton, { size: "small", onClick: (e) => setPeriodMenuAnchorGraph(e.currentTarget), children: _jsx(CalendarTodayIcon, { fontSize: "small" }) }) })] })] }), showDatePickersGraph && (_jsx(Box, { sx: {
                                    mb: 2,
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    backgroundColor: 'background.default'
                                }, children: _jsx(LocalizationProvider, { dateAdapter: AdapterDateFns, adapterLocale: fr, children: _jsxs(Stack, { direction: { xs: 'column', sm: 'row' }, spacing: 2, alignItems: { xs: 'stretch', sm: 'center' }, children: [_jsx(DatePicker, { label: "Date de d\u00E9but", value: dateDebutGraph, onChange: setDateDebutGraph, slotProps: {
                                                    textField: {
                                                        size: 'small',
                                                        fullWidth: true
                                                    }
                                                } }), _jsx(DatePicker, { label: "Date de fin", value: dateFinGraph, onChange: setDateFinGraph, slotProps: {
                                                    textField: {
                                                        size: 'small',
                                                        fullWidth: true
                                                    }
                                                } }), _jsx(Button, { variant: "contained", onClick: handleFiltrerGraph, disabled: loadingGraph || !dateDebutGraph, size: "small", sx: { minWidth: 100 }, children: loadingGraph ? _jsx(CircularProgress, { size: 20 }) : 'Appliquer' }), _jsx(Button, { variant: "outlined", onClick: () => setShowDatePickersGraph(false), size: "small", children: "Annuler" })] }) }) })), _jsxs(Menu, { anchorEl: periodMenuAnchorGraph, open: Boolean(periodMenuAnchorGraph), onClose: () => setPeriodMenuAnchorGraph(null), children: [_jsx(MenuItem, { onClick: () => applyPredefinedPeriodGraph('today'), children: "Aujourd'hui" }), _jsx(MenuItem, { onClick: () => applyPredefinedPeriodGraph('yesterday'), children: "Hier" }), _jsx(MenuItem, { onClick: () => applyPredefinedPeriodGraph('last7days'), children: "7 derniers jours" }), _jsx(MenuItem, { onClick: () => applyPredefinedPeriodGraph('last30days'), children: "30 derniers jours" }), _jsx(MenuItem, { onClick: () => applyPredefinedPeriodGraph('thisWeek'), children: "Cette semaine" }), _jsx(MenuItem, { onClick: () => applyPredefinedPeriodGraph('thisMonth'), children: "Ce mois" }), _jsx(MenuItem, { onClick: () => applyPredefinedPeriodGraph('thisYear'), children: "Cette ann\u00E9e" })] }), _jsx(AnalyticsWebsiteVisits, { title: "", subheader: "", chart: chartData })] })] }))] }));
}
