import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import axios from 'axios';
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
    const isMobile = useMediaQuery('(max-width:768px)');
    const isTablet = useMediaQuery('(max-width:1200px)');
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('https://safimayi-backend.onrender.com/api/users/stats/', { headers: { Authorization: `Bearer ${token}` } });
                setStats(res.data);
            }
            catch (error) {
                console.error('Erreur lors de la récupération des stats:', error);
            }
        };
        const fetchGraphStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('https://safimayi-backend.onrender.com/api/compteur/global/last-date-stat/', { headers: { Authorization: `Bearer ${token}` } });
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
        slidesToShow: isMobile ? 1 : isTablet ? 2 : 3,
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
                    data: graphStats.graph_stats.map((item) => item.total_litres),
                },
            ],
        }
        : { categories: [], series: [] };
    return (_jsxs(DashboardContent, { maxWidth: "xl", children: [_jsxs(Typography, { variant: "h4", sx: { mb: { xs: 3, md: 5 } }, children: ["Hey, ", username, " bienvenue dans l'espace administrateur"] }), !stats ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }, children: _jsx(CircularProgress, {}) })) : (_jsxs(Box, { sx: { px: 2 }, children: [_jsxs(Slider, { ...settings, children: [_jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Total Cartes RFID", total: stats.rfid.total, icon: _jsx("img", { alt: "RFID", src: "/assets/icons/glass/ic-glass-bag.svg" }) }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Total Utilisateurs", total: stats.utilisateurs.total, color: "secondary", icon: _jsx("img", { alt: "Users", src: "/assets/icons/glass/ic-glass-users.svg" }) }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Montant Paiements", total: stats.paiements.montant_total, color: "warning", icon: _jsx("img", { alt: "Paiements", src: "/assets/icons/glass/ic-glass-buy.svg" }) }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Codes d'acc\u00E8s g\u00E9n\u00E9r\u00E9s", total: stats.access_codes.total, color: "error", icon: _jsx("img", { alt: "Access Codes", src: "/assets/icons/glass/ic-glass-message.svg" }) }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Compteurs actifs", total: stats.compteurs.actifs, color: "info", icon: _jsx("img", { alt: "Compteurs", src: "/assets/icons/glass/ic-glass-buy.svg" }) }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Litres consomm\u00E9s", total: stats.litrage.total_consomme_litres, color: "success", icon: _jsx("img", { alt: "Consommation", src: "/assets/icons/glass/ic-glass-users.svg" }) }) })] }), _jsx(Grid, { size: { xs: 12, md: 6, lg: 8 }, children: _jsx(AnalyticsWebsiteVisits, { title: "Statistiques Globales de Consommation", subheader: "Derni\u00E8res consommations", chart: chartData }) })] }))] }));
}
