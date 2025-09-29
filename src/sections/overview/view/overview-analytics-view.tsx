import { useEffect, useState } from 'react';
import apiClient from '../../../utils/api';
import Typography from '@mui/material/Typography';
import { DashboardContent } from '../../../layouts/dashboard';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { 
  CircularProgress, 
  Box, 
  Button, 
  Stack, 
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
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
  periode: { date_debut: string; date_fin: string };
}

export function OverviewAnalyticsView() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [graphStats, setGraphStats] = useState<GraphStatsResponse | null>(null);
  const [yearRange, setYearRange] = useState<string>('');
  const [dateDebut, setDateDebut] = useState<Date | null>(null);
  const [dateFin, setDateFin] = useState<Date | null>(null);
  const [dateDebutGraph, setDateDebutGraph] = useState<Date | null>(null);
  const [dateFinGraph, setDateFinGraph] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [showDatePickers, setShowDatePickers] = useState(false);
  const [showDatePickersGraph, setShowDatePickersGraph] = useState(false);
  const [periodMenuAnchor, setPeriodMenuAnchor] = useState<null | HTMLElement>(null);
  const [periodMenuAnchorGraph, setPeriodMenuAnchorGraph] = useState<null | HTMLElement>(null);
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

  const fetchGraphStats = async (dateDebutParam?: Date | null, dateFinParam?: Date | null) => {
    setLoadingGraph(true);
    try {
      const params: any = {};
      
      if (dateDebutParam) {
        params.date_debut = format(dateDebutParam, 'yyyy-MM-dd');
      }
      if (dateFinParam) {
        params.date_fin = format(dateFinParam, 'yyyy-MM-dd');
      }

      const res = await apiClient.get<GraphStatsResponse>(
        '/api/compteur/global/last-date-stat/',
        { params }
      );
      setGraphStats(res.data);
      setYearRange(res.data.year_range || '');
    } catch (error) {
      console.error('Erreur lors de la récupération des graph_stats:', error);
    } finally {
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

  // Périodes prédéfinies pour les stats générales
  const applyPredefinedPeriod = (period: string) => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;

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
  const applyPredefinedPeriodGraph = (period: string) => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;

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
    if (!dateDebut) return 'Toute période';
    
    const start = format(dateDebut, 'dd/MM/yyyy');
    const end = dateFin ? format(dateFin, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');
    
    if (start === end) return `Le ${start}`;
    return `Du ${start} au ${end}`;
  };

  const getPeriodLabelGraph = () => {
    if (!dateDebutGraph) return 'Toute période';
    
    const start = format(dateDebutGraph, 'dd/MM/yyyy');
    const end = dateFinGraph ? format(dateFinGraph, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');
    
    if (start === end) return `Le ${start}`;
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
      {/* En-tête avec filtre compact */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        gap: 2
      }}>
        <Typography variant="h4">
          Hey, {username} bienvenue dans l'espace d'administration
        </Typography>
        
        {/* Filtre compact pour les stats générales */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={getPeriodLabel()}
            onClick={() => setShowDatePickers(!showDatePickers)}
            onDelete={dateDebut ? handleResetFiltre : undefined}
            deleteIcon={<FilterListIcon />}
            variant="outlined"
            color={dateDebut ? "primary" : "default"}
          />
          
          <Tooltip title="Périodes rapides">
            <IconButton
              size="small"
              onClick={(e) => setPeriodMenuAnchor(e.currentTarget)}
            >
              <CalendarTodayIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Date pickers pour les stats générales */}
      {showDatePickers && (
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          backgroundColor: 'background.default'
        }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <DatePicker
                label="Date de début"
                value={dateDebut}
                onChange={setDateDebut}
                slotProps={{ 
                  textField: { 
                    size: 'small',
                    fullWidth: true 
                  } 
                }}
              />
              <DatePicker
                label="Date de fin"
                value={dateFin}
                onChange={setDateFin}
                slotProps={{ 
                  textField: { 
                    size: 'small',
                    fullWidth: true 
                  } 
                }}
              />
              <Button 
                variant="contained" 
                onClick={handleFiltrer}
                disabled={loading || !dateDebut}
                size="small"
                sx={{ minWidth: 100 }}
              >
                {loading ? <CircularProgress size={20} /> : 'Appliquer'}
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => setShowDatePickers(false)}
                size="small"
              >
                Annuler
              </Button>
            </Stack>
          </LocalizationProvider>
        </Box>
      )}

      {/* Menu des périodes prédéfinies pour stats générales */}
      <Menu
        anchorEl={periodMenuAnchor}
        open={Boolean(periodMenuAnchor)}
        onClose={() => setPeriodMenuAnchor(null)}
      >
        <MenuItem onClick={() => applyPredefinedPeriod('today')}>Aujourd'hui</MenuItem>
        <MenuItem onClick={() => applyPredefinedPeriod('yesterday')}>Hier</MenuItem>
        <MenuItem onClick={() => applyPredefinedPeriod('last7days')}>7 derniers jours</MenuItem>
        <MenuItem onClick={() => applyPredefinedPeriod('last30days')}>30 derniers jours</MenuItem>
        <MenuItem onClick={() => applyPredefinedPeriod('thisWeek')}>Cette semaine</MenuItem>
        <MenuItem onClick={() => applyPredefinedPeriod('thisMonth')}>Ce mois</MenuItem>
        <MenuItem onClick={() => applyPredefinedPeriod('thisYear')}>Cette année</MenuItem>
      </Menu>

      {!stats ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ px: { xs: 0, sm: 2 } }}>
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

          {/* Graphique avec son propre filtre */}
          <Grid style={{ marginTop: '25px' }} size={{ xs: 12, md: 6, lg: 8 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Box>
                <Typography variant="h6">
                  Statistiques Globales de Consommation et de Recharge
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {graphStats?.periode?.date_debut 
                    ? `Période: du ${graphStats.periode.date_debut} au ${graphStats.periode.date_fin || 'aujourd\'hui'}`
                    : `Dernières consommations et recharges ${yearRange}`
                  }
                </Typography>
              </Box>
              
              {/* Filtre compact pour le graphique */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={getPeriodLabelGraph()}
                  onClick={() => setShowDatePickersGraph(!showDatePickersGraph)}
                  onDelete={dateDebutGraph ? handleResetFiltreGraph : undefined}
                  deleteIcon={<FilterListIcon />}
                  variant="outlined"
                  color={dateDebutGraph ? "primary" : "default"}
                  size="small"
                />
                
                <Tooltip title="Périodes rapides">
                  <IconButton
                    size="small"
                    onClick={(e) => setPeriodMenuAnchorGraph(e.currentTarget)}
                  >
                    <CalendarTodayIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            {/* Date pickers pour le graphique */}
            {showDatePickersGraph && (
              <Box sx={{ 
                mb: 2, 
                p: 2, 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: 'background.default'
              }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2} 
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                  >
                    <DatePicker
                      label="Date de début"
                      value={dateDebutGraph}
                      onChange={setDateDebutGraph}
                      slotProps={{ 
                        textField: { 
                          size: 'small',
                          fullWidth: true 
                        } 
                      }}
                    />
                    <DatePicker
                      label="Date de fin"
                      value={dateFinGraph}
                      onChange={setDateFinGraph}
                      slotProps={{ 
                        textField: { 
                          size: 'small',
                          fullWidth: true 
                        } 
                      }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={handleFiltrerGraph}
                      disabled={loadingGraph || !dateDebutGraph}
                      size="small"
                      sx={{ minWidth: 100 }}
                    >
                      {loadingGraph ? <CircularProgress size={20} /> : 'Appliquer'}
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => setShowDatePickersGraph(false)}
                      size="small"
                    >
                      Annuler
                    </Button>
                  </Stack>
                </LocalizationProvider>
              </Box>
            )}

            {/* Menu des périodes prédéfinies pour le graphique */}
            <Menu
              anchorEl={periodMenuAnchorGraph}
              open={Boolean(periodMenuAnchorGraph)}
              onClose={() => setPeriodMenuAnchorGraph(null)}
            >
              <MenuItem onClick={() => applyPredefinedPeriodGraph('today')}>Aujourd'hui</MenuItem>
              <MenuItem onClick={() => applyPredefinedPeriodGraph('yesterday')}>Hier</MenuItem>
              <MenuItem onClick={() => applyPredefinedPeriodGraph('last7days')}>7 derniers jours</MenuItem>
              <MenuItem onClick={() => applyPredefinedPeriodGraph('last30days')}>30 derniers jours</MenuItem>
              <MenuItem onClick={() => applyPredefinedPeriodGraph('thisWeek')}>Cette semaine</MenuItem>
              <MenuItem onClick={() => applyPredefinedPeriodGraph('thisMonth')}>Ce mois</MenuItem>
              <MenuItem onClick={() => applyPredefinedPeriodGraph('thisYear')}>Cette année</MenuItem>
            </Menu>

            <AnalyticsWebsiteVisits
              title=""
              subheader=""
              chart={chartData}
            />
          </Grid>
        </Box>
      )}
    </DashboardContent>
  );
}