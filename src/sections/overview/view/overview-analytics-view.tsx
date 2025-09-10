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
import '../../../index.css'
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';



interface StatsResponse {
  utilisateurs: { total: number; clients: number; admins: number };
  litrage: { total_recharges_litres: number; total_consomme_litres: number; total_disponible_litres: number };
  paiements: { montant_total: number; nombre_transactions: number };
  access_codes: { total: number; utilises: number; non_utilises: number };
  compteurs: { total: number; actifs: number };
  rfid: { total: number; actives: number };
}

export function OverviewAnalyticsView() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
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
      } catch (error) {
        console.error('Erreur lors de la récupération des stats:', error);
      }
    };

    fetchStats();
  }, []);
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: isMobile ? 1 : isTablet ? 2 : 3,
    slidesToScroll: 1,
    arrows: true, // flèches activées
    responsive: [
      {
        breakpoint: 1200, // tablette
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768, // mobile
        settings: {
          slidesToShow: 1,  
        },
      },
    ],
  };

  const username = JSON.parse(localStorage.getItem('user') || '{}').nom;
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
            <div>
              <AnalyticsWidgetSummary
                title="Total Cartes RFID"
                total={stats.rfid.total}
                icon={<img alt="RFID" src="/assets/icons/glass/ic-glass-bag.svg" />}
              />
            </div>
            <div>
              <AnalyticsWidgetSummary
                title="Total Utilisateurs"
                total={stats.utilisateurs.total}
                color="secondary"
                icon={<img alt="Users" src="/assets/icons/glass/ic-glass-users.svg" />}
              />
            </div>
            <div>
              <AnalyticsWidgetSummary
                title="Montant Paiements"
                total={stats.paiements.montant_total}
                color="warning"
                icon={<img alt="Paiements" src="/assets/icons/glass/ic-glass-buy.svg" />}
              />
            </div>
            <div>
              <AnalyticsWidgetSummary
                title="Codes d'accès générés"
                total={stats.access_codes.total}
                color="error"
                icon={<img alt="Access Codes" src="/assets/icons/glass/ic-glass-message.svg" />}
              />
            </div>
            <div>
              <AnalyticsWidgetSummary
                title="Compteurs actifs"
                total={stats.compteurs.actifs}
                color="info"
                icon={<img alt="Compteurs" src="/assets/icons/glass/ic-glass-buy.svg" />}
              />
            </div>
            <div>
              <AnalyticsWidgetSummary
                title="Litres consommés"
                total={stats.litrage.total_consomme_litres}
                color="success"
                icon={<img alt="Consommation" src="/assets/icons/glass/ic-glass-users.svg" />}
              />
            </div>
          </Slider>
          <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsWebsiteVisits
            title="Statistiques Globales de Consommation"
            subheader="(+43%) than last year"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: 'Team A', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] }
              ],
            }}
          />
        </Grid>
        </Box>
      )}
    </DashboardContent>
  );
}
