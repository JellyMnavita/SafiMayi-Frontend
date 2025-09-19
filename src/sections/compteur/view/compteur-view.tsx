// Remplace ton code par celui-ci
import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress,
  Pagination, IconButton, Menu, MenuList, MenuItem as MenuItemMui,
  Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, FormControl, InputLabel
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

export function CompteurView() {
  const [allCompteurs, setAllCompteurs] = useState<Compteur[]>([]);
  const [compteurs, setCompteurs] = useState<Compteur[]>([]);
  const [sitesForage, setSitesForage] = useState<SiteForage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingSites, setLoadingSites] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

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

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(5);

  // Filtres
  const [searchNom, setSearchNom] = useState<string>("");
  const [searchCode, setSearchCode] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [siteFilter, setSiteFilter] = useState<string>("");

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

  // Charger les compteurs
  const fetchCompteurs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `https://safimayi-backend.onrender.com/api/compteur/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data.results || response.data;
      setAllCompteurs(data);
      setCompteurs(data);
    } catch (error) {
      console.error("Erreur lors du chargement des compteurs :", error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les sites de forage
  const fetchSitesForage = async () => {
    try {
      setLoadingSites(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `https://safimayi-backend.onrender.com/api/siteforage/siteforages/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSitesForage(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des sites de forage :", error);
    } finally {
      setLoadingSites(false);
    }
  };

  useEffect(() => {
    fetchCompteurs();
    fetchSitesForage();
  }, []);

  // Filtrage local
  useEffect(() => {
    let filtered = [...allCompteurs];

    if (searchNom) {
      filtered = filtered.filter((c) =>
        c.nom.toLowerCase().includes(searchNom.toLowerCase())
      );
    }
    if (searchCode) {
      filtered = filtered.filter((c) =>
        c.code_serie?.toLowerCase().includes(searchCode.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(
        (c) => String(c.actif) === statusFilter
      );
    }
    if (dateFilter) {
      filtered = filtered.filter((c) =>
        c.date_installation && c.date_installation.includes(dateFilter)
      );
    }
    if (siteFilter) {
      filtered = filtered.filter((c) =>
        c.siteforage !== null && String(c.siteforage) === siteFilter
      );
    }

    setCompteurs(filtered);
    setPage(1);
  }, [searchNom, searchCode, statusFilter, dateFilter, siteFilter, allCompteurs]);

  // Pagination locale
  const paginatedData = compteurs.slice((page - 1) * pageSize, page * pageSize);

  // Sauvegarde (création / update)
  const handleSave = async () => {
    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      if (formData.id) {
        // Update
        await axios.put(
          `https://safimayi-backend.onrender.com/api/compteur/${formData.id}/`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (mode === "manual") {
        // Création multiple manuelle
        await axios.post(
          `https://safimayi-backend.onrender.com/api/compteur/`,
          bulkCompteurs,
          { headers: { Authorization: `Bearer ${token}` } }
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
            nom: `Compteur-${i}`,
            code_serie: i.toString(),
            siteforage: null,
            date_installation: null,
            actif: false,
          });
        }

        await axios.post(
          `https://safimayi-backend.onrender.com/api/compteur/`,
          generatedCompteurs,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Création simple
        await axios.post(
          `https://safimayi-backend.onrender.com/api/compteur/`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      fetchCompteurs();
      setOpenDialog(false);
      setFormData({});
      setBulkCompteurs([{ nom: "", code_serie: "", siteforage: null, actif: true, date_installation: "" }]);
      setAutoForm({ nom: "", siteforage: null, date_installation: "", code_start: "", code_end: "" });
      setMode("single");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle activation
  const handleToggleActivation = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://safimayi-backend.onrender.com/api/compteur/toggle-activation/${id}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCompteurs();
    } catch (error) {
      console.error("Erreur lors du changement d'état :", error);
    }
  };

  // Récupérer les sites uniques pour le filtre (en excluant les valeurs null)
  const uniqueSites = Array.from(
    new Set(allCompteurs
      .filter(c => c.siteforage !== null)
      .map(c => c.siteforage as number)
    )
  ).sort((a, b) => a - b);

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Compteurs
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
          disabled={submitting}
        >
          Ajouter un compteur
        </Button>
      </Box>
      {/* Filtres */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Nom"
            value={searchNom}
            onChange={(e) => setSearchNom(e.target.value)}
            size="small"
            disabled={submitting}
          />
          <TextField
            label="Code série"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            size="small"
            disabled={submitting}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            size="small"
            disabled={submitting}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="true">Actifs</MenuItem>
            <MenuItem value="false">Désactivés</MenuItem>
          </Select>
          <TextField
            label="Date de fabrication"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            size="small"
            InputLabelProps={{ shrink: true }}
            disabled={submitting}
          />
          <Select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            displayEmpty
            size="small"
            disabled={submitting}
          >
            <MenuItem value="">Tous les sites</MenuItem>
            {uniqueSites.map(site => (
              <MenuItem key={site} value={site.toString()}>
                Site #{site}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchNom("");
              setSearchCode("");
              setStatusFilter("");
              setDateFilter("");
              setSiteFilter("");
            }}
            disabled={submitting}
          >
            Réinitialiser
          </Button>
        </Box>
      </Card>

      {/* Tableau */}
      <Card>
        <div className="p-4 bg-white shadow-md rounded-md overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <CircularProgress />
            </div>
          ) : (
            <>
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm">
                    <th className="p-2 border-b">Nom</th>
                    <th className="p-2 border-b">Code série</th>
                    <th className="p-2 border-b">Site forage</th>
                    <th className="p-2 border-b">Date de Fabrication</th>
                    <th className="p-2 border-b">Status</th>
                    <th className="p-2 border-b text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((compteur) => (
                      <tr key={compteur.id} className="hover:bg-gray-50">
                        <td className="p-2 border-b">{compteur.nom}</td>
                        <td className="p-2 border-b">{compteur.code_serie}</td>
                        <td className="p-2 border-b">
                          {compteur.siteforage !== null ?
                            `${sitesForage.find(s => s.id === compteur.siteforage)?.nom || 'Inconnu'}`
                            : "-"
                          }
                        </td>
                        <td className="p-2 border-b">
                          {compteur.date_installation || "-"}
                        </td>
                        <td className="p-2 border-b">
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
                        <td className="p-2 border-b text-center">
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, compteur)}
                            disabled={submitting}
                            size="small"
                          >
                            <Iconify icon="eva:more-vertical-fill" />
                          </IconButton>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-500 py-6">
                        Aucun compteur trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

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
                  {`Affichage de ${paginatedData.length} sur ${compteurs.length} compteurs`}
                </Typography>
                <Pagination
                  count={Math.ceil(compteurs.length / pageSize)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  disabled={submitting}
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
            }}
            disabled={submitting}
          >
            Modifier
          </MenuItemMui>
          <MenuItemMui
            onClick={() => {
              if (selectedCompteur) handleToggleActivation(selectedCompteur.id);
              handleMenuClose();
            }}
            disabled={submitting}
          >
            {selectedCompteur?.actif ? "Désactiver" : "Activer"}
          </MenuItemMui>
        </MenuList>
      </Menu>

      {/* Dialog Ajout / Édition */}
      <Dialog open={openDialog} onClose={() => !submitting && setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {formData.id ? "Modifier le compteur" : "Ajouter un compteur"}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Tabs value={mode} onChange={(e, v) => !submitting && setMode(v)}>
            <Tab label="Un seul compteur" value="single" disabled={submitting} />
            {!formData.id && <Tab label="Plusieurs manuels" value="manual" disabled={submitting} />}
            {!formData.id && <Tab label="Auto" value="auto" disabled={submitting} />}
          </Tabs>

          {/* Mode single */}
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
                <FormControl sx={{ minWidth: 200 }} size="small">
                  <InputLabel id={`site-forage-label`}>Site forage</InputLabel>
                  <Select
                    labelId={`site-forage-label`}
                    label="Site forage"
                    value={formData.siteforage === null ? "" : String(formData.siteforage)}
                    onChange={(e) => setFormData({
                      ...formData,
                      siteforage: e.target.value === "" ? null : Number(e.target.value)
                    })}
                    fullWidth
                    displayEmpty
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

          {/* Mode manual */}
          {mode === "manual" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {(bulkCompteurs || []).map((c, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: 'wrap' }}
                >
                  <TextField
                    label="Nom"
                    value={c.nom || ""}
                    onChange={(e) => {
                      const list = [...bulkCompteurs];
                      list[index].nom = e.target.value;
                      setBulkCompteurs(list);
                    }}
                    sx={{ minWidth: 120 }}
                    disabled={submitting}
                    size="small"
                  />
                  <TextField
                    label="Code série"
                    value={c.code_serie || ""}
                    onChange={(e) => {
                      const list = [...bulkCompteurs];
                      list[index].code_serie = e.target.value;
                      setBulkCompteurs(list);
                    }}
                    sx={{ minWidth: 120 }}
                    disabled={submitting}
                    size="small"
                  />
                  {loadingSites ? (
                    <CircularProgress size={24} />
                  ) : (
                    <FormControl sx={{ minWidth: 200 }} size="small">
                      <InputLabel id={`site-forage-manuel-label`}>Site forage</InputLabel>
                      <Select
                        labelId={`site-forage-manuel-label`}
                        label="Site forage"
                        value={c.siteforage === null ? "" : String(c.siteforage)}
                        onChange={(e) => {
                          const list = [...bulkCompteurs];
                          list[index].siteforage = e.target.value === "" ? null : Number(e.target.value);
                          setBulkCompteurs(list);
                        }}
                        sx={{ minWidth: 200 }}
                        displayEmpty
                        disabled={submitting}
                        size="small"
                      >
                        <MenuItem value="">Aucun site</MenuItem>
                        {sitesForage.map((site) => (
                          <MenuItem key={site.id} value={site.id}>
                            {site.nom}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  <IconButton
                    color="error"
                    onClick={() => setBulkCompteurs(bulkCompteurs.filter((_, i) => i !== index))}
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

          {/* Mode auto */}
          {mode === "auto" && (
            <>
              <TextField
                label="Nom générique"
                value={autoForm.nom}
                onChange={(e) => setAutoForm({ ...autoForm, nom: e.target.value })}
                fullWidth
                disabled={submitting}
              />
              {loadingSites ? (
                <CircularProgress size={24} />
              ) : (
                <FormControl sx={{ minWidth: 200 }} size="small">
                  <InputLabel id={`site-forage-auto-label`}>Site forage</InputLabel>
                  <Select
                    labelId={`site-forage-auto-label`}
                    label="Site forage"
                    value={autoForm.siteforage === null ? "" : String(autoForm.siteforage)}
                    onChange={(e) => setAutoForm({
                      ...autoForm,
                      siteforage: e.target.value === "" ? null : Number(e.target.value)
                    })}
                    fullWidth
                    displayEmpty
                    disabled={submitting}
                  >
                    <MenuItem value="">Aucun site</MenuItem>
                    {sitesForage.map((site) => (
                      <MenuItem key={site.id} value={site.id}>
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
            onClick={() => setOpenDialog(false)}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} sx={{ color: 'white' }} /> : undefined}
          >
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}