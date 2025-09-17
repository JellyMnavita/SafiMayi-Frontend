import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import {
  Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress,
  Pagination, IconButton, Menu, MenuList, MenuItem as MenuItemMui,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tabs, Tab
} from "@mui/material";

import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";
import { AnalyticsWidgetSummary } from "../analytics-widget-summary";
import useMediaQuery from '@mui/material/useMediaQuery';

interface Recharge {
  Date: string;
  Utilisateur: string;
  "Carte RFID": string | null;
  Litre: number;
  Telephone: string;
  Moyen: string;
}

interface Paiement {
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

  // Menu actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<Recharge | Paiement | null>(null);
  const [itemType, setItemType] = useState<'recharge' | 'paiement' | null>(null);

  // Dialog pour voir les détails
  const [openDialog, setOpenDialog] = useState(false);

  // Configuration du Slider
  const sliderSettings = {
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, item: Recharge | Paiement, type: 'recharge' | 'paiement') => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
    setItemType(type);
  };

  const handleMenuClose = () => setAnchorEl(null);

  // Charger les recharges
  const fetchRecharges = async () => {
    try {
      setLoadingRecharges(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `https://safimayi-backend.onrender.com/api/litrages/all-recharges/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `https://safimayi-backend.onrender.com/api/paiements/all/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAllPaiements(response.data.paiements);
      setPaiements(response.data.paiements);
      setStatsPaiements(response.data.statistiques || {});
    } catch (error) {
      console.error("Erreur lors du chargement des paiements :", error);
    } finally {
      setLoadingPaiements(false);
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
      fetchRecharges();
    } else {
      fetchPaiements();
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

  // Pagination locale
  const getPaginatedData = () => {
    if (activeTab === 0) {
      return recharges.slice((page - 1) * pageSize, page * pageSize);
    } else {
      return paiements.slice((page - 1) * pageSize, page * pageSize);
    }
  };

  const paginatedData = getPaginatedData();
  const totalItems = activeTab === 0 ? recharges.length : paiements.length;

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setPage(1);
    // Réinitialiser les filtres spécifiques
    setMoyenFilter("");
    setStatutFilter("");
    setOperateurFilter("");
    setSearchRFID("");
  };

  const resetAllFilters = () => {
    setSearchUtilisateur("");
    setSearchTelephone("");
    setMoyenFilter("");
    setStatutFilter("");
    setOperateurFilter("");
    setSearchRFID("");
  };

  const refreshData = () => {
    if (activeTab === 0) {
      fetchRecharges();
    } else {
      fetchPaiements();
    }
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
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Journal des Recharges" />
          <Tab label="Journal des Paiements" />
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
          />
          <TextField
            label="Téléphone"
            value={searchTelephone}
            onChange={(e) => setSearchTelephone(e.target.value)}
            size="small"
          />

          {activeTab === 0 ? (
            <Select
              value={moyenFilter}
              onChange={(e) => setMoyenFilter(e.target.value)}
              displayEmpty
              size="small"
            >
              <MenuItem value="">Tous les moyens</MenuItem>
              <MenuItem value="mobile">Mobile</MenuItem>
              <MenuItem value="carte">Carte RFID</MenuItem>
            </Select>
          ) : (
            <>
              <Select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
                displayEmpty
                size="small"
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
              />
            </>
          )}

          <Button
            variant="outlined"
            onClick={resetAllFilters}
          >
            Réinitialiser
          </Button>
        </Box>
      </Card>

      {/* Statistiques des paiements avec Slider */}
      {activeTab === 1 && (
        <Box sx={{ mb: 3 }}>
          <Slider {...sliderSettings}>
            <div>
              <AnalyticsWidgetSummary
                title="Montant Total"
                total={statsPaiements.montant_total || 0}
                color="primary"
                suffix=" FC"
                isCurrency={true}
                icon={<img alt="Revenue" src="/assets/icons/glass/ic-glass-buy.svg" />}
              />
            </div>
            <div>
              <AnalyticsWidgetSummary
                title="Litres Total"
                total={statsPaiements.litres_total || 0}
                color="success"
                suffix=" L"
                icon={<img alt="Water" src="/assets/icons/glass/ic-glass-message.svg" />}
              />
            </div>
            <div>
              <AnalyticsWidgetSummary
                title="Paiements Réussis"
                total={statsPaiements.reussis || 0}
                color="success"
                icon={<img alt="Success" src="/assets/icons/glass/ic-glass-checkmark.svg" />}
              />
            </div>
            <div>
              <AnalyticsWidgetSummary
                title="En Attente"
                total={statsPaiements.en_attente || 0}
                color="warning"
                icon={<img alt="Pending" src="/assets/icons/glass/ic-glass-clock.svg" />}
              />
            </div>
            <div>
              <AnalyticsWidgetSummary
                title="Échoués"
                total={statsPaiements.echecs || 0}
                color="error"
                icon={<img alt="Failed" src="/assets/icons/glass/ic-glass-close.svg" />}
              />
            </div>
            <div>
              <AnalyticsWidgetSummary
                title="Total Paiements"
                total={statsPaiements.total || 0}
                color="info"
                icon={<img alt="Total" src="/assets/icons/glass/ic-glass-bag.svg" />}
              />
            </div>
          </Slider>
        </Box>
      )}

      {/* Tableau */}
      <Card>
        <div className="p-4 bg-white shadow-md rounded-md overflow-x-auto">
          {((activeTab === 0 && loadingRecharges) || (activeTab === 1 && loadingPaiements)) ? (
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
                      paginatedData.map((recharge, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-2 border-b">{formatDate((recharge as Recharge).Date)}</td>
                          <td className="p-2 border-b">{(recharge as Recharge).Utilisateur}</td>
                          <td className="p-2 border-b">{(recharge as Recharge).Telephone}</td>
                          <td className="p-2 border-b">{(recharge as Recharge)["Carte RFID"] || "-"}</td>
                          <td className="p-2 border-b">{(recharge as Recharge).Litre.toFixed(1)} L</td>
                          <td className="p-2 border-b">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                              {(recharge as Recharge).Moyen}
                            </span>
                          </td>
                          <td className="p-2 border-b text-center">
                            <IconButton onClick={(e) => handleMenuOpen(e, recharge, 'recharge')}>
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
              ) : (
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
                      paginatedData.map((paiement) => (
                        <tr key={(paiement as Paiement).id} className="hover:bg-gray-50">
                          <td className="p-2 border-b">{formatDate((paiement as Paiement).created_at)}</td>
                          <td className="p-2 border-b">
                            {(paiement as Paiement).utilisateur_nom || 'N/A'}
                            {(paiement as Paiement).utilisateur_email && (
                              <div className="text-xs text-gray-500">{(paiement as Paiement).utilisateur_email}</div>
                            )}
                          </td>
                          <td className="p-2 border-b">{(paiement as Paiement).telephone}</td>
                          <td className="p-2 border-b">{(paiement as Paiement).rfid_uid || 'Aucune'}</td>
                          <td className="p-2 border-b">{(paiement as Paiement).operateur}</td>
                          <td className="p-2 border-b">{(paiement as Paiement).montant} FC</td>
                          <td className="p-2 border-b">{(paiement as Paiement).litres_credite} L</td>
                          <td className="p-2 border-b">
                            <Chip
                              label={getStatusText((paiement as Paiement).statut)}
                              color={getStatusColor((paiement as Paiement).statut) as any}
                              size="small"
                            />
                          </td>
                          <td className="p-2 border-b">{(paiement as Paiement).id_transaction_ext}</td>
                          <td className="p-2 border-b text-center">
                            <IconButton onClick={(e) => handleMenuOpen(e, paiement, 'paiement')}>
                              <Iconify icon="eva:more-vertical-fill" />
                            </IconButton>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="text-center text-gray-500 py-6">
                          Aucun paiement trouvé
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
                  {`Affichage de ${paginatedData.length} sur ${totalItems} ${activeTab === 0 ? 'recharges' : 'paiements'}`}
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
          Détails {itemType === 'recharge' ? 'de la recharge' : 'du paiement'}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {selectedItem && itemType === 'recharge' && (
            <>
              <Typography><strong>Date:</strong> {formatDate((selectedItem as Recharge).Date)}</Typography>
              <Typography><strong>Utilisateur:</strong> {(selectedItem as Recharge).Utilisateur}</Typography>
              <Typography><strong>Téléphone:</strong> {(selectedItem as Recharge).Telephone}</Typography>
              <Typography><strong>Carte RFID:</strong> {(selectedItem as Recharge)["Carte RFID"] || "Non utilisée"}</Typography>
              <Typography><strong>Litres:</strong> {(selectedItem as Recharge).Litre.toFixed(1)} L</Typography>
              <Typography><strong>Moyen de paiement:</strong> {(selectedItem as Recharge).Moyen}</Typography>
            </>
          )}

          {selectedItem && itemType === 'paiement' && (
            <>
              <Typography><strong>Date:</strong> {formatDate((selectedItem as Paiement).created_at)}</Typography>
              <Typography><strong>Utilisateur:</strong> {(selectedItem as Paiement).utilisateur_nom || 'N/A'}</Typography>
              <Typography><strong>Email:</strong> {(selectedItem as Paiement).utilisateur_email || 'N/A'}</Typography>
              <Typography><strong>Téléphone utilisateur:</strong> {(selectedItem as Paiement).utilisateur_telephone || 'N/A'}</Typography>
              <Typography><strong>Téléphone de paiement:</strong> {(selectedItem as Paiement).telephone}</Typography>
              <Typography><strong>Carte RFID:</strong> {(selectedItem as Paiement).rfid_uid || 'Aucune carte'}</Typography>
              <Typography><strong>Opérateur:</strong> {(selectedItem as Paiement).operateur}</Typography>
              <Typography><strong>Montant:</strong> {(selectedItem as Paiement).montant} FC</Typography>
              <Typography><strong>Litres crédités:</strong> {(selectedItem as Paiement).litres_credite} L</Typography>
              <Typography><strong>Statut:</strong>
                <Chip
                  label={getStatusText((selectedItem as Paiement).statut)}
                  color={getStatusColor((selectedItem as Paiement).statut) as any}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography><strong>ID Transaction:</strong> {(selectedItem as Paiement).id_transaction_ext}</Typography>
              <Typography><strong>Réponse brute:</strong></Typography>
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, maxHeight: 200, overflow: 'auto' }}>
                <pre>{JSON.stringify((selectedItem as Paiement).raw_response, null, 2)}</pre>
              </Box>
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