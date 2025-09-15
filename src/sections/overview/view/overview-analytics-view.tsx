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

interface StatsResponse {
  utilisateurs: { total: number; clients: number; admins: number };
  litrage: { total_recharges_litres: number; total_consomme_litres: number; total_disponible_litres: number };
  paiements: { montant_total: number; nombre_transactions: number };
  ventes: { nombre_total: number; montant_total: number; payees: number; acomptes: number };
}

interface GraphStatsResponse {
  graph_stats: { date: string; total_litres: number }[];
}

export function OverviewAnalyticsView() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [graphStats, setGraphStats] = useState<GraphStatsResponse | null>(null);

  const isMobile = useMediaQuery('(max-width:768px)');
  const isTablet = useMediaQuery('(max-width:1200px)');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get<StatsResponse>(
          'https://safimayi-backend.onrender.com/api/users/stats/',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(res.data);
        console.log('Stats récupérées:', res.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des stats:', error);
      }
    };

    const fetchGraphStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get<GraphStatsResponse>(
          'https://safimayi-backend.onrender.com/api/compteur/global/last-date-stat/',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGraphStats(res.data);
      } catch (error) {
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
            data: graphStats.graph_stats.map((item) => item.total_litres),
          },
        ],
      }
    : { categories: [], series: [] };

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hey, {username} bienvenue dans l'espace administrateur
      </Typography>

      {!stats ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ px: 2 }}>
          <Slider {...settings}>
            {/* 4 cartes les plus pertinentes */}
            <div>
              <AnalyticsWidgetSummary
                title="Total Utilisateurs"
                total={stats.utilisateurs.total}
                color="primary"
                icon={<img alt="Users" src="/assets/icons/glass/ic-glass-users.svg" />}
              />
            </div>
            <div>
              <AnalyticsWidgetSummary
                title="Litres Disponibles"
                total={stats.litrage.total_disponible_litres}
                color="success"
                suffix=" L"
                icon={<img alt="Water" src="/assets/icons/glass/ic-glass-water.svg" />}
              />
            </div>
            <div>
              <AnalyticsWidgetSummary
                title="Revenus Totaux"
                total={stats.paiements.montant_total}
                color="warning"
                prefix="$"
                isCurrency={true}
                icon={<img alt="Revenue" src="/assets/icons/glass/ic-glass-buy.svg" />}
              />
            </div>
            <div>
              <AnalyticsWidgetSummary
                title="Ventes Total"
                total={stats.ventes.montant_total}
                color="info"
                prefix="$"
                isCurrency={true}
                icon={<img alt="Sales" src="/assets/icons/glass/ic-glass-bag.svg" />}
              />
            </div>
          </Slider>

          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid size={{ xs: 12, md: 6, lg: 8 }}>
              <AnalyticsWebsiteVisits
                title="Statistiques Globales de Consommation"
                subheader="Dernières consommations"
                chart={chartData}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </DashboardContent>
  );
}