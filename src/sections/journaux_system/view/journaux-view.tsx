import React, { useEffect, useState } from "react";
import apiClient from "../../../utils/api";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import {
  Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress,
  Pagination, IconButton, Menu, MenuList, MenuItem as MenuItemMui,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tabs, Tab,
  Grid, Paper
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

  // États pour les recharges
  const [allRecharges, setAllRecharges] = useState<Recharge[]>([]);
  const [recharges, setRecharges] = useState<Recharge[]>([]);
  const [loadingRecharges, setLoadingRecharges] = useState<boolean>(true);

  // États pour les paiements
  const [allPaiements, setAllPaiements] = useState<Paiement[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loadingPaiements, setLoadingPaiements] = useState<boolean>(true);
  const [statsPaiements, setStatsPaiements] = useState<any>({});

  // États pour les consommations
  const [allConsommations, setAllConsommations] = useState<Consommation[]>([]);
  const [consommations, setConsommations] = useState<Consommation[]>([]);
  const [loadingConsommations, setLoadingConsommations] = useState<boolean>(true);
  const [statsConsommations, setStatsConsommations] = useState<StatsConsommations>({
    total_consommations: 0,
    total_litres: 0,
    total_prix: 0,
    benefice_total: 0
  });

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  // Filtres communs
  const [searchUtilisateur, setSearchUtilisateur] = useState<string>("");
  const [searchTelephone, setSearchTelephone] = useState<string>("");

  // Filtres spécifiques aux recharges
  const [moyenFilter, setMoyenFilter] = useState<string>("");

  // Filtres spécifiques aux paiements
  const [statutFilter, setStatutFilter] = useState<string>("");
  const [operateurFilter, setOperateurFilter] = useState<string>("");
  const [searchRFID, setSearchRFID] = useState<string>("");

  // Filtres spécifiques aux consommations
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [searchCompteur, setSearchCompteur] = useState<string>("");
  const [searchAccessCode, setSearchAccessCode] = useState<string>("");

  // Menu actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<Recharge | Paiement | Consommation | null>(null);
  const [itemType, setItemType] = useState<'recharge' | 'paiement' | 'consommation' | null>(null);

  // Dialog pour voir les détails
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, item: Recharge | Paiement | Consommation, type: 'recharge' | 'paiement' | 'consommation') => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
    setItemType(type);
  };

  const handleMenuClose = () => setAnchorEl(null);

  // Charger les recharges
  const fetchRecharges = async () => {
    try {
      setLoadingRecharges(true);
      const response = await apiClient.get(`/api/litrages/all-recharges/`);
      setAllRecharges(response.data);
      setRecharges(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des recharges :", error);
    } finally {
      setLoadingRecharges(false);
    }
  };

  // Charger les paiements
  const fetchPaiements = async () => {
    try {
      setLoadingPaiements(true);
      const response = await apiClient.get(`/api/paiements/all/`);
      setAllPaiements(response.data.paiements);
      setPaiements(response.data.paiements);
      setStatsPaiements(response.data.statistiques || {});
    } catch (error) {
      console.error("Erreur lors du chargement des paiements :", error);
    } finally {
      setLoadingPaiements(false);
    }
  };

  // Charger les consommations
  const fetchConsommations = async () => {
    try {
      setLoadingConsommations(true);
      const response = await apiClient.get(`/api/litrages/all-consommations/`);
      
      // Vérifier la structure de la réponse
      if (response.data && response.data.consommations && response.data.stats) {
        setAllConsommations(response.data.consommations);
        setConsommations(response.data.consommations);
        setStatsConsommations(response.data.stats);
      } else {
        // Fallback pour l'ancienne structure
        setAllConsommations(response.data);
        setConsommations(response.data);
        
        const totalConsommations = response.data.length;
        const totalLitres = Math.round(
          response.data.reduce((sum: number, c: Consommation) => sum + c.litres, 0)
        );
        const totalPrix = response.data.reduce((sum: number, c: Consommation) => sum + (c.prix || 0), 0);
        const beneficeTotal = response.data.reduce((sum: number, c: Consommation) => sum + (c.commission || 0), 0);

        setStatsConsommations({
          total_consommations: totalConsommations,
          total_litres: totalLitres,
          total_prix: totalPrix,
          benefice_total: beneficeTotal
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des consommations :", error);
    } finally {
      setLoadingConsommations(false);
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
      fetchRecharges();
    } else if (activeTab === 1) {
      fetchPaiements();
    } else if (activeTab === 2) {
      fetchConsommations();
    }
  }, [activeTab]);

  // Filtrage local des recharges
  useEffect(() => {
    let filtered = [...allRecharges];

    if (searchUtilisateur) {
      filtered = filtered.filter((r) =>
        r.Utilisateur.toLowerCase().includes(searchUtilisateur.toLowerCase())
      );
    }
    if (searchTelephone) {
      filtered = filtered.filter((r) =>
        r.Telephone.toLowerCase().includes(searchTelephone.toLowerCase())
      );
    }
    if (moyenFilter) {
      filtered = filtered.filter((r) =>
        r.Moyen.toLowerCase() === moyenFilter.toLowerCase()
      );
    }

    setRecharges(filtered);
    setPage(1);
  }, [searchUtilisateur, searchTelephone, moyenFilter, allRecharges]);

  // Filtrage local des paiements
  useEffect(() => {
    let filtered = [...allPaiements];

    if (searchUtilisateur) {
      filtered = filtered.filter((p) =>
        p.utilisateur_nom && p.utilisateur_nom.toLowerCase().includes(searchUtilisateur.toLowerCase())
      );
    }
    if (searchTelephone) {
      filtered = filtered.filter((p) =>
        p.telephone.toLowerCase().includes(searchTelephone.toLowerCase())
      );
    }
    if (statutFilter) {
      filtered = filtered.filter((p) => p.statut === statutFilter);
    }
    if (operateurFilter) {
      filtered = filtered.filter((p) => p.operateur === operateurFilter);
    }
    if (searchRFID) {
      filtered = filtered.filter((p) =>
        p.rfid_uid && p.rfid_uid.toLowerCase().includes(searchRFID.toLowerCase())
      );
    }

    setPaiements(filtered);
    setPage(1);
  }, [searchUtilisateur, searchTelephone, statutFilter, operateurFilter, searchRFID, allPaiements]);

  // Filtrage local des consommations
  useEffect(() => {
    let filtered = [...allConsommations];

    if (searchUtilisateur) {
      filtered = filtered.filter((c) =>
        c.utilisateur_nom && c.utilisateur_nom.toLowerCase().includes(searchUtilisateur.toLowerCase())
      );
    }
    if (searchTelephone) {
      filtered = filtered.filter((c) =>
        c.utilisateur_telephone && c.utilisateur_telephone.includes(searchTelephone)
      );
    }
    if (typeFilter) {
      filtered = filtered.filter((c) => c.type === typeFilter);
    }
    if (searchCompteur) {
      filtered = filtered.filter((c) =>
        c.compteur_nom.toLowerCase().includes(searchCompteur.toLowerCase()) ||
        c.compteur_code_serie.toLowerCase().includes(searchCompteur.toLowerCase())
      );
    }
    if (searchRFID) {
      filtered = filtered.filter((c) =>
        c.rfid_uid && c.rfid_uid.toLowerCase().includes(searchRFID.toLowerCase())
      );
    }
    if (searchAccessCode) {
      filtered = filtered.filter((c) =>
        c.access_code && c.access_code.toLowerCase().includes(searchAccessCode.toLowerCase())
      );
    }

    setConsommations(filtered);
    setPage(1);
  }, [searchUtilisateur, searchTelephone, typeFilter, searchCompteur, searchRFID, searchAccessCode, allConsommations]);

  // Pagination locale
  const getPaginatedData = (): (Recharge | Paiement | Consommation)[] => {
    if (activeTab === 0) {
      return recharges.slice((page - 1) * pageSize, page * pageSize);
    } else if (activeTab === 1) {
      return paiements.slice((page - 1) * pageSize, page * pageSize);
    } else {
      return consommations.slice((page - 1) * pageSize, page * pageSize);
    }
  };

  const paginatedData = getPaginatedData();
  const totalItems = activeTab === 0 ? recharges.length : activeTab === 1 ? paiements.length : consommations.length;

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
    // Réinitialiser les filtres spécifiques
    setMoyenFilter("");
    setStatutFilter("");
    setOperateurFilter("");
    setTypeFilter("");
    setSearchRFID("");
    setSearchAccessCode("");
    setSearchCompteur("");
  };

  const resetAllFilters = () => {
    setSearchUtilisateur("");
    setSearchTelephone("");
    setMoyenFilter("");
    setStatutFilter("");
    setOperateurFilter("");
    setTypeFilter("");
    setSearchRFID("");
    setSearchAccessCode("");
    setSearchCompteur("");
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

  // Composant pour afficher les taux utilisés
  const TauxDisplay = () => {
    if (!statsConsommations.taux_utilises) return null;

    return (
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          Taux utilisés pour les calculs
        </Typography>
        <Grid container spacing={2}>
          <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
            <Typography variant="body2">
              <strong>Prix par litre:</strong> {formatCurrency(statsConsommations.taux_utilises.prix_par_litre)} FC
            </Typography>
          </Grid>
          <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
            <Typography variant="body2">
              <strong>Taux de commission:</strong> {statsConsommations.taux_utilises.taux_commission}%
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    );
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

      {/* Onglets avec style responsive */}
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

      {/* Filtres */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Utilisateur"
            value={searchUtilisateur}
            onChange={(e) => setSearchUtilisateur(e.target.value)}
            size="small"
            sx={{ minWidth: isMobile ? '100%' : 150 }}
          />
          <TextField
            label="Téléphone"
            value={searchTelephone}
            onChange={(e) => setSearchTelephone(e.target.value)}
            size="small"
            sx={{ minWidth: isMobile ? '100%' : 150 }}
          />

          {activeTab === 0 ? (
            <Select
              value={moyenFilter}
              onChange={(e) => setMoyenFilter(e.target.value)}
              displayEmpty
              size="small"
              sx={{ minWidth: isMobile ? '100%' : 150 }}
            >
              <MenuItem value="">Tous les moyens</MenuItem>
              <MenuItem value="mobile">Mobile</MenuItem>
            </Select>
          ) : activeTab === 1 ? (
            <>
              <Select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
                displayEmpty
                size="small"
                sx={{ minWidth: isMobile ? '100%' : 150 }}
              >
                <MenuItem value="">Tous les statuts</MenuItem>
                <MenuItem value="success">Réussi</MenuItem>
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="failed">Échoué</MenuItem>
              </Select>
              <Select
                value={operateurFilter}
                onChange={(e) => setOperateurFilter(e.target.value)}
                displayEmpty
                size="small"
                sx={{ minWidth: isMobile ? '100%' : 150 }}
              >
                <MenuItem value="">Tous les opérateurs</MenuItem>
                <MenuItem value="mpesa">M-Pesa</MenuItem>
                <MenuItem value="airtel">Airtel Money</MenuItem>
                <MenuItem value="orange">Orange Money</MenuItem>
              </Select>
              <TextField
                label="Carte RFID"
                value={searchRFID}
                onChange={(e) => setSearchRFID(e.target.value)}
                size="small"
                sx={{ minWidth: isMobile ? '100%' : 150 }}
              />
            </>
          ) : (
            <>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                displayEmpty
                size="small"
                sx={{ minWidth: isMobile ? '100%' : 150 }}
              >
                <MenuItem value="">Tous les types</MenuItem>
                <MenuItem value="RFID">RFID</MenuItem>
                <MenuItem value="Code d'accès">Code d'Accès</MenuItem>
              </Select>
              <TextField
                label="Compteur"
                value={searchCompteur}
                onChange={(e) => setSearchCompteur(e.target.value)}
                size="small"
                sx={{ minWidth: isMobile ? '100%' : 150 }}
              />
              <TextField
                label="Carte RFID"
                value={searchRFID}
                onChange={(e) => setSearchRFID(e.target.value)}
                size="small"
                sx={{ minWidth: isMobile ? '100%' : 150 }}
              />
              <TextField
                label="Code d'Accès"
                value={searchAccessCode}
                onChange={(e) => setSearchAccessCode(e.target.value)}
                size="small"
                sx={{ minWidth: isMobile ? '100%' : 150 }}
              />
            </>
          )}

          <Button
            variant="outlined"
            onClick={resetAllFilters}
            sx={{ minWidth: isMobile ? '100%' : 'auto' }}
          >
            Réinitialiser
          </Button>
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
                  icon={<img alt="Profit" src="/assets/icons/glass/ic-glass-profit.svg" />}
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
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item, index) => {
                        if (isRecharge(item)) {
                          const recharge = item;
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="p-2 border-b">{formatDate(recharge.Date)}</td>
                              <td className="p-2 border-b">{recharge.Utilisateur}</td>
                              <td className="p-2 border-b">{recharge.Telephone}</td>
                              <td className="p-2 border-b">{recharge["Carte RFID"] || "-"}</td>
                              <td className="p-2 border-b">{recharge.Litre.toFixed(1)} L</td>
                              <td className="p-2 border-b">
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                  {recharge.Moyen}
                                </span>
                              </td>
                              <td className="p-2 border-b text-center">
                                <IconButton onClick={(e) => handleMenuOpen(e, recharge, 'recharge')}>
                                  <Iconify icon="eva:more-vertical-fill" />
                                </IconButton>
                              </td>
                            </tr>
                          );
                        }
                        return null;
                      })
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
                      <th className="p-2 border-b">Transaction ID</th>
                      <th className="p-2 border-b text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item) => {
                        if (isPaiement(item)) {
                          const paiement = item;
                          return (
                            <tr key={paiement.id} className="hover:bg-gray-50">
                              <td className="p-2 border-b">{formatDate(paiement.created_at)}</td>
                              <td className="p-2 border-b">
                                {paiement.utilisateur_nom || 'N/A'}
                                {paiement.utilisateur_email && (
                                  <div className="text-xs text-gray-500">{paiement.utilisateur_email}</div>
                                )}
                              </td>
                              <td className="p-2 border-b">{paiement.telephone}</td>
                              <td className="p-2 border-b">{paiement.rfid_uid || 'Aucune'}</td>
                              <td className="p-2 border-b">{paiement.operateur}</td>
                              <td className="p-2 border-b">{paiement.montant} FC</td>
                              <td className="p-2 border-b">{paiement.litres_credite} L</td>
                              <td className="p-2 border-b">
                                <Chip
                                  label={getStatusText(paiement.statut)}
                                  color={getStatusColor(paiement.statut) as any}
                                  size="small"
                                />
                              </td>
                              <td className="p-2 border-b">{paiement.id_transaction_ext}</td>
                              <td className="p-2 border-b text-center">
                                <IconButton onClick={(e) => handleMenuOpen(e, paiement, 'paiement')}>
                                  <Iconify icon="eva:more-vertical-fill" />
                                </IconButton>
                              </td>
                            </tr>
                          );
                        }
                        return null;
                      })
                    ) : (
                      <tr>
                        <td colSpan={10} className="text-center text-gray-500 py-6">
                          Aucun paiement trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full border-collapse min-w-[1400px]">
                  <thead>
                    <tr className="bg-gray-100 text-left text-sm">
                      <th className="p-2 border-b">ID</th>
                      <th className="p-2 border-b">Date</th>
                      <th className="p-2 border-b">Compteur</th>
                      <th className="p-2 border-b">Litres</th>
                      <th className="p-2 border-b">Prix</th>
                      <th className="p-2 border-b">Commission</th>
                      <th className="p-2 border-b">Type</th>
                      <th className="p-2 border-b">Utilisateur</th>
                      <th className="p-2 border-b">Téléphone</th>
                      <th className="p-2 border-b">Code Accès</th>
                      <th className="p-2 border-b">UID RFID</th>
                      <th className="p-2 border-b text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item) => {
                        if (isConsommation(item)) {
                          const consommation = item;
                          return (
                            <tr key={consommation.id} className="hover:bg-gray-50">
                              <td className="p-2 border-b">{consommation.id}</td>
                              <td className="p-2 border-b">{formatDate(consommation.date)}</td>
                              <td className="p-2 border-b">
                                {consommation.compteur_nom}
                                <div className="text-xs text-gray-500">{consommation.compteur_code_serie}</div>
                              </td>
                              <td className="p-2 border-b">{consommation.litres} L</td>
                              <td className="p-2 border-b">{formatCurrency(consommation.prix || 0)} FC</td>
                              <td className="p-2 border-b">{formatCurrency(consommation.commission || 0)} FC</td>
                              <td className="p-2 border-b">
                                <Chip
                                  label={consommation.type}
                                  color={getTypeColor(consommation.type) as any}
                                  size="small"
                                />
                              </td>
                              <td className="p-2 border-b">
                                {consommation.utilisateur_nom || "Anonyme"}
                                {consommation.utilisateur_email && (
                                  <div className="text-xs text-gray-500">{consommation.utilisateur_email}</div>
                                )}
                              </td>
                              <td className="p-2 border-b">{consommation.utilisateur_telephone || "N/A"}</td>
                              <td className="p-2 border-b">
                                {consommation.access_code ? (
                                  <Chip
                                    label={consommation.access_code}
                                    color={consommation.access_code_status === "valide" ? "success" : "default"}
                                    size="small"
                                  />
                                ) : (
                                  "N/A"
                                )}
                              </td>
                              <td className="p-2 border-b">{consommation.rfid_uid || "N/A"}</td>
                              <td className="p-2 border-b text-center">
                                <IconButton onClick={(e) => handleMenuOpen(e, consommation, 'consommation')}>
                                  <Iconify icon="eva:more-vertical-fill" />
                                </IconButton>
                              </td>
                            </tr>
                          );
                        }
                        return null;
                      })
                    ) : (
                      <tr>
                        <td colSpan={12} className="text-center text-gray-500 py-6">
                          Aucune consommation trouvée
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* Pagination */}
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
                  {`Affichage de ${paginatedData.length} sur ${totalItems} ${activeTab === 0 ? 'recharges' :
                    activeTab === 1 ? 'paiements' :
                      'consommations'
                    }`}
                </Typography>
                <Pagination
                  count={Math.ceil(totalItems / pageSize)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
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

      {/* Dialog Détails */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>
          Détails {itemType === 'recharge' ? 'de la recharge' : itemType === 'paiement' ? 'du paiement' : 'de la consommation'}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {selectedItem && itemType === 'recharge' && isRecharge(selectedItem) && (
            <>
              <Typography><strong>Date:</strong> {formatDate(selectedItem.Date)}</Typography>
              <Typography><strong>Utilisateur:</strong> {selectedItem.Utilisateur}</Typography>
              <Typography><strong>Téléphone:</strong> {selectedItem.Telephone}</Typography>
              <Typography><strong>Carte RFID:</strong> {selectedItem["Carte RFID"] || "Non utilisée"}</Typography>
              <Typography><strong>Litres:</strong> {selectedItem.Litre.toFixed(1)} L</Typography>
              <Typography><strong>Moyen de paiement:</strong> {selectedItem.Moyen}</Typography>
            </>
          )}

          {selectedItem && itemType === 'paiement' && isPaiement(selectedItem) && (
            <>
              <Typography><strong>Date:</strong> {formatDate(selectedItem.created_at)}</Typography>
              <Typography><strong>Utilisateur:</strong> {selectedItem.utilisateur_nom || 'N/A'}</Typography>
              <Typography><strong>Email:</strong> {selectedItem.utilisateur_email || 'N/A'}</Typography>
              <Typography><strong>Téléphone utilisateur:</strong> {selectedItem.utilisateur_telephone || 'N/A'}</Typography>
              <Typography><strong>Téléphone de paiement:</strong> {selectedItem.telephone}</Typography>
              <Typography><strong>Carte RFID:</strong> {selectedItem.rfid_uid || 'Aucune carte'}</Typography>
              <Typography><strong>Opérateur:</strong> {selectedItem.operateur}</Typography>
              <Typography><strong>Montant:</strong> {selectedItem.montant} FC</Typography>
              <Typography><strong>Litres crédités:</strong> {selectedItem.litres_credite} L</Typography>
              <Typography><strong>Statut:</strong>
                <Chip
                  label={getStatusText(selectedItem.statut)}
                  color={getStatusColor(selectedItem.statut) as any}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography><strong>ID Transaction:</strong> {selectedItem.id_transaction_ext}</Typography>
              <Typography><strong>Réponse brute:</strong></Typography>
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                <pre>{JSON.stringify(selectedItem.raw_response, null, 2)}</pre>
              </Box>
            </>
          )}

          {selectedItem && itemType === 'consommation' && isConsommation(selectedItem) && (
            <>
              <Typography><strong>ID:</strong> {selectedItem.id}</Typography>
              <Typography><strong>Date:</strong> {formatDate(selectedItem.date)}</Typography>
              <Typography><strong>Compteur:</strong> {selectedItem.compteur_nom} ({selectedItem.compteur_code_serie})</Typography>
              <Typography><strong>Litres consommés:</strong> {selectedItem.litres} L</Typography>
              <Typography><strong>Prix:</strong> {formatCurrency(selectedItem.prix || 0)} FC</Typography>
              <Typography><strong>Commission:</strong> {formatCurrency(selectedItem.commission || 0)} FC</Typography>
              <Typography><strong>Type:</strong>
                <Chip
                  label={selectedItem.type}
                  color={getTypeColor(selectedItem.type) as any}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>

              <Typography variant="h6" sx={{ mt: 2 }}>Informations Utilisateur</Typography>
              <Typography><strong>Nom:</strong> {selectedItem.utilisateur_nom || "Anonyme"}</Typography>
              <Typography><strong>Email:</strong> {selectedItem.utilisateur_email || "Non disponible"}</Typography>
              <Typography><strong>Téléphone:</strong> {selectedItem.utilisateur_telephone || "Non disponible"}</Typography>

              {selectedItem.type === "RFID" ? (
                <>
                  <Typography variant="h6" sx={{ mt: 2 }}>Informations RFID</Typography>
                  <Typography><strong>UID RFID:</strong> {selectedItem.rfid_uid || "Non disponible"}</Typography>
                  <Typography><strong>Téléphone RFID:</strong> {selectedItem.rfid_telephone || "Non disponible"}</Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" sx={{ mt: 2 }}>Informations Code d'Accès</Typography>
                  <Typography><strong>Code:</strong> {selectedItem.access_code || "Non disponible"}</Typography>
                  <Typography><strong>Statut:</strong> {selectedItem.access_code_status || "Non disponible"}</Typography>
                  <Typography><strong>Litres demandés:</strong> {selectedItem.access_code_litres_demandes || 0} L</Typography>
                  <Typography><strong>Créé le:</strong> {selectedItem.access_code_created_at ? formatDate(selectedItem.access_code_created_at) : "Non disponible"}</Typography>
                  <Typography><strong>Expire le:</strong> {selectedItem.access_code_expire_at ? formatDate(selectedItem.access_code_expire_at) : "Non disponible"}</Typography>

                  {selectedItem.access_code_compteur_nom && (
                    <Typography><strong>Compteur cible:</strong> {selectedItem.access_code_compteur_nom} ({selectedItem.access_code_compteur_code_serie})</Typography>
                  )}
                </>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}