import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Card, Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Pagination, CircularProgress, Grid, MenuItem,
  Select, InputLabel, FormControl, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Tabs, Tab
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
  acheteur: string;
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
  const [ventesForm, setVentesForm] = useState<any[]>([
    { compteur: "", rfid: "", acheteur: "", quantite: 1, prix_unitaire: "" }
  ]);
  const [compteurs, setCompteurs] = useState<Compteur[]>([]);
  const [rfids, setRfids] = useState<RFID[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState<"compteur" | "rfid">("compteur");

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

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://safimayi-backend.onrender.com/api/users/create-list/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(res.data);
    } catch (err) {
      console.error("Erreur lors du fetch des clients :", err);
    }
  };

  const fetchCompteursEtRfids = async () => {
    try {
      const token = localStorage.getItem("token");
      const [compteursRes, rfidsRes] = await Promise.all([
        axios.get("https://safimayi-backend.onrender.com/api/compteur/inactifs/", {
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
    fetchClients();
  }, [page]);

  const addVenteRow = () => {
    setVentesForm([...ventesForm, { compteur: "", rfid: "", acheteur: "", quantite: 1, prix_unitaire: "" }]);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const newVentes = [...ventesForm];
    newVentes[index][field] = value;
    setVentesForm(newVentes);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://safimayi-backend.onrender.com/api/ventes/create/`,
        ventesForm, // maintenant on envoie un tableau
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOpenDialog(false);
      setVentesForm([{ compteur: "", rfid: "", acheteur: "", quantite: 1, prix_unitaire: "" }]);
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
          color="inherit"
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
              <Grid sx={{ flex: '1 1 20%', minWidth: 200 }}>
                <Card sx={{ p: 2, textAlign: "center" }}>
                  <Typography>Total ventes</Typography>
                  <Typography variant="h5">{stats.total_ventes}</Typography>
                </Card>
              </Grid>
              <Grid sx={{ flex: '1 1 20%', minWidth: 200 }}>
                <Card sx={{ p: 2, textAlign: "center" }}>
                  <Typography>Montant total</Typography>
                  <Typography variant="h5">{stats.montant_total} FC</Typography>
                </Card>
              </Grid>
              <Grid sx={{ flex: '1 1 20%', minWidth: 200 }}>
                <Card sx={{ p: 2, textAlign: "center" }}>
                  <Typography>Par RFID</Typography>
                  <Typography variant="h5">{stats.ventes_rfid}</Typography>
                </Card>
              </Grid>
              <Grid sx={{ flex: '1 1 20%', minWidth: 200 }}>
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
                        <TableCell>{v.acheteur}</TableCell>
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Nouvelle vente</DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {ventesForm.map((vente, index) => (
            <Box
              key={index}
              sx={{ border: "1px solid #ccc", p: 2, borderRadius: 2, mb: 2 }}
            >
              {/* Tabs pour différencier compteur vs RFID */}
              <Tabs
                value={vente.type || "compteur"}
                onChange={(_, v) => handleChange(index, "type", v)}
                sx={{ width: "100%", mb: 2 }}
              >
                <Tab label="Vente Compteur" value="compteur" />
                <Tab label="Vente RFID" value="rfid" />
              </Tabs>

              {/* Si compteur */}
              {vente.type === "compteur" && (
                <>
                  <FormControl fullWidth>
                    <InputLabel id={`compteur-label-${index}`}>Compteur</InputLabel>
                    <Select
                      value={vente.compteur}
                      onChange={(e) => handleChange(index, "compteur", e.target.value)}
                    >
                      {compteurs.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.nom} ({c.code_serie})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id={`client-label-${index}`}>Client</InputLabel>
                    <Select
                      value={vente.acheteur}
                      onChange={(e) => handleChange(index, "acheteur", e.target.value)}
                      required
                    >
                      {clients.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.nom} - {c.email}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}

              {/* Si RFID */}
              {vente.type === "rfid" && (
                <>
                  <FormControl fullWidth>
                    <InputLabel id={`rfid-label-${index}`}>Carte RFID</InputLabel>
                    <Select
                      value={vente.rfid}
                      onChange={(e) => handleChange(index, "rfid", e.target.value)}
                    >
                      {rfids.map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.code_uid} ({r.telephone || "Anonyme"})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id={`client-label-${index}`}>Client (optionnel)</InputLabel>
                    <Select
                      value={vente.acheteur}
                      onChange={(e) => handleChange(index, "acheteur", e.target.value)}
                    >
                      <MenuItem value="">— Aucun —</MenuItem>
                      {clients.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.nom} - {c.email}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}

              {/* Champs communs */}
              <TextField
                label="Quantité"
                type="number"
                fullWidth
                sx={{ mt: 2 }}
                value={vente.quantite}
                onChange={(e) => handleChange(index, "quantite", Number(e.target.value))}
              />
              <TextField
                label="Prix unitaire"
                type="number"
                fullWidth
                sx={{ mt: 2 }}
                value={vente.prix_unitaire}
                onChange={(e) => handleChange(index, "prix_unitaire", e.target.value)}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id={`mode-paiement-label-${index}`}>Mode de paiement</InputLabel>
                <Select
                  value={vente.mode_paiement || "cash"}
                  onChange={(e) => handleChange(index, "mode_paiement", e.target.value)}
                >
                  <MenuItem value="cash">Espèces</MenuItem>
                  <MenuItem value="mobile_money">Mobile Money</MenuItem>
                  <MenuItem value="carte">Carte Bancaire</MenuItem>
                </Select>
              </FormControl>
            </Box>
          ))}

          <Button variant="outlined" onClick={addVenteRow}>
            Ajouter une autre vente
          </Button>
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
