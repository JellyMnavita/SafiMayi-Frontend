import React, { useEffect, useState } from "react";
import apiClient from "../../../utils/api";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import {
  Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress,
  Pagination, IconButton, Menu, MenuList, MenuItem as MenuItemMui,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tabs, Tab,
  Grid, Paper, FormControl, InputLabel, Autocomplete
} from "@mui/material";

import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";
import { AnalyticsWidgetSummary } from "../analytics-widget-summary";
import useMediaQuery from '@mui/material/useMediaQuery';

// Interfaces
export interface Recharge {
  Date: string;
  Utilisateur: string;
  "Carte RFID": string | null;
  Litre: number;
  Telephone: string;
  Moyen: string;
}

export interface Paiement {
  id: number;
  montant: number;
  telephone: string;
  operateur: string;
  id_transaction_ext: string;
  litres_credite: number;
  statut: string;
  created_at: string;
  utilisateur_nom: string;
  utilisateur_email: string;
  utilisateur_telephone: string;
  rfid_uid: string;
  raw_response: any;
}

export interface Consommation {
  id: number;
  date: string;
  compteur_nom: string;
  compteur_code_serie: string;
  litres: number;
  prix: number;
  commission: number;
  type: string;
  access_code?: string;
  access_code_status?: string;
  access_code_litres_demandes?: number;
  access_code_created_at?: string;
  access_code_expire_at?: string;
  utilisateur_nom?: string;
  utilisateur_email?: string;
  utilisateur_telephone?: string;
  rfid_uid?: string;
  rfid_telephone?: string;
  access_code_compteur_nom?: string;
  access_code_compteur_code_serie?: string;
}

interface StatsConsommations {
  total_consommations: number;
  total_litres: number;
  total_prix: number;
  benefice_total: number;
  taux_utilises?: {
    prix_par_litre: number;
    taux_commission: number;
  };
}

interface PaginatedResponse<T> {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: T[];
  stats?: any;
  statistiques?: any;
}

// Fonctions de garde de type
const isRecharge = (item: any): item is Recharge => {
  return item && 'Litre' in item && 'Moyen' in item;
};

const isPaiement = (item: any): item is Paiement => {
  return item && 'montant' in item && 'operateur' in item;
};

const isConsommation = (item: any): item is Consommation => {
  return item && 'compteur_nom' in item && 'litres' in item;
};



