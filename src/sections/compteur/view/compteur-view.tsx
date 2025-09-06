import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Box, Card, Button, Typography, TextField, Select, MenuItem,
  IconButton, Menu, MenuList, MenuItem as MenuItemMui,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Tabs, Tab
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

  // Mode single | multiple | auto
  const [mode, setMode] = useState<"single" | "multiple" | "auto">("single");

  const [formData, setFormData] = useState<any>({});
  const [openDialog, setOpenDialog] = useState(false);

  // Menu actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCompteur, setSelectedCompteur] = useState<Compteur | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, compteur: Compteur) => {
    setAnchorEl(event.currentTarget);
    setSelectedCompteur(compteur);
  };
  const handleMenuClose = () => setAnchorEl(null);

  // Fetch compteurs
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
      console.error("Erreur lors du chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompteurs();
  }, []);

  // Save
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      if (mode === "single") {
        if (formData.id) {
          // update
          await axios.put(
            `https://safimayi-backend.onrender.com/api/compteur/${formData.id}/`,
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          // create
          await axios.post(
            `https://safimayi-backend.onrender.com/api/compteur/`,
            formData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      if (mode === "multiple") {
        await axios.post(
          `https://safimayi-backend.onrender.com/api/compteur/`,
          formData.list || [],
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (mode === "auto") {
        await axios.post(
          `https://safimayi-backend.onrender.com/api/compteur/`,
          { ...formData },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      fetchCompteurs();
      setOpenDialog(false);
      setFormData({});
      setMode("single");
    } catch (error) {
      console.error("Erreur sauvegarde :", error);
      alert("Erreur lors de la sauvegarde du compteur");
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

  return (
    <DashboardContent>
      {/* Header */}
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

      {/* Liste simple sous forme de cartes */}
      <Grid container spacing={2}>
        {loading ? (
          <Typography>Chargement...</Typography>
        ) : compteurs.length > 0 ? (
          compteurs.map((compteur) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={compteur.id}>
              <Card sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle1">{compteur.nom}</Typography>
                  <IconButton onClick={(e) => handleMenuOpen(e, compteur)}>
                    <Iconify icon="eva:more-vertical-fill" />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Code : {compteur.code_serie}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {compteur.date_installation || "-"}
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
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>Aucun compteur trouvé</Typography>
        )}
      </Grid>

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
          >
            {selectedCompteur?.actif ? "Désactiver" : "Activer"}
          </MenuItemMui>
        </MenuList>
      </Menu>

      {/* Dialog Ajout / Édition */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {formData.id ? "Éditer le compteur" : "Nouveau compteur"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Tabs value={mode} onChange={(e, v) => setMode(v)}>
            <Tab label="Simple" value="single" />
            {!formData.id && <Tab label="Multiple" value="multiple" />}
            {!formData.id && <Tab label="Auto" value="auto" />}
          </Tabs>

          {mode === "single" && (
            <>
              <TextField
                label="Nom"
                value={formData.nom || ""}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                fullWidth
              />
              <TextField
                label="Code série"
                value={formData.code_serie || ""}
                onChange={(e) => setFormData({ ...formData, code_serie: e.target.value })}
                fullWidth
              />
              <TextField
                label="Site forage"
                type="number"
                value={formData.siteforage || ""}
                onChange={(e) => setFormData({ ...formData, siteforage: Number(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Date d'installation"
                type="date"
                value={formData.date_installation || ""}
                onChange={(e) => setFormData({ ...formData, date_installation: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </>
          )}

          {mode === "multiple" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {(formData.list || []).map((item: any, index: number) => (
                <Box key={index} sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <TextField
                    label="Nom"
                    value={item.nom || ""}
                    onChange={(e) => {
                      const newList = [...(formData.list || [])];
                      newList[index] = { ...newList[index], nom: e.target.value };
                      setFormData({ ...formData, list: newList });
                    }}
                    fullWidth
                  />
                  <TextField
                    label="Code série"
                    value={item.code_serie || ""}
                    onChange={(e) => {
                      const newList = [...(formData.list || [])];
                      newList[index] = { ...newList[index], code_serie: e.target.value };
                      setFormData({ ...formData, list: newList });
                    }}
                    fullWidth
                  />
                  <IconButton
                    color="error"
                    onClick={() => {
                      const newList = [...(formData.list || [])];
                      newList.splice(index, 1);
                      setFormData({ ...formData, list: newList });
                    }}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Box>
              ))}
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  setFormData({
                    ...formData,
                    list: [...(formData.list || []), { nom: "", code_serie: "" }],
                  })
                }
              >
                + Ajouter un compteur
              </Button>
            </Box>
          )}

          {mode === "auto" && (
            <>
              <TextField
                label="Nom générique"
                value={formData.nom || ""}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                fullWidth
              />
              <TextField
                label="Nombre de compteurs"
                type="number"
                value={formData.nombre || 1}
                onChange={(e) => setFormData({ ...formData, nombre: Number(e.target.value) })}
                fullWidth
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
