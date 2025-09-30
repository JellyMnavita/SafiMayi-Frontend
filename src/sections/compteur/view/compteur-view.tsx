import React, { useEffect, useState } from "react";
import apiClient from "../../../utils/api";
import {
  Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress,
  Pagination, IconButton, Menu, MenuList, MenuItem as MenuItemMui,
  Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, FormControl, InputLabel,
  Grid, Chip
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
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingSites, setLoadingSites] = useState<boolean>(true);
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
  const [searchCode, setSearchCode] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [statutFilter, setStatutFilter] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(8);

  // Mode création : single | manual | auto
  const [mode, setMode] = useState<"single" | "manual" | "auto">("single");

  // States pour chaque mode
  const [formData, setFormData] = useState<Partial<Compteur>>({});
  const [bulkCompteurs, setBulkCompteurs] = useState<Partial<Compteur>[]>([
    { nom: "", code_serie: "", siteforage: null, actif: true, date_installation: "" }
  ]);
  const [autoForm, setAutoForm] = useState({
    nom: "",
    siteforage: null as number | null,
    date_installation: "",
    code_start: "",
    code_end: ""
  });

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

      const response = await apiClient.get(`/api/compteur/list-compteur-pagination?${params}`);
      const data = response.data;
      
      setCompteurs(data.results || []);
      setPagination({
        count: data.count || 0,
        next: data.next || null,
        previous: data.previous || null,
        page_size: data.page_size || 20,
        current_page: data.current_page || 1,
        total_pages: data.total_pages || 1
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

  // Chargement initial
  useEffect(() => {
    fetchCompteurs(1);
    fetchSitesForage();
  }, []);

  // Recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCompteurs(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchNom, statusFilter, statutFilter, pageSize]);

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
        const { nom, siteforage, date_installation, code_start, code_end } = autoForm;
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
            nom: nom || `Compteur-${i}`,
            code_serie: i.toString(),
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
      setBulkCompteurs([{ nom: "", code_serie: "", siteforage: null, actif: true, date_installation: "" }]);
      setAutoForm({ nom: "", siteforage: null, date_installation: "", code_start: "", code_end: "" });
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
    setSearchCode("");
    setStatusFilter("");
    setStatutFilter("");
    setPageSize(8);
  };

  // Fonction pour ouvrir le dialog de configuration en cliquant sur la carte
  const handleCardClick = (compteur: Compteur) => {
    setFormData(compteur);
    setOpenDialog(true);
    setMode("single");
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
            label="Rechercher (Nom, Code série)"
            value={searchNom}
            onChange={(e) => setSearchNom(e.target.value)}
            size="small"
            placeholder="Nom ou code série..."
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
              <MenuItem value="installé">Installé</MenuItem>
              <MenuItem value="en panne">En panne</MenuItem>
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

      {/* Cards avec affichage des compteurs */}
      <Grid container spacing={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : compteurs.length > 0 ? (
          compteurs.map((compteur) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={compteur.id}>
              <Card 
                sx={{ 
                  p: 2, 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: 1.5, 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => handleCardClick(compteur)}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {compteur.nom}
                  </Typography>
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
                </Box>
                
                {/* Affichage du code série */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: '#0486d9',
                  color: 'white'
                }}>
                  <Typography variant="body2" fontWeight="bold">
                    Code série:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {compteur.code_serie || "N/A"}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Créé le: {new Date(compteur.date_creation).toLocaleDateString()}
                </Typography>

                {/* Affichage du site de forage associé */}
                {compteur.siteforage_nom && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Site:
                    </Typography>
                    <Chip 
                      label={compteur.siteforage_nom} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                )}

                {/* Affichage de l'utilisateur associé */}
                {compteur.user_nom && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Propriétaire:
                    </Typography>
                    <Chip 
                      label={compteur.user_nom} 
                      size="small" 
                      variant="outlined"
                      color="secondary"
                    />
                  </Box>
                )}

                {/* Affichage du statut */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'grey.50'
                }}>
                  <Typography variant="body2" fontWeight="medium">
                    Statut:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: compteur.statut === 'installé' ? 'success.dark' : 
                            compteur.statut === 'en panne' ? 'error.dark' : 'text.secondary'
                    }}
                  >
                    {compteur.statut || 'Non défini'}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 'auto' }}>
                  <Typography variant="caption" color="text.secondary">
                    {compteur.date_installation ? 
                      `Installé: ${new Date(compteur.date_installation).toLocaleDateString()}` : 
                      "Non installé"
                    }
                  </Typography>
                  
                  <Box>
                    {compteur.actif ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        Actif
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                        Désactivé
                      </span>
                    )}
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))
        ) : (
          <Box sx={{ width: '100%', textAlign: 'center', p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              Aucun compteur trouvé
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Essayez de modifier vos critères de recherche
            </Typography>
          </Box>
        )}
      </Grid>

      {/* Pagination en bas */}
      {pagination.total_pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={pagination.total_pages} 
            page={pagination.current_page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

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
              <TextField
                label="Nom"
                value={formData.nom || ""}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                fullWidth
                disabled={submitting}
              />
              <TextField
                label="Code série"
                value={formData.code_serie || ""}
                onChange={(e) => setFormData({ ...formData, code_serie: e.target.value })}
                fullWidth
                disabled={submitting}
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
                  <TextField
                    label="Nom"
                    value={item.nom || ""}
                    onChange={(e) => {
                      const newList = [...bulkCompteurs];
                      newList[index] = { ...newList[index], nom: e.target.value };
                      setBulkCompteurs(newList);
                    }}
                    fullWidth
                    disabled={submitting}
                    size="small"
                  />
                  <TextField
                    label="Code série"
                    value={item.code_serie || ""}
                    onChange={(e) => {
                      const newList = [...bulkCompteurs];
                      newList[index] = { ...newList[index], code_serie: e.target.value };
                      setBulkCompteurs(newList);
                    }}
                    fullWidth
                    disabled={submitting}
                    size="small"
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
                    { nom: "", code_serie: "", siteforage: null, actif: true },
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
              <TextField
                label="Nom générique"
                value={autoForm.nom}
                onChange={(e) => setAutoForm({ ...autoForm, nom: e.target.value })}
                fullWidth
                disabled={submitting}
                helperText="Laissez vide pour utiliser 'Compteur-{numéro}'"
              />
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
                label="Code série début"
                type="number"
                value={autoForm.code_start}
                onChange={(e) => setAutoForm({ ...autoForm, code_start: e.target.value })}
                fullWidth
                disabled={submitting}
              />
              <TextField
                label="Code série fin"
                type="number"
                value={autoForm.code_end}
                onChange={(e) => setAutoForm({ ...autoForm, code_end: e.target.value })}
                fullWidth
                disabled={submitting}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              setFormData({});
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