// Remplace ton code par celui-ci
import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Box, Card, Button, Typography, TextField, Select, MenuItem,
  Pagination, IconButton, Menu, MenuList, MenuItem as MenuItemMui,
  Dialog, DialogTitle, DialogContent, DialogActions, InputLabel, FormControl
} from "@mui/material";

import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";

interface Compteur {
  id: number;
  nom: string;
  code_serie: string;
  actif: boolean;
  date_installation: string | null;
  siteforage: number;
}

export function CompteurView() {
  const [allCompteurs, setAllCompteurs] = useState<Compteur[]>([]);
  const [compteurs, setCompteurs] = useState<Compteur[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Mode création : single | manual | auto
  const [mode, setMode] = useState<"single" | "manual" | "auto">("single");

  // States pour chaque mode
  const [formData, setFormData] = useState<Partial<Compteur>>({});
  const [bulkCompteurs, setBulkCompteurs] = useState<Partial<Compteur>[]>([
    { nom: "", code_serie: "", siteforage: 0, actif: true, date_installation: "" }
  ]);
  const [autoForm, setAutoForm] = useState({
    nom: "",
    siteforage: 0,
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
        `https://safimayi-backend.onrender.com/api/compteur/compteurs/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data.results || response.data;
      setAllCompteurs(data);
      setCompteurs(data);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompteurs();
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
        c.code_serie.toLowerCase().includes(searchCode.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(
        (c) => String(c.actif) === statusFilter
      );
    }

    setCompteurs(filtered);
    setPage(1);
  }, [searchNom, searchCode, statusFilter, allCompteurs]);

  // Pagination locale
  const paginatedData = compteurs.slice((page - 1) * pageSize, page * pageSize);

  // Sauvegarde (création / update)
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      if (formData.id) {
        // Update
        await axios.put(
          `https://safimayi-backend.onrender.com/api/compteur/compteurs/${formData.id}/`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (mode === "manual") {
        // Création multiple manuelle
        await axios.post(
          `https://safimayi-backend.onrender.com/api/compteur/compteurs/`,
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
          return;
        }

        const generatedCompteurs = [];
        for (let i = start; i <= end; i++) {
          generatedCompteurs.push({
          
            code_serie: i.toString(),

          });
        }

        await axios.post(
          `https://safimayi-backend.onrender.com/api/compteur/compteurs/`,
          generatedCompteurs,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Création simple
        await axios.post(
          `https://safimayi-backend.onrender.com/api/compteur/compteurs/`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      fetchCompteurs();
      setOpenDialog(false);
      setFormData({});
      setBulkCompteurs([{ nom: "", code_serie: "", siteforage: 0, actif: true, date_installation: "" }]);
      setAutoForm({ nom: "", siteforage: 0, date_installation: "", code_start: "", code_end: "" });
      setMode("single");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
    }
  };

  // Toggle activation
  const handleToggleActivation = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://safimayi-backend.onrender.com/api/compteur/compteurs/toggle-activation/${id}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCompteurs();
    } catch (error) {
      console.error("Erreur lors du changement d'état :", error);
    }
  };

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
          />
          <TextField
            label="Code série"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            size="small"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            size="small"
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="true">Actifs</MenuItem>
            <MenuItem value="false">Désactivés</MenuItem>
          </Select>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchNom("");
              setSearchCode("");
              setStatusFilter("");
            }}
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
              <p className="text-gray-500">Chargement des compteurs...</p>
            </div>
          ) : (
            <>
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm">
                    <th className="p-2 border-b">Nom</th>
                    <th className="p-2 border-b">Code série</th>
                    <th className="p-2 border-b">Site forage</th>
                    <th className="p-2 border-b">Date d'installation</th>
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
                        <td className="p-2 border-b">Site #{compteur.siteforage}</td>
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
                          <IconButton onClick={(e) => handleMenuOpen(e, compteur)}>
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
          >
            Modifier
          </MenuItemMui>
          <MenuItemMui
            onClick={() => {
              if (selectedCompteur) handleToggleActivation(selectedCompteur.id);
              handleMenuClose();
            }}
          >
            {selectedCompteur?.actif ? "Désactiver" : "Activer"}
          </MenuItemMui>
        </MenuList>
      </Menu>

      {/* Dialog Ajout / Édition */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {formData.id ? "Modifier le compteur" : "Ajouter un compteur"}
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {!formData.id && (
            <FormControl fullWidth>
              <InputLabel>Mode de création</InputLabel>
              <Select value={mode} onChange={(e) => setMode(e.target.value as any)}>
                <MenuItem value="single">Un seul compteur</MenuItem>
                <MenuItem value="manual">Plusieurs compteurs manuels</MenuItem>
                <MenuItem value="auto">Plusieurs compteurs automatiques</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Mode single */}
          {mode === "single" && (
            <>
              <TextField label="Nom" value={formData.nom || ""} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} fullWidth />
              <TextField label="Code série" value={formData.code_serie || ""} onChange={(e) => setFormData({ ...formData, code_serie: e.target.value })} fullWidth />
              <TextField label="Site forage" type="number" value={formData.siteforage || ""} onChange={(e) => setFormData({ ...formData, siteforage: Number(e.target.value) })} fullWidth />
              <TextField label="Date d'installation" type="date" value={formData.date_installation || ""} onChange={(e) => setFormData({ ...formData, date_installation: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            </>
          )}

          {/* Mode manual */}
          {mode === "manual" && (
            <>
              {bulkCompteurs.map((c, index) => (
                <Box key={index} sx={{ border: "1px solid #ddd", p: 2, mb: 2, borderRadius: 1 }}>
                  <TextField label="Nom" value={c.nom || ""} onChange={(e) => {
                    const list = [...bulkCompteurs];
                    list[index].nom = e.target.value;
                    setBulkCompteurs(list);
                  }} fullWidth sx={{ mb: 1 }} />
                  <TextField label="Code série" value={c.code_serie || ""} onChange={(e) => {
                    const list = [...bulkCompteurs];
                    list[index].code_serie = e.target.value;
                    setBulkCompteurs(list);
                  }} fullWidth sx={{ mb: 1 }} />
                  <TextField label="Site forage" type="number" value={c.siteforage || ""} onChange={(e) => {
                    const list = [...bulkCompteurs];
                    list[index].siteforage = Number(e.target.value);
                    setBulkCompteurs(list);
                  }} fullWidth sx={{ mb: 1 }} />
                  <Button color="error" onClick={() => setBulkCompteurs(bulkCompteurs.filter((_, i) => i !== index))}>Supprimer</Button>
                </Box>
              ))}
              <Button variant="outlined" onClick={() => setBulkCompteurs([...bulkCompteurs, { nom: "", code_serie: "", siteforage: 0, actif: true }])}>
                + Ajouter un compteur
              </Button>
            </>
          )}

          {/* Mode auto */}
          {mode === "auto" && (
            <>
              <TextField label="Nom générique" value={autoForm.nom} onChange={(e) => setAutoForm({ ...autoForm, nom: e.target.value })} fullWidth />
              <TextField label="Site forage" type="number" value={autoForm.siteforage} onChange={(e) => setAutoForm({ ...autoForm, siteforage: Number(e.target.value) })} fullWidth />
              <TextField label="Date d'installation" type="date" value={autoForm.date_installation} onChange={(e) => setAutoForm({ ...autoForm, date_installation: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Code série début" type="number" value={autoForm.code_start} onChange={(e) => setAutoForm({ ...autoForm, code_start: e.target.value })} fullWidth />
              <TextField label="Code série fin" type="number" value={autoForm.code_end} onChange={(e) => setAutoForm({ ...autoForm, code_end: e.target.value })} fullWidth />
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}