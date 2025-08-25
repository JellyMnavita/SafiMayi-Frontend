import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Card, Button, Typography, TextField, Select, MenuItem,
  IconButton, Menu, MenuList, MenuItem as MenuItemMui,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Tabs, Tab
} from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";

interface RFID {
  id: number;
  code_uid: string;
  telephone: string;
  active: boolean;
  created_at: string;
}

export function RFIDView() {
  const [allRfid, setAllRfid] = useState<RFID[]>([]);
  const [rfids, setRfids] = useState<RFID[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtres
  const [searchCode, setSearchCode] = useState<string>("");
  const [searchTel, setSearchTel] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Menu actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRfid, setSelectedRfid] = useState<RFID | null>(null);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [mode, setMode] = useState<"single" | "multiple" | "auto">("single");
  const [formData, setFormData] = useState<any>({}); // peut être une carte ou plusieurs

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, rfid: RFID) => {
    setAnchorEl(event.currentTarget);
    setSelectedRfid(rfid);
  };
  const handleMenuClose = () => setAnchorEl(null);

  // Charger les cartes
  const fetchRfids = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`https://safimayi-backend.onrender.com/api/rfid/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.results || response.data;
      setAllRfid(data);
      setRfids(data);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfids();
  }, []);

  // Filtrage local
  useEffect(() => {
    let filtered = [...allRfid];
    if (searchCode) {
      filtered = filtered.filter((c) =>
        c.code_uid.toLowerCase().includes(searchCode.toLowerCase())
      );
    }
    if (searchTel) {
      filtered = filtered.filter((c) =>
        c.telephone.toLowerCase().includes(searchTel.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((c) => String(c.active) === statusFilter);
    }
    setRfids(filtered);
  }, [searchCode, searchTel, statusFilter, allRfid]);

  // Save
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      if (mode === "single") {
        await axios.post(
          `https://safimayi-backend.onrender.com/api/rfid/`,
          {
            code_uid: formData.code_uid,
            telephone: formData.telephone,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (mode === "multiple") {
        await axios.post(
          `https://safimayi-backend.onrender.com/api/rfid/`,
          formData.list || [],
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (mode === "auto") {
        await axios.post(
          `https://safimayi-backend.onrender.com/api/rfid/`,
          {
            prefix: formData.prefix,
            nombre: formData.nombre,
            telephone: formData.telephone,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      fetchRfids();
      setOpenDialog(false);
      setFormData({});
    } catch (error) {
      console.error("Erreur sauvegarde :", error);
      alert("Erreur lors de la sauvegarde de la carte RFID");
    }
  };

  // Toggle activation
  const handleToggleActivation = async (code_uid: string) => {
    try {
      const token = localStorage.getItem("token");

      setRfids(prevRfids =>
        prevRfids.map(rfid =>
          rfid.code_uid === code_uid
            ? { ...rfid, active: !rfid.active }
            : rfid
        )
      );

      await axios.post(
        `https://safimayi-backend.onrender.com/api/rfid/toggle/`,
        { uid: code_uid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchRfids();

    } catch (error) {
      console.error("Erreur lors de l'activation/désactivation :", error);
      fetchRfids();
      alert("Erreur lors de la modification du statut de la carte");
    }
  };

  return (
    <DashboardContent>
      {/* Titre et bouton d'ajout */}
      <Box sx={{ mb: 5, display: "flex", alignItems: "center" }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Cartes RFID
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
          Ajouter une carte RFID
        </Button>
      </Box>
      {/* Filtres */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Code UID"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            size="small"
          />
          <TextField
            label="Téléphone"
            value={searchTel}
            onChange={(e) => setSearchTel(e.target.value)}
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
              setSearchCode("");
              setSearchTel("");
              setStatusFilter("");
            }}
          >
            Réinitialiser
          </Button>
        </Box>
      </Card>
      {/* Cards */}
      <Grid container spacing={2}>
        {loading ? (
          <Typography>Chargement...</Typography>
        ) : rfids.length > 0 ? (
          rfids.map((rfid) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={rfid.id}>
              <Card sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle1">{rfid.code_uid}</Typography>
                  <IconButton onClick={(e) => handleMenuOpen(e, rfid)}>
                    <Iconify icon="eva:more-vertical-fill" />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {rfid.telephone}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(rfid.created_at).toLocaleDateString()}
                </Typography>
                <Box>
                  {rfid.active ? (
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
          <Typography>Aucune carte RFID trouvée</Typography>
        )}
      </Grid>

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuList>
          <MenuItemMui
            onClick={() => {
              setFormData(selectedRfid || {});
              setOpenDialog(true);
              handleMenuClose();
            }}
          >
            Modifier
          </MenuItemMui>
          <MenuItemMui
            onClick={() => {
              if (selectedRfid) handleToggleActivation(selectedRfid.code_uid);
              handleMenuClose();
            }}
          >
            {selectedRfid?.active ? "Désactiver" : "Activer"}
          </MenuItemMui>
        </MenuList>
      </Menu>


      {/* Dialog Ajout / Édition */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nouvelle carte RFID</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Tabs value={mode} onChange={(e, v) => setMode(v)}>
            <Tab label="Simple" value="single" />
            <Tab label="Multiple" value="multiple" />
            <Tab label="Auto" value="auto" />
          </Tabs>

          {mode === "single" && (
            <>
              <TextField
                label="Code UID"
                value={formData.code_uid || ""}
                onChange={(e) => setFormData({ ...formData, code_uid: e.target.value })}
                fullWidth
              />
              <TextField
                label="Téléphone"
                value={formData.telephone || ""}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                fullWidth
              />
            </>
          )}

          {mode === "multiple" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {(formData.list || []).map((item: any, index: number) => (
                <Box
                  key={index}
                  sx={{ display: "flex", gap: 2, alignItems: "center" }}
                >
                  <TextField
                    label="Code UID"
                    value={item.code_uid || ""}
                    onChange={(e) => {
                      const newList = [...(formData.list || [])];
                      newList[index] = { ...newList[index], code_uid: e.target.value };
                      setFormData({ ...formData, list: newList });
                    }}
                    fullWidth
                  />
                  <TextField
                    label="Téléphone"
                    value={item.telephone || ""}
                    onChange={(e) => {
                      const newList = [...(formData.list || [])];
                      newList[index] = { ...newList[index], telephone: e.target.value };
                      setFormData({ ...formData, list: newList });
                    }}
                    fullWidth
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      const newList = [...(formData.list || [])];
                      newList.splice(index, 1);
                      setFormData({ ...formData, list: newList });
                    }}
                  >
                    Supprimer
                  </Button>
                </Box>
              ))}

              <Button
                variant="outlined"
                onClick={() =>
                  setFormData({
                    ...formData,
                    list: [...(formData.list || []), { code_uid: "", telephone: "" }],
                  })
                }
              >
                + Ajouter une carte
              </Button>
            </Box>
          )}

          {mode === "auto" && (
            <>
              <TextField
                label="Préfixe"
                value={formData.prefix || "RFID"}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                fullWidth
              />
              <TextField
                label="Nombre de cartes"
                type="number"
                value={formData.nombre || 1}
                onChange={(e) => setFormData({ ...formData, nombre: Number(e.target.value) })}
                fullWidth
              />
              <TextField
                label="Téléphone"
                value={formData.telephone || ""}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
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