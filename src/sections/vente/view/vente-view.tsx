import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Card, Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Pagination, CircularProgress, Grid, MenuItem,
  Select, InputLabel, FormControl, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer
} from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";

interface Vente {
  id: number;
  produit: string;
  quantite: number;
  prix_unitaire: string;
  montant_total: string;
  mode_paiement: string;
  client: string;
  date_vente: string;
}

interface Stats {
  total_ventes: number;
  montant_total: number;
  ventes_especes: number;
  ventes_rfid: number;
  ventes_compteur: number;
}

interface Compteur {
  id: number;
  nom: string;
  code_serie: string;
}

interface RFID {
  id: number;
  code_uid: string;
  telephone: string;
}

export function VenteView() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [compteurs, setCompteurs] = useState<Compteur[]>([]);
  const [rfids, setRfids] = useState<RFID[]>([]);

  const fetchVentes = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://safimayi-backend.onrender.com/api/ventes/stats-journal/?page=${pageNumber}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVentes(res.data.results);
      setStats(res.data.stats);
      setTotalPages(Math.ceil(res.data.count / 10));
    } catch (err) {
      console.error("Erreur lors du fetch des ventes :", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompteursEtRfids = async () => {
    try {
      const token = localStorage.getItem("token");
      const [compteursRes, rfidsRes] = await Promise.all([
        axios.get("https://safimayi-backend.onrender.com/api/compteur/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://safimayi-backend.onrender.com/api/rfid/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setCompteurs(compteursRes.data);
      setRfids(rfidsRes.data);
    } catch (err) {
      console.error("Erreur lors du fetch des compteurs ou RFID :", err);
    }
  };

  useEffect(() => {
    fetchVentes(page);
    fetchCompteursEtRfids();
  }, [page]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://safimayi-backend.onrender.com/api/ventes/create/`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOpenDialog(false);
      setFormData({});
      fetchVentes(page);
    } catch (error) {
      console.error("Erreur lors de la création :", error);
    }
  };

  return (
    <DashboardContent>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, flexWrap: "wrap" }}>
        <Typography variant="h4">Journal des ventes</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setOpenDialog(true)}
        >
          Nouvelle vente
        </Button>
      </Box>

      {/* Loader */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Stats */}
          {stats && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid  sx={{ flex: '1 1 20%', minWidth: 200 }}>
                <Card sx={{ p: 2, textAlign: "center" }}>
                  <Typography>Total ventes</Typography>
                  <Typography variant="h5">{stats.total_ventes}</Typography>
                </Card>
              </Grid>
              <Grid  sx={{ flex: '1 1 20%', minWidth: 200 }}>
                <Card sx={{ p: 2, textAlign: "center" }}>
                  <Typography>Montant total</Typography>
                  <Typography variant="h5">{stats.montant_total} FC</Typography>
                </Card>
              </Grid>
              <Grid  sx={{ flex: '1 1 20%', minWidth: 200 }}>
                <Card sx={{ p: 2, textAlign: "center" }}>
                  <Typography>Espèces</Typography>
                  <Typography variant="h5">{stats.ventes_especes}</Typography>
                </Card>
              </Grid>
              <Grid  sx={{ flex: '1 1 20%', minWidth: 200 }}>
                <Card sx={{ p: 2, textAlign: "center" }}>
                  <Typography>Par RFID</Typography>
                  <Typography variant="h5">{stats.ventes_rfid}</Typography>
                </Card>
              </Grid>
              <Grid  sx={{ flex: '1 1 20%', minWidth: 200 }}>
                <Card sx={{ p: 2, textAlign: "center" }}>
                  <Typography>Par Compteur</Typography>
                  <Typography variant="h5">{stats.ventes_compteur}</Typography>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tableau journal */}
          <Card sx={{ p: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produit</TableCell>
                    <TableCell>Quantité</TableCell>
                    <TableCell>Prix unitaire</TableCell>
                    <TableCell>Montant</TableCell>
                    <TableCell>Paiement</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ventes.length > 0 ? (
                    ventes.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>{v.produit}</TableCell>
                        <TableCell>{v.quantite}</TableCell>
                        <TableCell>{v.prix_unitaire} FC</TableCell>
                        <TableCell>{v.montant_total} FC</TableCell>
                        <TableCell>{v.mode_paiement}</TableCell>
                        <TableCell>{v.client}</TableCell>
                        <TableCell>{new Date(v.date_vente).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Aucune vente trouvée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </Card>
        </>
      )}

      {/* Dialog ajout */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nouvelle vente</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {/* Select Compteur */}
          <FormControl fullWidth>
            <InputLabel id="compteur-label">Compteur</InputLabel>
            <Select
              labelId="compteur-label"
              value={formData.compteur || ""}
              onChange={(e) => setFormData({ ...formData, compteur: e.target.value })}
            >
              {compteurs.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nom} ({c.code_serie})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Select RFID */}
          <FormControl fullWidth>
            <InputLabel id="rfid-label">Carte RFID</InputLabel>
            <Select
              labelId="rfid-label"
              value={formData.rfid || ""}
              onChange={(e) => setFormData({ ...formData, rfid: e.target.value })}
            >
              {rfids.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.code_uid} ({r.telephone || "Anonyme"})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Quantité"
            type="number"
            value={formData.quantite || ""}
            onChange={(e) => setFormData({ ...formData, quantite: Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Prix unitaire"
            type="number"
            value={formData.prix_unitaire || ""}
            onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
            fullWidth
          />
          <TextField
            label="Mode de paiement"
            value={formData.mode_paiement || ""}
            onChange={(e) => setFormData({ ...formData, mode_paiement: e.target.value })}
            fullWidth
          />
          <TextField
            label="Client"
            value={formData.client || ""}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