export function JournauxView() {
  const [activeTab, setActiveTab] = useState(0);
  const isMobile = useMediaQuery('(max-width:768px)');
  const isTablet = useMediaQuery('(max-width:1200px)');

  // États pour les données paginées
  const [recharges, setRecharges] = useState<Recharge[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [consommations, setConsommations] = useState<Consommation[]>([]);

  const [loadingRecharges, setLoadingRecharges] = useState<boolean>(true);
  const [loadingPaiements, setLoadingPaiements] = useState<boolean>(true);
  const [loadingConsommations, setLoadingConsommations] = useState<boolean>(true);

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filtres avec état pour la recherche avancée
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateDebut, setDateDebut] = useState<string>("");
  const [dateFin, setDateFin] = useState<string>("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filtres spécifiques
  const [moyenFilter, setMoyenFilter] = useState<string>("");
  const [statutFilter, setStatutFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [compteurFilter, setCompteurFilter] = useState<string>("");

  // Stats
  const [statsPaiements, setStatsPaiements] = useState<any>({});
  const [statsConsommations, setStatsConsommations] = useState<StatsConsommations>({
    total_consommations: 0,
    total_litres: 0,
    total_prix: 0,
    benefice_total: 0
  });

  // Menu et Dialog
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<Recharge | Paiement | Consommation | null>(null);
  const [itemType, setItemType] = useState<'recharge' | 'paiement' | 'consommation' | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Configuration du Slider responsive
  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: isMobile ? 1 : isTablet ? 2 : 4,
    slidesToScroll: 1,
    arrows: !isMobile,
    adaptiveHeight: true,
    centerMode: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
          arrows: true,
          dots: true
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 2,
          arrows: false,
          dots: true
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          arrows: false,
          dots: true
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          arrows: false,
          dots: true
        },
      },
    ],
  };

  // Construction des paramètres de requête
  const buildQueryParams = () => {
    const params: any = {
      page: page.toString(),
      page_size: pageSize.toString(),
    };

    if (searchTerm) params.search = searchTerm;
    if (dateDebut) params.date_debut = dateDebut;
    if (dateFin) params.date_fin = dateFin;

    // Filtres spécifiques
    if (activeTab === 0 && moyenFilter) params.moyen = moyenFilter;
    if (activeTab === 1 && statutFilter) params.statut = statutFilter;
    if (activeTab === 2) {
      if (typeFilter) params.type_consommation = typeFilter;
      if (compteurFilter) params.compteur = compteurFilter;
    }

    return new URLSearchParams(params).toString();
  };

  // Charger les recharges avec pagination backend
  const fetchRecharges = async () => {
    try {
      setLoadingRecharges(true);
      const queryParams = buildQueryParams();
      const response = await apiClient.get<PaginatedResponse<Recharge>>(
        `/api/litrages/all-recharges/?${queryParams}`
      );

      setRecharges(response.data.results);
      setTotalCount(response.data.count);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error("Erreur lors du chargement des recharges :", error);
    } finally {
      setLoadingRecharges(false);
    }
  };

  // Charger les paiements avec pagination backend
  const fetchPaiements = async () => {
    try {
      setLoadingPaiements(true);
      const queryParams = buildQueryParams();
      const response = await apiClient.get<any>(
        `/api/paiements/all/?${queryParams}`
      );

      setPaiements(response.data.results);
      setTotalCount(response.data.count);
      setTotalPages(response.data.total_pages);
      setStatsPaiements(response.data.statistiques || {});
    } catch (error) {
      console.error("Erreur lors du chargement des paiements :", error);
    } finally {
      setLoadingPaiements(false);
    }
  };

  // Charger les consommations avec pagination backend
  const fetchConsommations = async () => {
    try {
      setLoadingConsommations(true);
      const queryParams = buildQueryParams();
      const response = await apiClient.get<any>(
        `/api/litrages/all-consommations/?${queryParams}`
      );

      setConsommations(response.data.results);
      setTotalCount(response.data.count);
      setTotalPages(response.data.total_pages);
      setStatsConsommations(response.data.stats || {});
    } catch (error) {
      console.error("Erreur lors du chargement des consommations :", error);
    } finally {
      setLoadingConsommations(false);
    }
  };



  // Charger les données quand les paramètres changent
  useEffect(() => {
    const fetchData = () => {
      if (activeTab === 0) {
        fetchRecharges();
      } else if (activeTab === 1) {
        fetchPaiements();
      } else if (activeTab === 2) {
        fetchConsommations();
      }
    };

    // Debounce pour éviter trop de requêtes
    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [activeTab, page, pageSize, searchTerm, dateDebut, dateFin, moyenFilter, statutFilter, typeFilter, compteurFilter]);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setPage(1);
  }, [searchTerm, dateDebut, dateFin, moyenFilter, statutFilter, typeFilter, compteurFilter]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, item: Recharge | Paiement | Consommation, type: 'recharge' | 'paiement' | 'consommation') => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
    setItemType(type);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleRowClick = (item: Recharge | Paiement | Consommation, type: 'recharge' | 'paiement' | 'consommation') => {
    setSelectedItem(item);
    setItemType(type);
    setOpenDialog(true);
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Date invalide";
      }
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Date invalide";
    }
  };

  // Formater les montants
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Obtenir la couleur du statut
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'success': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'success': return 'Réussi';
      case 'pending': return 'En attente';
      case 'failed': return 'Échoué';
      default: return statut;
    }
  };

  // Obtenir la couleur du type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RFID': return 'primary';
      case "Code d'accès": return 'secondary';
      default: return 'default';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(1);
    resetFilters();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setDateDebut("");
    setDateFin("");
    setMoyenFilter("");
    setStatutFilter("");
    setTypeFilter("");
    setCompteurFilter("");
  };

  const refreshData = () => {
    if (activeTab === 0) {
      fetchRecharges();
    } else if (activeTab === 1) {
      fetchPaiements();
    } else if (activeTab === 2) {
      fetchConsommations();
    }
  };

  const TauxDisplay = () => {
    if (!statsConsommations.taux_utilises) return null;

    return (
      <Paper sx={{
        p: 1.5,
        mb: 2,
        bgcolor: 'background.default',
        border: 1,
        borderColor: 'divider'
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Taux utilisés pour les calculs :
          </Typography>

          <Box sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Chip
              size="small"
              label={`Prix: ${formatCurrency(statsConsommations.taux_utilises.prix_par_litre)} FC/L`}
              color="primary"
              variant="outlined"
            />

            <Chip
              size="small"
              label={`Commission: ${statsConsommations.taux_utilises.taux_commission}%`}
              color="secondary"
              variant="outlined"
            />
          </Box>
        </Box>
      </Paper>
    );
  };

  // Composant pour les détails d'un élément
  const DetailContent = () => {
    if (!selectedItem) return null;

    if (itemType === 'recharge' && isRecharge(selectedItem)) {
      return (
        <Grid container spacing={2}>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Date</Typography>
            <Typography variant="body1" gutterBottom>{formatDate(selectedItem.Date)}</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Utilisateur</Typography>
            <Typography variant="body1" gutterBottom>{selectedItem.Utilisateur}</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Téléphone</Typography>
            <Typography variant="body1" gutterBottom>{selectedItem.Telephone}</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Carte RFID</Typography>
            <Typography variant="body1" gutterBottom>{selectedItem["Carte RFID"] || "Non utilisée"}</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Litres</Typography>
            <Typography variant="body1" gutterBottom>{selectedItem.Litre.toFixed(1)} L</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Moyen</Typography>
            <Chip label={selectedItem.Moyen} color="primary" size="small" />
          </Grid>
        </Grid>
      );
    }

    if (itemType === 'paiement' && isPaiement(selectedItem)) {
      return (
        <Grid container spacing={2}>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Date</Typography>
            <Typography variant="body1" gutterBottom>{formatDate(selectedItem.created_at)}</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Utilisateur</Typography>
            <Typography variant="body1" gutterBottom>{selectedItem.utilisateur_nom || 'N/A'}</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Email</Typography>
            <Typography variant="body1" gutterBottom>{selectedItem.utilisateur_email || 'N/A'}</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Téléphone</Typography>
            <Typography variant="body1" gutterBottom>{selectedItem.telephone}</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Carte RFID</Typography>
            <Typography variant="body1" gutterBottom>{selectedItem.rfid_uid || 'Aucune'}</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Opérateur</Typography>
            <Typography variant="body1" gutterBottom>{selectedItem.operateur}</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Montant</Typography>
            <Typography variant="body1" gutterBottom>{formatCurrency(selectedItem.montant)} FC</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Litres crédités</Typography>
            <Typography variant="body1" gutterBottom>{selectedItem.litres_credite} L</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
            <Chip
              label={getStatusText(selectedItem.statut)}
              color={getStatusColor(selectedItem.statut) as any}
              size="small"
            />
          </Grid>
          <Grid sx={{ width: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary">ID Transaction</Typography>
            <Typography variant="body1" gutterBottom style={{ wordBreak: 'break-all' }}>
              {selectedItem.id_transaction_ext}
            </Typography>
          </Grid>
        </Grid>
      );
    }

    if (itemType === 'consommation' && isConsommation(selectedItem)) {
      return (
        <Grid container spacing={2}>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">ID</Typography>
            <Typography variant="body1" gutterBottom>{selectedItem.id}</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Date</Typography>
            <Typography variant="body1" gutterBottom>{formatDate(selectedItem.date)}</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Compteur</Typography>
            <Typography variant="body1" gutterBottom>
              {selectedItem.compteur_nom}
              <br />
              <Typography variant="caption" color="text.secondary">
                {selectedItem.compteur_code_serie}
              </Typography>
            </Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Litres</Typography>
            <Typography variant="body1" gutterBottom>{selectedItem.litres} L</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Prix</Typography>
            <Typography variant="body1" gutterBottom>{formatCurrency(selectedItem.prix || 0)} FC</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Commission</Typography>
            <Typography variant="body1" gutterBottom>{formatCurrency(selectedItem.commission || 0)} FC</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Type</Typography>
            <Chip
              label={selectedItem.type}
              color={getTypeColor(selectedItem.type) as any}
              size="small"
            />
          </Grid>

          <Grid sx={{ width: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Informations Utilisateur
            </Typography>
          </Grid>

          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Nom</Typography>
            <Typography variant="body1" gutterBottom>{selectedItem.utilisateur_nom || "Anonyme"}</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Email</Typography>
            <Typography variant="body1" gutterBottom>{selectedItem.utilisateur_email || "Non disponible"}</Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
            <Typography variant="subtitle2" color="text.secondary">Téléphone</Typography>
            <Typography variant="body1" gutterBottom>{selectedItem.utilisateur_telephone || "Non disponible"}</Typography>
          </Grid>

          {selectedItem.type === "RFID" ? (
            <>
              <Grid sx={{ width: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Informations RFID
                </Typography>
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                <Typography variant="subtitle2" color="text.secondary">UID RFID</Typography>
                <Typography variant="body1" gutterBottom>{selectedItem.rfid_uid || "Non disponible"}</Typography>
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                <Typography variant="subtitle2" color="text.secondary">Téléphone RFID</Typography>
                <Typography variant="body1" gutterBottom>{selectedItem.rfid_telephone || "Non disponible"}</Typography>
              </Grid>
            </>
          ) : (
            <>
              <Grid sx={{ width: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Informations Code d'Accès
                </Typography>
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                <Typography variant="subtitle2" color="text.secondary">Code</Typography>
                <Typography variant="body1" gutterBottom>{selectedItem.access_code || "Non disponible"}</Typography>
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
                <Typography variant="body1" gutterBottom>{selectedItem.access_code_status || "Non disponible"}</Typography>
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                <Typography variant="subtitle2" color="text.secondary">Litres demandés</Typography>
                <Typography variant="body1" gutterBottom>{selectedItem.access_code_litres_demandes || 0} L</Typography>
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                <Typography variant="subtitle2" color="text.secondary">Créé le</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedItem.access_code_created_at ? formatDate(selectedItem.access_code_created_at) : "Non disponible"}
                </Typography>
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                <Typography variant="subtitle2" color="text.secondary">Expire le</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedItem.access_code_expire_at ? formatDate(selectedItem.access_code_expire_at) : "Non disponible"}
                </Typography>
              </Grid>
            </>
          )}
        </Grid>
      );
    }

    return null;
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Journaux
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="solar:restart-bold" />}
          onClick={refreshData}
        >
          Actualiser
        </Button>
      </Box>

      {/* Onglets */}
      <Card sx={{ mb: 3, overflow: 'auto' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile
          sx={{
            minWidth: 'fit-content',
            '& .MuiTab-root': {
              minWidth: 'auto',
              px: 2,
              fontSize: isMobile ? '0.75rem' : '0.875rem'
            }
          }}
        >
          <Tab label="Journal des Recharges" />
          <Tab label="Journal des Paiements" />
          <Tab label="Journal des Consommations" />
        </Tabs>
      </Card>

      {/* Filtres optimisés */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Ligne principale */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              label="Rechercher"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              placeholder="Nom, téléphone, RFID..."
              sx={{ minWidth: isMobile ? '100%' : 250, flexGrow: 1 }}
            />

            {/* Filtres rapides */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: 'wrap' }}>
              {activeTab === 0 && (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Moyen</InputLabel>
                  <Select
                    value={moyenFilter}
                    label="Moyen"
                    onChange={(e) => setMoyenFilter(e.target.value)}
                  >
                    <MenuItem value="">Tous</MenuItem>
                    <MenuItem value="mobile">Mobile</MenuItem>
                    <MenuItem value="rfid">RFID</MenuItem>
                  </Select>
                </FormControl>
              )}

              {activeTab === 1 && (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={statutFilter}
                    label="Statut"
                    onChange={(e) => setStatutFilter(e.target.value)}
                  >
                    <MenuItem value="">Tous</MenuItem>
                    <MenuItem value="success">Réussi</MenuItem>
                    <MenuItem value="pending">En attente</MenuItem>
                    <MenuItem value="failed">Échoué</MenuItem>
                  </Select>
                </FormControl>
              )}

              {activeTab === 2 && (
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Type"
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value="">Tous</MenuItem>
                    <MenuItem value="RFID">RFID</MenuItem>
                    <MenuItem value="Code d'accès">Code d'Accès</MenuItem>
                  </Select>
                </FormControl>
              )}

              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon={showAdvancedFilters ? "mingcute:close-line" : "ic:round-filter-list"} />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                {showAdvancedFilters ? "Masquer" : "Plus de filtres"}
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={resetFilters}
                startIcon={<Iconify icon="solar:restart-bold" />}
              >
                Réinitialiser
              </Button>
            </Box>
          </Box>

          {/* Filtres avancés */}
          {showAdvancedFilters && (
            <Box sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
              pt: 2,
              borderTop: 1,
              borderColor: 'divider'
            }}>
              <TextField
                label="Date de début"
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
              <TextField
                label="Date de fin"
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />

              {activeTab === 2 && (
                <TextField
                  label="Compteur"
                  value={compteurFilter}
                  onChange={(e) => setCompteurFilter(e.target.value)}
                  size="small"
                  placeholder="Nom ou code série"
                  sx={{ minWidth: 150 }}
                />
              )}

              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Par page</InputLabel>
                <Select
                  value={pageSize}
                  label="Par page"
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </Box>
      </Card>

      {/* Affichage des taux utilisés pour les consommations */}
      {activeTab === 2 && statsConsommations.taux_utilises && <TauxDisplay />}

      {/* Statistiques avec Slider */}
      {(activeTab === 1 || activeTab === 2) && (
        <Box sx={{
          mb: 3,
          '& .slick-slide': {
            display: 'flex',
            justifyContent: 'center'
          },
          '& .slick-list': {
            margin: '0 -8px'
          },
          '& .slick-slide > div': {
            padding: '0 8px',
            width: '100%'
          }
        }}>
          {activeTab === 1 ? (
            <Slider {...sliderSettings}>
              <div>
                <AnalyticsWidgetSummary
                  title="Montant Total"
                  total={statsPaiements.montant_total || 0}
                  color="primary"
                  suffix=" FC"
                  isCurrency={true}
                  icon={<img alt="Revenue" src="/assets/icons/glass/ic-glass-buy.svg" />}
                  sx={{ height: '100%' }}
                />
              </div>
              <div>
                <AnalyticsWidgetSummary
                  title="Paiements Réussis"
                  total={statsPaiements.reussis || 0}
                  color="success"
                  icon={<img alt="RFID" src="/assets/icons/glass/ic-glass-users.svg" />}
                  sx={{ height: '100%' }}
                />
              </div>
              <div>
                <AnalyticsWidgetSummary
                  title="En Attente"
                  total={statsPaiements.en_attente || 0}
                  color="warning"
                  icon={<img alt="Water" src="/assets/icons/glass/ic-glass-message.svg" />}
                  sx={{ height: '100%' }}
                />
              </div>
              <div>
                <AnalyticsWidgetSummary
                  title="Échoués"
                  total={statsPaiements.echecs || 0}
                  color="error"
                  icon={<img alt="Total" src="/assets/icons/glass/ic-glass-bag.svg" />}
                  sx={{ height: '100%' }}
                />
              </div>
            </Slider>
          ) : (
            <Slider {...sliderSettings}>
              <div>
                <AnalyticsWidgetSummary
                  title="Total Consommations"
                  total={statsConsommations.total_consommations || 0}
                  color="primary"
                  icon={<img alt="Total" src="/assets/icons/glass/ic-glass-bag.svg" />}
                  sx={{ height: '100%' }}
                />
              </div>
              <div>
                <AnalyticsWidgetSummary
                  title="Litres Total"
                  total={statsConsommations.total_litres || 0}
                  color="success"
                  suffix=" L"
                  icon={<img alt="Water" src="/assets/icons/glass/ic-glass-message.svg" />}
                  sx={{ height: '100%' }}
                />
              </div>
              <div>
                <AnalyticsWidgetSummary
                  title="Prix Total"
                  total={statsConsommations.total_prix || 0}
                  color="info"
                  suffix=" FC"
                  isCurrency={true}
                  icon={<img alt="Revenue" src="/assets/icons/glass/ic-glass-buy.svg" />}
                  sx={{ height: '100%' }}
                />
              </div>
              <div>
                <AnalyticsWidgetSummary
                  title="Bénéfice Total"
                  total={statsConsommations.benefice_total || 0}
                  color="warning"
                  suffix=" FC"
                  isCurrency={true}
                  icon={<img alt="Profit" src="/assets/icons/glass/ic-glass-users.svg" />}
                  sx={{ height: '100%' }}
                />
              </div>
            </Slider>
          )}
        </Box>
      )}

      {/* Tableau */}
      <Card>
        <div className="p-4 bg-white shadow-md rounded-md overflow-x-auto">
          {((activeTab === 0 && loadingRecharges) || (activeTab === 1 && loadingPaiements) || (activeTab === 2 && loadingConsommations)) ? (
            <div className="flex justify-center items-center py-10">
              <CircularProgress />
            </div>
          ) : (
            <>
              {activeTab === 0 ? (
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm">
                      <th className="p-2 border-b">Date</th>
                      <th className="p-2 border-b">Utilisateur</th>
                      <th className="p-2 border-b">Téléphone</th>
                      <th className="p-2 border-b">Carte RFID</th>
                      <th className="p-2 border-b">Litres</th>
                      <th className="p-2 border-b">Moyen</th>
                      <th className="p-2 border-b text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recharges.length > 0 ? (
                      recharges.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleRowClick(item, 'recharge')}
                        >
                          <td className="p-2 border-b">{formatDate(item.Date)}</td>
                          <td className="p-2 border-b">{item.Utilisateur}</td>
                          <td className="p-2 border-b">{item.Telephone}</td>
                          <td className="p-2 border-b">{item["Carte RFID"] || "-"}</td>
                          <td className="p-2 border-b">{item.Litre.toFixed(1)} L</td>
                          <td className="p-2 border-b">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                              {item.Moyen}
                            </span>
                          </td>
                          <td className="p-2 border-b text-center" onClick={(e) => e.stopPropagation()}>
                            <IconButton onClick={(e) => handleMenuOpen(e, item, 'recharge')}>
                              <Iconify icon="eva:more-vertical-fill" />
                            </IconButton>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center text-gray-500 py-6">
                          Aucune recharge trouvée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : activeTab === 1 ? (
                <table className="w-full border-collapse min-w-[1100px]">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm">
                      <th className="p-2 border-b">Date</th>
                      <th className="p-2 border-b">Utilisateur</th>
                      <th className="p-2 border-b">Téléphone</th>
                      <th className="p-2 border-b">Carte RFID</th>
                      <th className="p-2 border-b">Opérateur</th>
                      <th className="p-2 border-b">Montant</th>
                      <th className="p-2 border-b">Litres</th>
                      <th className="p-2 border-b">Statut</th>
                      <th className="p-2 border-b text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paiements.length > 0 ? (
                      paiements.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleRowClick(item, 'paiement')}
                        >
                          <td className="p-2 border-b">{formatDate(item.created_at)}</td>
                          <td className="p-2 border-b">
                            {item.utilisateur_nom || 'N/A'}
                            {item.utilisateur_email && (
                              <div className="text-xs text-gray-500">{item.utilisateur_email}</div>
                            )}
                          </td>
                          <td className="p-2 border-b">{item.telephone}</td>
                          <td className="p-2 border-b">{item.rfid_uid || 'Aucune'}</td>
                          <td className="p-2 border-b">{item.operateur}</td>
                          <td className="p-2 border-b">{item.montant} FC</td>
                          <td className="p-2 border-b">{item.litres_credite} L</td>
                          <td className="p-2 border-b">
                            <Chip
                              label={getStatusText(item.statut)}
                              color={getStatusColor(item.statut) as any}
                              size="small"
                            />
                          </td>
                          <td className="p-2 border-b text-center" onClick={(e) => e.stopPropagation()}>
                            <IconButton onClick={(e) => handleMenuOpen(e, item, 'paiement')}>
                              <Iconify icon="eva:more-vertical-fill" />
                            </IconButton>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center text-gray-500 py-6">
                          Aucun paiement trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm">
                      <th className="p-2 border-b">Date</th>
                      <th className="p-2 border-b">Compteur</th>
                      <th className="p-2 border-b">Litres</th>
                      <th className="p-2 border-b">Prix</th>
                      <th className="p-2 border-b">Type</th>
                      <th className="p-2 border-b">Utilisateur</th>
                      <th className="p-2 border-b text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consommations.length > 0 ? (
                      consommations.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleRowClick(item, 'consommation')}
                        >
                          <td className="p-2 border-b">{formatDate(item.date)}</td>
                          <td className="p-2 border-b">
                            {item.compteur_nom}
                            <div className="text-xs text-gray-500">{item.compteur_code_serie}</div>
                          </td>
                          <td className="p-2 border-b">{item.litres} L</td>
                          <td className="p-2 border-b">{formatCurrency(item.prix || 0)} FC</td>
                          <td className="p-2 border-b">
                            <Chip
                              label={item.type}
                              color={getTypeColor(item.type) as any}
                              size="small"
                            />
                          </td>
                          <td className="p-2 border-b">
                            {item.utilisateur_nom || "Anonyme"}
                            {item.utilisateur_telephone && (
                              <div className="text-xs text-gray-500">{item.utilisateur_telephone}</div>
                            )}
                          </td>
                          <td className="p-2 border-b text-center" onClick={(e) => e.stopPropagation()}>
                            <IconButton onClick={(e) => handleMenuOpen(e, item, 'consommation')}>
                              <Iconify icon="eva:more-vertical-fill" />
                            </IconButton>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center text-gray-500 py-6">
                          Aucune consommation trouvée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Pagination backend */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Typography variant="body2">
                  {`Affichage de ${recharges.length} sur ${totalCount} ${activeTab === 0 ? 'recharges' :
                    activeTab === 1 ? 'paiements' :
                      'consommations'
                    }`}
                </Typography>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            </>
          )}
        </div>
      </Card>

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuList>
          <MenuItemMui
            onClick={() => {
              setOpenDialog(true);
              handleMenuClose();
            }}
          >
            Voir les détails
          </MenuItemMui>
        </MenuList>
      </Menu>

      {/* Dialog Détails amélioré */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'primary.main',
          color: 'primary.contrastText'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify
              icon={
                itemType === 'recharge' ? "solar:restart-bold" :
                  itemType === 'paiement' ? "solar:cart-3-bold" :
                    "solar:shield-keyhole-bold-duotone"
              }
            />
            Détails {itemType === 'recharge' ? 'de la recharge' : itemType === 'paiement' ? 'du paiement' : 'de la consommation'}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, maxHeight: '70vh', overflow: 'auto' }}>
          <DetailContent />
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="contained"
            startIcon={<Iconify icon="mingcute:close-line" />}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}