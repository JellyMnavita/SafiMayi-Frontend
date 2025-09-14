import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Card, Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Pagination, CircularProgress, Grid,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Stepper, Step, StepLabel, Autocomplete
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";

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
  prix?: number;
}

interface RFID {
  id: number;
  code_uid: string;
  telephone: string;
  prix?: number;
}

export function VenteView() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const [openDialog, setOpenDialog] = useState(false);

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Informations acheteur", "Produits vendus"];

  // Acheteur
  const [searchUser, setSearchUser] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [nomAcheteur, setNomAcheteur] = useState("");
  const [telAcheteur, setTelAcheteur] = useState("");

  // Produits
  const [compteurs, setCompteurs] = useState<Compteur[]>([]);
  const [rfids, setRfids] = useState<RFID[]>([]);
  const [selectedProduits, setSelectedProduits] = useState<any[]>([]);
  const [montantPaye, setMontantPaye] = useState<number>(0);

  const fetchVentes = async (pageNumber = 1) => {
    try {
      /*      setLoading(true);
           const token = localStorage.getItem("token");
           const res = await axios.get(
             `https://safimayi-backend.onrender.com/api/ventes/`,
             { headers: { Authorization: `Bearer ${token}` } }
           );
           setVentes(res.data.results);
           setStats(res.data.stats);
           setTotalPages(Math.ceil(res.data.count / 10)); */
    } catch (err) {
      console.error("Erreur lors du fetch des ventes :", err);
    } finally {
      setLoading(false);
    }
  };

  // Recherche user dynamique
  useEffect(() => {
    if (searchUser.length > 2) {
      const token = localStorage.getItem("token");
      axios
        .get(
          `https://safimayi-backend.onrender.com/api/users/create-list/?search=${searchUser}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((res) => setUsers(res.data))
        .catch((err) => console.error(err));
    }
  }, [searchUser]);

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
  }, [page]);

  const handleAddProduit = (produit: any, type: string) => {
    setSelectedProduits([...selectedProduits, { ...produit, quantite: 1, type }]);
  };

  const handleRemoveProduit = (index: number) => {
    const updated = [...selectedProduits];
    updated.splice(index, 1);
    setSelectedProduits(updated);
  };

  const montantTotal = selectedProduits.reduce(
    (sum, p) => sum + p.quantite * (p.prix || 0),
    0
  );

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://safimayi-backend.onrender.com/api/ventes/create/`,
        {
          acheteur: selectedUser?.id || null,
          nom_acheteur: nomAcheteur,
          telephone_acheteur: telAcheteur,
          montant_paye: montantPaye,
          mode_paiement: "cash",
          details: selectedProduits.map((p) => ({
            compteur: p.type === "compteur" ? p.id : null,
            rfid: p.type === "rfid" ? p.id : null,
            quantite: p.quantite,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpenDialog(false);
      setSelectedProduits([]);
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

        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>

          {/* Étape 1 : acheteur */}
          {activeStep === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Autocomplete
                options={users}
                getOptionLabel={(u) => `${u.nom} - ${u.email || u.telephone}`}
                value={selectedUser}
                onChange={(_, v) => setSelectedUser(v)}
                onInputChange={(_, v) => setSearchUser(v)}
                renderInput={(params) => <TextField {...params} label="Utilisateur du système" />}
              />
              <TextField
                fullWidth label="Nom acheteur"
                value={nomAcheteur}
                onChange={(e) => setNomAcheteur(e.target.value)}
              />
              <TextField
                fullWidth label="Téléphone acheteur"
                value={telAcheteur}
                onChange={(e) => setTelAcheteur(e.target.value)}
              />
            </Box>
          )}

          {/* Étape 2 : produits */}
          {activeStep === 1 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              {/* Colonne gauche */}
              <Box sx={{ flex: 1 }}>
                <Autocomplete
                  options={compteurs}
                  getOptionLabel={(p) => `${p.nom} (${p.code_serie})`}
                  onChange={(_, v) =>
                    v && handleAddProduit({ ...v, prix: v.prix }, "compteur")
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Rechercher un compteur" />
                  )}
                />

                <Autocomplete
                  sx={{ mt: 2 }}
                  options={rfids}
                  getOptionLabel={(r) => `${r.code_uid} (${r.telephone || "Anonyme"})`}
                  onChange={(_, v) =>
                    v && handleAddProduit({ ...v, prix: v.prix }, "rfid")
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Rechercher une carte RFID" />
                  )}
                />
              </Box>

              {/* Colonne droite */}
              <Box sx={{ flex: 1 }}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6">Produits sélectionnés</Typography>

                  {selectedProduits.map((p, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1,
                        mb: 0.5,
                        border: "1px solid #e0e0e0",
                        borderRadius: 1.5,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        backgroundColor: "#fafafa",
                        transition: "transform 0.1s",
                        "&:hover": {
                          transform: "scale(1.01)",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                        },
                      }}
                    >
                      <Typography>
                        {p.nom || p.code_uid} x {p.quantite}
                      </Typography>
                      <IconButton color="error" onClick={() => handleRemoveProduit(i)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}


                  <Typography sx={{ mt: 2 }}>
                    Montant total: <b>{montantTotal} FCFA</b>
                  </Typography>

                  <TextField
                    label="Montant perçu"
                    type="number"
                    fullWidth
                    sx={{ mt: 2 }}
                    value={montantPaye}
                    onChange={(e) => setMontantPaye(parseInt(e.target.value))}
                  />
                </Card>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button disabled={activeStep === 0} onClick={() => setActiveStep(activeStep - 1)}>Retour</Button>
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={() => setActiveStep(activeStep + 1)}>Suivant</Button>
          ) : (
            <Button variant="contained" color="success" onClick={handleSave}>Enregistrer</Button>
          )}
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
