import { useEffect, useState } from 'react';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { DashboardContent } from '../../../layouts/dashboard';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';

// Définir le type de la réponse de l'API
interface StatsResponse {
  utilisateurs: {
    total: number;
    clients: number;
    admins: number;
  };
  litrage: {
    total_recharges_litres: number;
    total_consomme_litres: number;
    total_disponible_litres: number;
  };
  paiements: {
    montant_total: number;
    nombre_transactions: number;
  };
  access_codes: {
    total: number;
    utilises: number;
    non_utilises: number;
  };
  compteurs: {
    total: number;
    actifs: number;
  };
  rfid: {
    total: number;
    actives: number;
  };
}

export function OverviewAnalyticsView() {
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token'); // JWT access token
        const res = await axios.get<StatsResponse>(
          'https://safimayi-backend.onrender.com/api/users/stats/',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStats(res.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des stats:', error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) {
    return (
      <DashboardContent maxWidth="xl">
        <Typography variant="h6">Chargement des statistiques...</Typography>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hey, bienvenue dans l'espace administrateur
      </Typography>


      <Grid container spacing={3}>
        {/* Cartes RFID */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Total Cartes RFID"
            total={stats.rfid.total}
            icon={<img alt="RFID" src="/assets/icons/glass/ic-glass-bag.svg" />}
          />
        </Grid>        
        {/* Utilisateurs */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Total Utilisateurs"
            total={stats.utilisateurs.total}
            color="secondary"
            icon={<img alt="Users" src="/assets/icons/glass/ic-glass-users.svg" />}
          />
        </Grid>

        {/* Paiements */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Montant Paiements"
            total={stats.paiements.montant_total}
            color="warning"
            icon={<img alt="Paiements" src="/assets/icons/glass/ic-glass-buy.svg" />}
          />
        </Grid>

        {/* Codes d'accès */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Codes d'accès générés"
            total={stats.access_codes.total}
            color="error"
            icon={<img alt="Access Codes" src="/assets/icons/glass/ic-glass-message.svg" />}
          />
        </Grid>

        {/* Compteurs */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Compteurs actifs"
            total={stats.compteurs.actifs}
            color="info"
            icon={<img alt="Compteurs" src="/assets/icons/glass/ic-glass-buy.svg" />}
          />
        </Grid>

        {/* Litres consommés */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Litres consommés"
            total={stats.litrage.total_consomme_litres}
            color="success"
            icon={<img alt="Consommation" src="/assets/icons/glass/ic-glass-users.svg" />}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
