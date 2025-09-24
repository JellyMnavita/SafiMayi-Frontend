import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import apiClient from '../../../utils/api';
import Typography from '@mui/material/Typography';
import { DashboardContent } from '../../../layouts/dashboard';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { CircularProgress, Box } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import '../../../index.css';
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';
export function OverviewAnalyticsView() {
    const [stats, setStats] = useState(null);
    const [graphStats, setGraphStats] = useState(null);
    const [yearRange, setYearRange] = useState('');
    const isMobile = useMediaQuery('(max-width:768px)');
    const isTablet = useMediaQuery('(max-width:1200px)');
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiClient.get('/api/users/stats/');
                setStats(res.data);
                console.log('Stats récupérées:', res.data);
            }
            catch (error) {
                console.error('Erreur lors de la récupération des stats:', error);
            }
        };
        const fetchGraphStats = async () => {
            try {
                const res = await apiClient.get('/api/compteur/global/last-date-stat/');
                setYearRange(res.data.year_range || '');
                setGraphStats(res.data);
            }
            catch (error) {
                console.error('Erreur lors de la récupération des graph_stats:', error);
            }
        };
        fetchStats();
        fetchGraphStats();
    }, []);
    const settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: isMobile ? 1 : isTablet ? 2 : 4, // Ajusté pour afficher 4 cartes
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
    return (_jsxs(DashboardContent, { maxWidth: "xl", children: [_jsxs(Typography, { variant: "h4", sx: { mb: { xs: 3, md: 5 } }, children: ["Hey, ", username, " bienvenue dans l'espace administrateur"] }), !stats ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }, children: _jsx(CircularProgress, {}) })) : (_jsxs(Box, { sx: { px: 2 }, children: [_jsxs(Slider, { ...settings, children: [_jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Total Utilisateurs", total: stats.utilisateurs.total, color: "primary", icon: _jsx("img", { alt: "Users", src: "/assets/icons/glass/ic-glass-users.svg" }) }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Litres Disponibles", total: stats.litrage.total_disponible_litres, color: "success", suffix: " L", icon: _jsx("img", { alt: "Water", src: "/assets/icons/glass/ic-glass-message.svg" }) }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Revenus Totaux", total: stats.paiements.montant_total, color: "warning", suffix: "FC", isCurrency: true, icon: _jsx("img", { alt: "Revenue", src: "/assets/icons/glass/ic-glass-buy.svg" }) }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Ventes Total", total: stats.ventes.montant_total, color: "info", suffix: "$", isCurrency: true, icon: _jsx("img", { alt: "Sales", src: "/assets/icons/glass/ic-glass-bag.svg" }) }) })] }), _jsx(Grid, { style: { marginTop: '25px' }, size: { xs: 12, md: 6, lg: 8 }, children: _jsx(AnalyticsWebsiteVisits, { title: "Statistiques Globales de Consommation et de Recharge", subheader: `Dernières consommations et recharges ${yearRange}`, chart: chartData }) })] }))] }));
}
