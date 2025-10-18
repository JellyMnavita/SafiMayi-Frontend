import React, { useEffect, useState, useCallback } from "react";
import apiClient from "../../../utils/api";
import {
  Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress,
  Pagination, IconButton, Menu, MenuList, MenuItem as MenuItemMui,
  Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, FormControl, InputLabel,
  Chip, Autocomplete, SelectChangeEvent
} from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";

interface Compteur {
  id: number;
  nom: string;
  code_serie: string;
  actif: boolean;
  date_installation: string | null;
  siteforage: number | null;
  user_nom?: string;
  user_email?: string;
  siteforage_nom?: string;
  siteforage_localisation?: string;
  date_creation: string;
  statut?: string;
  user?: number;
}

interface SiteForage {
  id: number;
  nom: string;
  localisation: string;
  type: string;
  taux: string;
  telephone: string;
  description: string;
  latitude: string;
  longitude: string;
  statut: string;
  date_creation: string;
}

interface User {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  role: string;
  state: boolean;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
  page_size: number;
  current_page: number;
  total_pages: number;
}

export function CompteurView() {
  const [compteurs, setCompteurs] = useState<Compteur[]>([]);
  const [sitesForage, setSitesForage] = useState<SiteForage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingSites, setLoadingSites] = useState<boolean>(true);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toggling, setToggling] = useState<number | null>(null);

  // Pagination
  const [pagination, setPagination] = useState<PaginationInfo>({
    count: 0,
    next: null,
    previous: null,
    page_size: 8,
    current_page: 1,
    total_pages: 1
  });

  // Filtres
  const [searchNom, setSearchNom] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [statutFilter, setStatutFilter] = useState<string>("");
  const [selectedSiteForageFilter, setSelectedSiteForageFilter] = useState<SiteForage | null>(null);
  const [selectedUserFilter, setSelectedUserFilter] = useState<User | null>(null);
  const [pageSize, setPageSize] = useState<number>(8);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Recherche pour les filtres
  const [searchSiteForageFilter, setSearchSiteForageFilter] = useState("");
  const [searchUserFilter, setSearchUserFilter] = useState("");

  // Mode création : single | manual | auto
  const [mode, setMode] = useState<"single" | "manual" | "auto">("single");

  // States pour chaque mode
  const [formData, setFormData] = useState<Partial<Compteur>>({});
  const [bulkCompteurs, setBulkCompteurs] = useState<Partial<Compteur>[]>([
    { siteforage: null, actif: true, date_installation: "" }
  ]);
  const [autoForm, setAutoForm] = useState({
    siteforage: null as number | null,
    date_installation: "",
    code_start: "",
    code_end: ""
  });

  // Recherche utilisateur
  const [searchUser, setSearchUser] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Recherche site forage
  const [searchSiteForage, setSearchSiteForage] = useState("");
  const [selectedSiteForage, setSelectedSiteForage] = useState<SiteForage | null>(null);

  // Menu actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCompteur, setSelectedCompteur] = useState<Compteur | null>(null);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, compteur: Compteur) => {
    setAnchorEl(event.currentTarget);
    setSelectedCompteur(compteur);
  };
  const handleMenuClose = () => setAnchorEl(null);

  // Charger les compteurs avec pagination et filtres
  const fetchCompteurs = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      // Ajouter les filtres seulement s'ils sont définis
      if (searchNom) params.append('search', searchNom);
      if (statusFilter) params.append('actif', statusFilter);
      if (statutFilter) params.append('statut', statutFilter);
      if (selectedSiteForageFilter) params.append('siteforage', selectedSiteForageFilter.id.toString());
      if (selectedUserFilter) params.append('user_id', selectedUserFilter.id.toString());

      const response = await apiClient.get(`/api/compteur/list-compteur-pagination?${params}`);
      const data = response.data;
      
      setCompteurs(data.results || []);
      setPagination({
        count: data.count || 0,
        next: data.next || null,
        previous: data.previous || null,
        page_size: data.page_size || pageSize,
        current_page: page,
        total_pages: Math.ceil((data.count || 0) / pageSize)
      });
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    } finally {
      setLoading(false);
    }
  }, [searchNom, statusFilter, statutFilter, selectedSiteForageFilter, selectedUserFilter, pageSize]);

  // Charger les sites de forage par défaut
  const fetchDefaultSitesForage = async () => {
    try {
      setLoadingSites(true);
      const response = await apiClient.get(`/api/siteforage/search-pagination/?page_size=10`);
      setSitesForage(response.data.results || []);
    } catch (error) {
      console.error("Erreur lors du chargement des sites de forage :", error);
      setSitesForage([]);
    } finally {
      setLoadingSites(false);
    }
  };

  // Recherche de sites de forage avec debounce
  const searchSitesForage = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      fetchDefaultSitesForage();
      return;
    }

    try {
      setLoadingSites(true);
      const response = await apiClient.get(
        `/api/siteforage/search-pagination/?search=${encodeURIComponent(searchTerm)}&page_size=10`
      );
      setSitesForage(response.data.results || []);
    } catch (error) {
      console.error("Erreur lors de la recherche des sites de forage :", error);
      setSitesForage([]);
    } finally {
      setLoadingSites(false);
    }
  }, []);

  // Charger les utilisateurs "owner" par défaut
  const fetchDefaultUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await apiClient.get(`/api/users/search/?role=owner&page_size=10`);
      setUsers(response.data.results || []);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs :", error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Recherche d'utilisateurs "owner" avec debounce
  const searchUsers = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      fetchDefaultUsers();
      return;
    }

    try {
      setLoadingUsers(true);
      const response = await apiClient.get(
        `/api/users/search/?search=${encodeURIComponent(searchTerm)}&role=owner&page_size=10`
      );
      setUsers(response.data.results || []);
    } catch (err) {
      console.error("Erreur lors de la recherche d'utilisateurs:", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    fetchCompteurs(1);
    fetchDefaultSitesForage();
    fetchDefaultUsers();
  }, [fetchCompteurs]);

  // Recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCompteurs(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchNom, statusFilter, statutFilter, selectedSiteForageFilter, selectedUserFilter, pageSize, fetchCompteurs]);

  // Recherche utilisateur avec debounce (pour le formulaire)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchUser.trim() === "") {
        fetchDefaultUsers();
      } else {
        searchUsers(searchUser);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchUser, searchUsers]);

  // Recherche site forage avec debounce (pour le formulaire)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchSiteForage.trim() === "") {
        fetchDefaultSitesForage();
      } else {
        searchSitesForage(searchSiteForage);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchSiteForage, searchSitesForage]);

  // Recherche site forage avec debounce (pour les filtres)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchSiteForageFilter.trim() === "") {
        fetchDefaultSitesForage();
      } else {
        searchSitesForage(searchSiteForageFilter);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchSiteForageFilter, searchSitesForage]);

  // Recherche utilisateur avec debounce (pour les filtres)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchUserFilter.trim() === "") {
        fetchDefaultUsers();
      } else {
        searchUsers(searchUserFilter);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchUserFilter, searchUsers]);

  // Lors de l'ouverture du dialog, charger le site forage sélectionné si en mode édition
  useEffect(() => {
    if (openDialog && formData.id && formData.siteforage) {
      const site = sitesForage.find(s => s.id === formData.siteforage);
      if (site) {
        setSelectedSiteForage(site);
      }
    }
  }, [openDialog, formData.id, formData.siteforage, sitesForage]);

  // Lors de l'ouverture du dialog, charger l'utilisateur sélectionné si en mode édition
  useEffect(() => {
    if (openDialog && formData.id && formData.user) {
      const user = users.find(u => u.id === formData.user);
      if (user) {
        setSelectedUser(user);
      }
    }
  }, [openDialog, formData.id, formData.user, users]);

  // Changement de page
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    fetchCompteurs(value);
  };

  // Changement de la taille de page
  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newSize = typeof event.target.value === 'string' ? parseInt(event.target.value) : event.target.value;
    setPageSize(newSize);
  };

  // Sauvegarde (création / update)
  const handleSave = async () => {
    try {
      setSubmitting(true);

      if (formData.id) {
        // Update
        await apiClient.put(
          `/api/compteur/${formData.id}/`,
          formData
        );
      } else if (mode === "manual") {
        // Création multiple manuelle
        await apiClient.post(
          `/api/compteur/`,
          bulkCompteurs
        );
      } else if (mode === "auto") {
        // Création automatique côté frontend
        const { siteforage, date_installation, code_start, code_end } = autoForm;
        const start = parseInt(code_start, 10);
        const end = parseInt(code_end, 10);

        if (isNaN(start) || isNaN(end) || end < start) {
          alert("Veuillez entrer un intervalle valide de codes.");
          setSubmitting(false);
          return;
        }

        const generatedCompteurs = [];
        for (let i = start; i <= end; i++) {
          generatedCompteurs.push({
            siteforage: siteforage,
            date_installation: date_installation || null,
            actif: false,
          });
        }

        await apiClient.post(
          `/api/compteur/`,
          generatedCompteurs
        );
      } else {
        // Création simple
        await apiClient.post(
          `/api/compteur/`,
          formData
        );
      }

      fetchCompteurs(pagination.current_page);
      setOpenDialog(false);
      setFormData({});
      setSelectedUser(null);
      setSelectedSiteForage(null);
      setBulkCompteurs([{ siteforage: null, actif: true, date_installation: "" }]);
      setAutoForm({ siteforage: null, date_installation: "", code_start: "", code_end: "" });
      setMode("single");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
      alert("Erreur lors de la sauvegarde du compteur");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle activation
  const handleToggleActivation = async (id: number) => {
    try {
      setToggling(id);
      await apiClient.post(
        `/api/compteur/toggle-activation/${id}/`,
        {}
      );
      fetchCompteurs(pagination.current_page);
    } catch (error) {
      console.error("Erreur lors du changement d'état :", error);
      alert("Erreur lors de la modification du statut du compteur");
    } finally {
      setToggling(null);
    }
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchNom("");
    setStatusFilter("");
    setStatutFilter("");
    setSelectedSiteForageFilter(null);
    setSelectedUserFilter(null);
    setSearchSiteForageFilter("");
    setSearchUserFilter("");
    setPageSize(8);
  };

  return (
    <DashboardContent>
      {/* Titre et bouton d'ajout */}
      <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Compteurs ({pagination.count})
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => {
            setFormData({});
            setSelectedUser(null);
            setSelectedSiteForage(null);
            setMode("single");
            setOpenDialog(true);
          }}
        >
          Ajouter un compteur
        </Button>
      </Box>

      {/* Filtres optimisés */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Ligne principale - Filtres essentiels */}
          <Box sx={{ 
            display: "flex", 
            gap: 2, 
            flexWrap: "wrap", 
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            {/* Recherche principale */}
            <TextField
              label="Rechercher un compteur"
              value={searchNom}
              onChange={(e) => setSearchNom(e.target.value)}
              size="small"
              placeholder="Code série, site, propriétaire..."
              sx={{ minWidth: 250, flexGrow: 1 }}
            />
            
            {/* Filtres rapides */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statutFilter}
                  label="Statut"
                  onChange={(e) => setStatutFilter(e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="stock">En stock</MenuItem>
                  <MenuItem value="installe">Installé</MenuItem>
                  <MenuItem value="en panne">En panne</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Actif</InputLabel>
                <Select
                  value={statusFilter}
                  label="Actif"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="true">Oui</MenuItem>
                  <MenuItem value="false">Non</MenuItem>
                </Select>
              </FormControl>

              {/* Bouton filtres avancés */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon={showAdvancedFilters ? "mingcute:close-line" : "ic:round-filter-list"} />}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {showAdvancedFilters ? "Masquer" : "Plus de filtres"}
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={handleResetFilters}
                startIcon={<Iconify icon="solar:restart-bold" />}
              >
                Réinitialiser
              </Button>
            </Box>
          </Box>

          {/* Filtres avancés - conditionnel */}
          {showAdvancedFilters && (
            <Box 
              sx={{ 
                display: "flex", 
                gap: 2, 
                flexWrap: "wrap", 
                alignItems: "center",
                pt: 2,
                borderTop: 1,
                borderColor: 'divider'
              }}
            >
              {/* Filtre Site Forage compact */}
              <Autocomplete
                size="small"
                options={sitesForage}
                getOptionLabel={(site) => `${site.nom}`}
                value={selectedSiteForageFilter}
                onChange={(_, newValue) => {
                  setSelectedSiteForageFilter(newValue);
                }}
                onInputChange={(_, newInputValue) => {
                  setSearchSiteForageFilter(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Site forage"
                    placeholder="Rechercher un site..."
                    sx={{ minWidth: 180 }}
                  />
                )}
                loading={loadingSites}
              />

              {/* Filtre Propriétaire compact */}
              <Autocomplete
                size="small"
                options={users}
                getOptionLabel={(user) => `${user.nom}`}
                value={selectedUserFilter}
                onChange={(_, newValue) => {
                  setSelectedUserFilter(newValue);
                }}
                onInputChange={(_, newInputValue) => {
                  setSearchUserFilter(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Propriétaire"
                    placeholder="Rechercher..."
                    sx={{ minWidth: 180 }}
                  />
                )}
                loading={loadingUsers}
              />

              {/* Sélection du nombre d'éléments par page */}
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Par page</InputLabel>
                <Select
                  value={pageSize}
                  label="Par page"
                  onChange={handlePageSizeChange}
                >
                  <MenuItem value={8}>8</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Indicateur de filtres actifs */}
          {(selectedSiteForageFilter || selectedUserFilter || statutFilter || statusFilter) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="body2" color="text.secondary">
                Filtres actifs:
              </Typography>
              {selectedSiteForageFilter && (
                <Chip 
                  size="small"
                  label={`Site: ${selectedSiteForageFilter.nom}`}
                  onDelete={() => setSelectedSiteForageFilter(null)}
                />
              )}
              {selectedUserFilter && (
                <Chip 
                  size="small"
                  label={`Propriétaire: ${selectedUserFilter.nom}`}
                  onDelete={() => setSelectedUserFilter(null)}
                />
              )}
              {statutFilter && (
                <Chip 
                  size="small"
                  label={`Statut: ${statutFilter}`}
                  onDelete={() => setStatutFilter("")}
                />
              )}
              {statusFilter && (
                <Chip 
                  size="small"
                  label={`Actif: ${statusFilter === "true" ? "Oui" : "Non"}`}
                  onDelete={() => setStatusFilter("")}
                />
              )}
            </Box>
          )}
        </Box>
      </Card>

      {/* Pagination en haut */}
      {pagination.total_pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Page {pagination.current_page} sur {pagination.total_pages} 
            ({pagination.count} compteurs au total)
          </Typography>
          <Pagination 
            count={pagination.total_pages} 
            page={pagination.current_page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Tableau des compteurs */}
      <Card>
        <div className="p-4 bg-white shadow-md rounded-md overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <CircularProgress />
            </div>
          ) : (
            <>
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm">
                    <th className="p-3 border-b font-semibold">Code série</th>
                    <th className="p-3 border-b font-semibold">Site forage</th>
                    <th className="p-3 border-b font-semibold">Propriétaire</th>
                    <th className="p-3 border-b font-semibold">Statut</th>
                    <th className="p-3 border-b font-semibold">Date installation</th>
                    <th className="p-3 border-b font-semibold">Actif</th>
                    <th className="p-3 border-b font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {compteurs.length > 0 ? (
                    compteurs.map((compteur) => (
                      <tr 
                        key={compteur.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setFormData(compteur);
                          setOpenDialog(true);
                          setMode("single");
                        }}
                      >
                        <td className="p-3 border-b">
                          <Box sx={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: 1,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: '#0486d9',
                            color: 'white'
                          }}>
                            <Typography variant="body2" fontWeight="bold">
                              {compteur.code_serie || "N/A"}
                            </Typography>
                          </Box>
                        </td>
                        <td className="p-3 border-b">
                          {compteur.siteforage_nom ? (
                            <Chip 
                              label={compteur.siteforage_nom} 
                              size="small" 
                              variant="outlined"
                              color="primary"
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </td>
                        <td className="p-3 border-b">
                          {compteur.user_nom ? (
                            <Chip 
                              label={compteur.user_nom} 
                              size="small" 
                              variant="outlined"
                              color="secondary"
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </td>
                        <td className="p-3 border-b">
                          <Chip 
                            label={compteur.statut || 'Non défini'} 
                            size="small"
                            color={
                              compteur.statut === 'installe' ? 'success' :
                              compteur.statut === 'en panne' ? 'error' : 'default'
                            }
                            variant="filled"
                          />
                        </td>
                        <td className="p-3 border-b">
                          <Typography variant="body2">
                            {compteur.date_installation ? 
                              new Date(compteur.date_installation).toLocaleDateString() : 
                              "Non installé"
                            }
                          </Typography>
                        </td>
                        <td className="p-3 border-b">
                          {compteur.actif ? (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                              Actif
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                              Désactivé
                            </span>
                          )}
                        </td>
                        <td className="p-3 border-b text-center">
                          <IconButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuOpen(e, compteur);
                            }} 
                            size="small"
                            disabled={toggling === compteur.id}
                          >
                            {toggling === compteur.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <Iconify icon="eva:more-vertical-fill" />
                            )}
                          </IconButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-gray-500 py-6">
                        <Typography variant="h6" color="text.secondary">
                          Aucun compteur trouvé
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Essayez de modifier vos critères de recherche
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination en bas */}
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
                <Typography variant="body2" color="text.secondary">
                  {`Affichage de ${compteurs.length} sur ${pagination.count} compteurs`}
                </Typography>
                <Pagination
                  count={pagination.total_pages}
                  page={pagination.current_page}
                  onChange={handlePageChange}
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
              setFormData(selectedCompteur || {});
              setOpenDialog(true);
              handleMenuClose();
              setMode("single");
            }}
          >
            Configurer
          </MenuItemMui>
          <MenuItemMui
            onClick={() => {
              if (selectedCompteur) handleToggleActivation(selectedCompteur.id);
              handleMenuClose();
            }}
            disabled={toggling === selectedCompteur?.id}
          >
            {toggling === selectedCompteur?.id ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <span>Chargement...</span>
              </Box>
            ) : (
              selectedCompteur?.actif ? "Désactiver" : "Activer"
            )}
          </MenuItemMui>
        </MenuList>
      </Menu>

      {/* Dialog Ajout / Édition */}
      <Dialog open={openDialog} onClose={() => {
        if (!submitting) {
          setOpenDialog(false);
          setFormData({});
          setSelectedUser(null);
          setSelectedSiteForage(null);
          setMode("single");
        }
      }} fullWidth maxWidth="sm">
        <DialogTitle>
          {formData.id ? "Éditer le compteur" : "Nouveau compteur"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Tabs value={mode} onChange={(e, v) => setMode(v)}>
            <Tab label="Simple" value="single" />
            {!formData.id && <Tab label="Multiple" value="manual" />}
            {!formData.id && <Tab label="Auto" value="auto" />}
          </Tabs>

          {mode === "single" && (
            <>
              {/* Sélection du propriétaire avec recherche debounce */}
              <Autocomplete
                options={users}
                getOptionLabel={(user) => `${user.nom} - ${user.email || user.telephone}`}
                value={selectedUser}
                onChange={(_, newValue) => {
                  setSelectedUser(newValue);
                  setFormData({
                    ...formData,
                    user: newValue?.id || undefined
                  });
                }}
                onInputChange={(_, newInputValue) => {
                  setSearchUser(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Propriétaire du compteur"
                    placeholder="Rechercher un propriétaire..."
                    helperText="Seuls les utilisateurs avec le rôle 'owner' sont affichés"
                  />
                )}
                loading={loadingUsers}
              />

              {/* Sélection du site de forage avec recherche debounce */}
              <Autocomplete
                options={sitesForage}
                getOptionLabel={(site) => `${site.nom} - ${site.localisation} (${site.type})`}
                value={selectedSiteForage}
                onChange={(_, newValue) => {
                  setSelectedSiteForage(newValue);
                  setFormData({
                    ...formData,
                    siteforage: newValue?.id || null
                  });
                }}
                onInputChange={(_, newInputValue) => {
                  setSearchSiteForage(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Site de forage"
                    placeholder="Rechercher un site de forage..."
                    helperText="Tapez au moins 2 caractères pour rechercher"
                  />
                )}
                loading={loadingSites}
              />

              <TextField
                label="Date d'installation"
                type="date"
                value={formData.date_installation || ""}
                onChange={(e) => setFormData({ ...formData, date_installation: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={submitting}
              />
            </>
          )}

          {mode === "manual" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {(bulkCompteurs || []).map((item, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", gap: 2, alignItems: "center" }}
                >
                  {/* Site de forage avec recherche pour chaque compteur en mode multiple */}
                  <Autocomplete
                    options={sitesForage}
                    getOptionLabel={(site) => `${site.nom} - ${site.localisation}`}
                    value={sitesForage.find(site => site.id === item.siteforage) || null}
                    onChange={(_, newValue) => {
                      const newList = [...bulkCompteurs];
                      newList[index] = { 
                        ...newList[index], 
                        siteforage: newValue?.id || null
                      };
                      setBulkCompteurs(newList);
                    }}
                    onInputChange={(_, newInputValue) => {
                      setSearchSiteForage(newInputValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Site de forage"
                        placeholder="Rechercher un site..."
                        size="small"
                      />
                    )}
                    loading={loadingSites}
                    fullWidth
                  />
                  <IconButton
                    color="error"
                    onClick={() => {
                      const newList = bulkCompteurs.filter((_, i) => i !== index);
                      setBulkCompteurs(newList);
                    }}
                    disabled={submitting}
                    size="small"
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Box>
              ))}

              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  setBulkCompteurs([
                    ...bulkCompteurs,
                    { siteforage: null, actif: true },
                  ])
                }
                disabled={submitting}
              >
                + Ajouter un compteur
              </Button>
            </Box>
          )}

          {mode === "auto" && (
            <>
              {/* Site de forage avec recherche pour le mode auto */}
              <Autocomplete
                options={sitesForage}
                getOptionLabel={(site) => `${site.nom} - ${site.localisation}`}
                value={sitesForage.find(site => site.id === autoForm.siteforage) || null}
                onChange={(_, newValue) => {
                  setAutoForm({
                    ...autoForm,
                    siteforage: newValue?.id || null
                  });
                }}
                onInputChange={(_, newInputValue) => {
                  setSearchSiteForage(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Site de forage"
                    placeholder="Rechercher un site de forage..."
                    helperText="Site où seront installés les compteurs"
                  />
                )}
                loading={loadingSites}
              />
              
              <TextField
                label="Date d'installation"
                type="date"
                value={autoForm.date_installation}
                onChange={(e) => setAutoForm({ ...autoForm, date_installation: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={submitting}
              />
              <TextField
                label="Nombre de compteurs à créer"
                type="number"
                value={autoForm.code_start}
                onChange={(e) => setAutoForm({ ...autoForm, code_start: e.target.value })}
                fullWidth
                disabled={submitting}
                helperText="Nombre de compteurs à créer automatiquement"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              setFormData({});
              setSelectedUser(null);
              setSelectedSiteForage(null);
              setMode("single");
            }}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          >
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}