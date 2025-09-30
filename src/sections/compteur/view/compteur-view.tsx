import React, { useEffect, useState } from "react";
import apiClient from "../../../utils/api";
import {
  Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress,
  Pagination, IconButton, Menu, MenuList, MenuItem as MenuItemMui,
  Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, FormControl, InputLabel,
  Chip, Autocomplete
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
  const [siteForageFilter, setSiteForageFilter] = useState<string>("");
  const [userFilter, setUserFilter] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(8);

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
  const fetchCompteurs = async (page: number = 1) => {
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
      if (siteForageFilter) params.append('siteforage', siteForageFilter);
      if (userFilter) params.append('user_id', userFilter);

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
  };

  // Charger les sites de forage
  const fetchSitesForage = async () => {
    try {
      setLoadingSites(true);
      const response = await apiClient.get(`/api/siteforage/siteforages/`);
      setSitesForage(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des sites de forage :", error);
    } finally {
      setLoadingSites(false);
    }
  };

  // Charger les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await apiClient.get(`/api/users/search/?page_size=100`);
      setUsers(response.data.results || []);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs :", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Recherche d'utilisateurs
  const searchUsers = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      return;
    }

    try {
      const response = await apiClient.get(
        `/api/users/search/?search=${encodeURIComponent(searchTerm)}&page_size=10`
      );
      setUsers(response.data.results || []);
    } catch (err) {
      console.error("Erreur lors de la recherche d'utilisateurs:", err);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchCompteurs(1);
    fetchSitesForage();
    fetchUsers();
  }, []);

  // Recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCompteurs(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchNom, statusFilter, statutFilter, siteForageFilter, userFilter, pageSize]);

  // Recherche utilisateur avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchUser);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchUser]);

  // Changement de page
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    fetchCompteurs(value);
  };

  // Changement de la taille de page
  const handlePageSizeChange = (event: any) => {
    const newSize = parseInt(event.target.value);
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
    setSiteForageFilter("");
    setUserFilter("");
    setPageSize(8);
  };

  // Lorsqu'on ouvre le dialog d'édition, charger l'utilisateur associé
  useEffect(() => {
    if (openDialog && formData.id && formData.user) {
      const user = users.find(u => u.id === formData.user);
      if (user) {
        setSelectedUser(user);
      }
    }
  }, [openDialog, formData.id, formData.user, users]);

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
            setMode("single");
            setOpenDialog(true);
          }}
        >
          Ajouter un compteur
        </Button>
      </Box>

      {/* Filtres */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            label="Rechercher (Code série)"
            value={searchNom}
            onChange={(e) => setSearchNom(e.target.value)}
            size="small"
            placeholder="Code série..."
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Statut actif</InputLabel>
            <Select
              value={statusFilter}
              label="Statut actif"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="true">Actifs</MenuItem>
              <MenuItem value="false">Désactivés</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={statutFilter}
              label="Statut"
              onChange={(e) => setStatutFilter(e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="stock">En stock</MenuItem>
              <MenuItem value="vendu">Vendu</MenuItem>
              <MenuItem value="installe">Installé</MenuItem>
              <MenuItem value="en panne">En panne</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Site forage</InputLabel>
            <Select
              value={siteForageFilter}
              label="Site forage"
              onChange={(e) => setSiteForageFilter(e.target.value)}
            >
              <MenuItem value="">Tous les sites</MenuItem>
              {sitesForage.map((site) => (
                <MenuItem key={site.id} value={String(site.id)}>
                  {site.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Propriétaire</InputLabel>
            <Select
              value={userFilter}
              label="Propriétaire"
              onChange={(e) => setUserFilter(e.target.value)}
            >
              <MenuItem value="">Tous les propriétaires</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={String(user.id)}>
                  {user.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Par page</InputLabel>
            <Select
              value={pageSize}
              label="Par page"
              onChange={handlePageSizeChange}
            >
              <MenuItem value={8}>8</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={40}>40</MenuItem>
              <MenuItem value={60}>60</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={handleResetFilters}
          >
            Réinitialiser
          </Button>
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
              {/* Sélection du propriétaire */}
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
                    placeholder="Rechercher un utilisateur..."
                    helperText="Laissez vide si le compteur n'a pas de propriétaire"
                  />
                )}
                loading={loadingUsers}
              />

              {loadingSites ? (
                <CircularProgress size={24} />
              ) : (
                <FormControl fullWidth>
                  <InputLabel>Site forage</InputLabel>
                  <Select
                    value={formData.siteforage === null ? "" : String(formData.siteforage)}
                    label="Site forage"
                    onChange={(e) => setFormData({
                      ...formData,
                      siteforage: e.target.value === "" ? null : Number(e.target.value)
                    })}
                    disabled={submitting}
                  >
                    <MenuItem value="">Aucun site</MenuItem>
                    {sitesForage.map((site) => (
                      <MenuItem key={site.id} value={String(site.id)}>
                        {site.nom} - {site.localisation}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
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
                  {loadingSites ? (
                    <CircularProgress size={24} />
                  ) : (
                    <FormControl fullWidth size="small">
                      <InputLabel>Site forage</InputLabel>
                      <Select
                        value={item.siteforage === null ? "" : String(item.siteforage)}
                        label="Site forage"
                        onChange={(e) => {
                          const newList = [...bulkCompteurs];
                          newList[index] = { 
                            ...newList[index], 
                            siteforage: e.target.value === "" ? null : Number(e.target.value)
                          };
                          setBulkCompteurs(newList);
                        }}
                        disabled={submitting}
                      >
                        <MenuItem value="">Aucun site</MenuItem>
                        {sitesForage.map((site) => (
                          <MenuItem key={site.id} value={String(site.id)}>
                            {site.nom} - {site.localisation}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
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
              {loadingSites ? (
                <CircularProgress size={24} />
              ) : (
                <FormControl fullWidth>
                  <InputLabel>Site forage</InputLabel>
                  <Select
                    value={autoForm.siteforage === null ? "" : String(autoForm.siteforage)}
                    label="Site forage"
                    onChange={(e) => setAutoForm({
                      ...autoForm,
                      siteforage: e.target.value === "" ? null : Number(e.target.value)
                    })}
                    disabled={submitting}
                  >
                    <MenuItem value="">Aucun site</MenuItem>
                    {sitesForage.map((site) => (
                      <MenuItem key={site.id} value={String(site.id)}>
                        {site.nom} - {site.localisation}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
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