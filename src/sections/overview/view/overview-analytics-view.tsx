import { useEffect, useState } from 'react';
import apiClient from '../../../utils/api';
import Typography from '@mui/material/Typography';
import { DashboardContent } from '../../../layouts/dashboard';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { CircularProgress, Box, TextField, Button, Stack, Paper } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import '../../../index.css';
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import {fr} from 'date-fns/locale/fr';

interface StatsResponse {
  utilisateurs: { total: number; clients: number; admins: number };
  litrage: { total_recharges_litres: number; total_consomme_litres: number; total_disponible_litres: number };
  paiements: { montant_total: number; nombre_transactions: number };
  ventes: { nombre_total: number; montant_total: number; payees: number; acomptes: number };
  periode: { date_debut: string; date_fin: string };
}

interface GraphStatsResponse {
  graph_stats: { 
    date: string; 
    total_consommation_litres: number;
    total_recharge_litres: number;
  }[];
   year_range: string;
}

export function OverviewAnalyticsView() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [graphStats, setGraphStats] = useState<GraphStatsResponse | null>(null);
  const [yearRange, setYearRange] = useState<string>('');
  const [dateDebut, setDateDebut] = useState<Date | null>(null);
  const [dateFin, setDateFin] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  const isTablet = useMediaQuery('(max-width:1200px)');

  const fetchStats = async (dateDebutParam?: Date | null, dateFinParam?: Date | null) => {
    setLoading(true);
    try {
      const params: any = {};
      
      if (dateDebutParam) {
        params.date_debut = format(dateDebutParam, 'yyyy-MM-dd');
      }
      if (dateFinParam) {
        params.date_fin = format(dateFinParam, 'yyyy-MM-dd');
      }

      const res = await apiClient.get<StatsResponse>(
        '/api/users/stats/',
        { params }
      );
      setStats(res.data);
      console.log('Stats récupérées:', res.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGraphStats = async () => {
    try {
      const res = await apiClient.get<GraphStatsResponse>(
        '/api/compteur/global/last-date-stat/'
      );
      setYearRange(res.data.year_range || '');
      setGraphStats(res.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des graph_stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchGraphStats();
  }, []);

  const handleFiltrer = () => {
    fetchStats(dateDebut, dateFin);
  };

  const handleResetFiltre = () => {
    setDateDebut(null);
    setDateFin(null);
    fetchStats(null, null);
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

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hey, {username} bienvenue dans l'espace administrateur
      </Typography>

      {/* Filtre de période */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filtrer par période
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <DatePicker
              label="Date de début"
              value={dateDebut}
              onChange={setDateDebut}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="Date de fin"
              value={dateFin}
              onChange={setDateFin}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <Button 
              variant="contained" 
              onClick={handleFiltrer}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Filtrer'}
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleResetFiltre}
              disabled={loading}
            >
              Réinitialiser
            </Button>
          </Stack>
        </LocalizationProvider>
        
        {/* Affichage de la période active */}
        {stats?.periode?.date_debut && (
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Période affichée: du {stats.periode.date_debut} au {stats.periode.date_fin || 'aujourd\'hui'}
          </Typography>
        )}
      </Paper>

      {!stats ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ px: 2 }}>
          <Slider {...settings}>
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
                icon={<img alt="Water" src="/assets/icons/glass/ic-glass-message.svg" />}
              />
            </div>
            <div>
              <AnalyticsWidgetSummary
                title="Revenus Totaux"
                total={stats.paiements.montant_total}
                color="warning"
                suffix="FC"
                isCurrency={true}
                icon={<img alt="Revenue" src="/assets/icons/glass/ic-glass-buy.svg" />}
              />
            </div>
            <div> 
              <AnalyticsWidgetSummary
                title="Ventes Total"
                total={stats.ventes.montant_total}
                color="info"
                suffix="$"
                isCurrency={true}
                icon={<img alt="Sales" src="/assets/icons/glass/ic-glass-bag.svg" />}
              />
            </div>
          </Slider>

          <Grid style={{ marginTop: '25px' }} size={{ xs: 12, md: 6, lg: 8 }}>
            <AnalyticsWebsiteVisits
              title="Statistiques Globales de Consommation et de Recharge"
              subheader={`Dernières consommations et recharges ${yearRange}`}
              chart={chartData}
            />
          </Grid>
        </Box>
      )}
    </DashboardContent>
  );
}