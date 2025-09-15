import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Card, Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Pagination, CircularProgress, Grid,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Stepper, Step, StepLabel, Autocomplete, Chip, Accordion, AccordionSummary, AccordionDetails,
  MenuItem, Select, FormControl, InputLabel, Tabs, Tab, Alert
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { IconButton } from "@mui/material";

import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";

interface VenteDetail {
  id: number;
  compteur: number | null;
  rfid: number | null;
  produit_nom: string;
  prix_unitaire: string;
  quantite: number;
  montant: string;
}

interface Vente {
  id: number;
  vendeur: number;
  acheteur: number | null;
  nom_acheteur: string;
  telephone_acheteur: string;
  sexe_acheteur: string | null;
  adresse_acheteur: string | null;
  montant_total: string;
  montant_paye: string;
  mode_paiement: string;
  transaction_id: string | null;
  date_vente: string;
  statut: string;
  note: string | null;
  details_read: VenteDetail[];
}

interface Stats {
  total_ventes: number;
  montant_total: number;
  ventes_par_mode: {
    cash: number;
    mobile_money: number;
    carte: number;
  };
  montant_par_mode: {
    cash: number;
    mobile_money: number;
    carte: number;
  };
  ventes_compteur: number;
  ventes_rfid: number;
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

// Composant pour créer un nouvel utilisateur
function CreateUserForm({ onUserCreated, onCancel }: { onUserCreated: (user: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    password: "",
    role: "client",
    sexe: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Gestionnaire pour les champs TextField
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestionnaire spécifique pour les Select
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://safimayi-backend.onrender.com/api/users/create-list/",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Appeler le callback avec le nouvel utilisateur créé
      onUserCreated(response.data);
    } catch (err: any) {
      console.error("Erreur lors de la création de l'utilisateur:", err);
      setError(err.response?.data?.message || "Erreur lors de la création de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mt: 2}}>
        <Grid sx={{ width: { xs: '100%' } }}>
          <TextField
            fullWidth
            label="Nom complet"
            name="nom"
            value={formData.nom}
            onChange={handleInputChange}
            required
          />
        </Grid>
        <Grid sx={{ width: { xs: '100%' } }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </Grid>
        <Grid sx={{ width: { xs: '100%' } }}>
          <TextField
            fullWidth
            label="Téléphone"
            name="telephone"
            value={formData.telephone}
            onChange={handleInputChange}
            required
          />
        </Grid>
        <Grid sx={{ width: { xs: '100%' } }}>
          <TextField
            fullWidth
            label="Mot de passe"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </Grid>
        <Grid sx={{ width: { xs: '100%' } }}>
          <FormControl fullWidth>
            <InputLabel>Rôle</InputLabel>
            <Select
              name="role"
              value={formData.role}
              label="Rôle"
              onChange={(e) => handleSelectChange("role", e.target.value as string)}
            >
              <MenuItem value="client">Client</MenuItem>
              <MenuItem value="owner">Proprietaire de forage</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid sx={{ width: { xs: '100%' } }}>
          <FormControl fullWidth>
            <InputLabel>Sexe</InputLabel>
            <Select
              name="sexe"
              value={formData.sexe}
              label="Sexe"
              onChange={(e) => handleSelectChange("sexe", e.target.value as string)}
            >
              <MenuItem value="M">Masculin</MenuItem>
              <MenuItem value="F">Féminin</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <DialogActions sx={{ px: 0, mt: 2}}>
        <Button onClick={onCancel}>Annuler</Button>
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <PersonAddIcon />}
        >
          Créer l'utilisateur
        </Button>
      </DialogActions>
    </Box>
  );
}

export function VenteView() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [userCreationTab, setUserCreationTab] = useState(0);

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Informations acheteur", "Produits vendus"];

  // Acheteur
  const [searchUser, setSearchUser] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [nomAcheteur, setNomAcheteur] = useState("");
  const [telAcheteur, setTelAcheteur] = useState("");
  const [sexeAcheteur, setSexeAcheteur] = useState("");
  const [adresseAcheteur, setAdresseAcheteur] = useState("");

  // Produits
  const [compteurs, setCompteurs] = useState<Compteur[]>([]);
  const [rfids, setRfids] = useState<RFID[]>([]);
  const [selectedProduits, setSelectedProduits] = useState<any[]>([]);
  const [montantPaye, setMontantPaye] = useState<number>(0);

  const fetchVentes = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://safimayi-backend.onrender.com/api/ventes/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVentes(res.data || []);
      setTotalPages(1);
    } catch (err) {
      console.error("Erreur lors du fetch des ventes :", err);
      setVentes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://safimayi-backend.onrender.com/api/ventes/stats/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(res.data);
    } catch (err) {
      console.error("Erreur lors du fetch des statistiques :", err);
      setStats(null);
    } finally {
      setStatsLoading(false);
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
        .then((res) => setUsers(res.data || []))
        .catch((err) => {
          console.error(err);
          setUsers([]);
        });
    } else {
      setUsers([]);
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
      setCompteurs(compteursRes.data || []);
      setRfids(rfidsRes.data || []);
    } catch (err) {
      console.error("Erreur lors du fetch des compteurs ou RFID :", err);
      setCompteurs([]);
      setRfids([]);
    }
  };

  useEffect(() => {
    fetchVentes(page);
    fetchStats();
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
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `https://safimayi-backend.onrender.com/api/ventes/create/`,
        {
          acheteur: selectedUser?.id || null,
          nom_acheteur: nomAcheteur,
          telephone_acheteur: telAcheteur,
          sexe_acheteur: sexeAcheteur || null,
          adresse_acheteur: adresseAcheteur || null,
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
      setActiveStep(0);
      setSelectedUser(null);
      setNomAcheteur("");
      setTelAcheteur("");
      setSexeAcheteur("");
      setAdresseAcheteur("");
      setUserCreationTab(0);
      fetchVentes(page);
      fetchStats();
    } catch (error) {
      console.error("Erreur lors de la création :", error);
    } finally {
      setSaving(false);
    }
  };

  // Gérer la création d'un nouvel utilisateur
  const handleUserCreated = (newUser: any) => {
    setUsers(prev => [...prev, newUser]);
    setSelectedUser(newUser);
    setNomAcheteur(newUser.nom || "");
    setTelAcheteur(newUser.telephone || "");
    setSexeAcheteur(newUser.sexe || "");
    setAdresseAcheteur(newUser.adresse || "");
    setUserCreationTab(0);
  };

  const defaultStats = {
    total_ventes: 0,
    montant_total: 0,
    ventes_par_mode: {
      cash: 0,
      mobile_money: 0,
      carte: 0
    },
    montant_par_mode: {
      cash: 0,
      mobile_money: 0,
      carte: 0
    },
    ventes_compteur: 0,
    ventes_rfid: 0
  };

  const displayStats = stats || defaultStats;

  const formatClientName = (vente: Vente) => {
    if (vente.nom_acheteur) {
      return vente.nom_acheteur;
    }
    if (vente.acheteur) {
      return `Utilisateur #${vente.acheteur}`;
    }
    return "Anonyme";
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

      {statsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          Chargement des statistiques...
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid sx={{ flex: '1 1 20%', minWidth: 200 }}>
            <Card sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="subtitle2">Total ventes</Typography>
              <Typography variant="h5">{displayStats.total_ventes}</Typography>
            </Card>
          </Grid>
          <Grid sx={{ flex: '1 1 20%', minWidth: 200 }}>
            <Card sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="subtitle2">Montant calculé</Typography>
              <Typography variant="h5">{displayStats.montant_total.toLocaleString()} $</Typography>
            </Card>
          </Grid>
          <Grid sx={{ flex: '1 1 20%', minWidth: 200 }}>
            <Card sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="subtitle2">Par RFID</Typography>
              <Typography variant="h5">{displayStats.ventes_rfid}</Typography>
            </Card>
          </Grid>
          <Grid sx={{ flex: '1 1 20%', minWidth: 200 }}>
            <Card sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="subtitle2">Par Compteur</Typography>
              <Typography variant="h5">{displayStats.ventes_compteur}</Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card sx={{ p: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Téléphone</TableCell>
                  <TableCell>Montant Calculé</TableCell>
                  <TableCell>Montant Payé</TableCell>
                  <TableCell>Mode Paiement</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Détails</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ventes.length > 0 ? (
                  ventes.map((vente) => (
                    <React.Fragment key={vente.id}>
                      <TableRow>
                        <TableCell>{vente.id}</TableCell>
                        <TableCell>{formatClientName(vente)}</TableCell>
                        <TableCell>{vente.telephone_acheteur || "N/A"}</TableCell>
                        <TableCell>{vente.montant_total} $</TableCell>
                        <TableCell>{vente.montant_paye} FC</TableCell>
                        <TableCell>
                          <Chip
                            label={vente.mode_paiement}
                            color={vente.mode_paiement === "cash" ? "success" : "primary"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={vente.statut}
                            color={vente.statut === "payé" ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(vente.date_vente).toLocaleString()}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const detailsElement = document.getElementById(`details-${vente.id}`);
                              if (detailsElement) {
                                detailsElement.style.display = detailsElement.style.display === 'none' ? 'table-row' : 'none';
                              }
                            }}
                          >
                            <ExpandMoreIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow id={`details-${vente.id}`} style={{ display: 'none' }}>
                        <TableCell colSpan={9}>
                          <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                            <Typography variant="h6" gutterBottom>Détails de la vente</Typography>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
                                <Typography variant="body2">
                                  <strong>Sexe:</strong> {vente.sexe_acheteur || "N/A"}
                                </Typography>
                              </Grid>
                              <Grid sx={{ width: { xs: '100%', sm: '50%' } }}>
                                <Typography variant="body2">
                                  <strong>Adresse:</strong> {vente.adresse_acheteur || "N/A"}
                                </Typography>
                              </Grid>
                            </Grid>
                            {vente.note && (
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                <strong>Note:</strong> {vente.note}
                              </Typography>
                            )}
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Produit</TableCell>
                                  <TableCell>Quantité</TableCell>
                                  <TableCell>Prix unitaire</TableCell>
                                  <TableCell>Montant</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {vente.details_read.map((detail) => (
                                  <TableRow key={detail.id}>
                                    <TableCell>{detail.produit_nom}</TableCell>
                                    <TableCell>{detail.quantite}</TableCell>
                                    <TableCell>{detail.prix_unitaire} $</TableCell>
                                    <TableCell>{detail.montant} $</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      Aucune vente trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Card>
      )}

      <Dialog open={openDialog} onClose={() => {
        if (!saving) {
          setOpenDialog(false);
          setActiveStep(0);
          setSelectedProduits([]);
          setSelectedUser(null);
          setNomAcheteur("");
          setTelAcheteur("");
          setSexeAcheteur("");
          setAdresseAcheteur("");
          setUserCreationTab(0);
        }
      }} fullWidth maxWidth="md">
        <DialogTitle>Nouvelle vente</DialogTitle>

        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Tabs value={userCreationTab} onChange={(_, newValue) => setUserCreationTab(newValue)}>
                <Tab label="Rechercher un utilisateur" />
                <Tab label="Créer un nouvel utilisateur" />
              </Tabs>

              {userCreationTab === 0 ? (
                <>
                  <Autocomplete
                    options={users}
                    getOptionLabel={(u) => `${u.nom} - ${u.email || u.telephone}`}
                    value={selectedUser}
                    onChange={(_, v) => {
                      setSelectedUser(v);
                      if (v) {
                        setNomAcheteur(v.nom || "");
                        setTelAcheteur(v.telephone || "");
                        setSexeAcheteur(v.sexe || "");
                        setAdresseAcheteur(v.adresse || "");
                      }
                    }}
                    onInputChange={(_, v) => setSearchUser(v)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Rechercher un utilisateur" 
                        helperText="Tapez au moins 3 caractères pour rechercher"
                      />
                    )}
                  />
                </>
              ) : (
                <CreateUserForm 
                  onUserCreated={handleUserCreated}
                  onCancel={() => setUserCreationTab(0)}
                />
              )}

              <TextField
                fullWidth
                label="Nom acheteur"
                value={nomAcheteur}
                onChange={(e) => setNomAcheteur(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Téléphone acheteur"
                value={telAcheteur}
                onChange={(e) => setTelAcheteur(e.target.value)}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Sexe</InputLabel>
                <Select
                  value={sexeAcheteur}
                  label="Sexe"
                  onChange={(e) => setSexeAcheteur(e.target.value as string)}
                >
                  <MenuItem value="M">Masculin</MenuItem>
                  <MenuItem value="F">Féminin</MenuItem>
                  <MenuItem value="Autre">Autre</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Adresse acheteur"
                value={adresseAcheteur}
                onChange={(e) => setAdresseAcheteur(e.target.value)}
                multiline
                rows={2}
              />
            </Box>
          )}

          {activeStep === 1 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
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
                    Montant total: <b>{montantTotal} $</b>
                  </Typography>

                  <TextField
                    label="Montant perçu"
                    type="number"
                    fullWidth
                    sx={{ mt: 2 }}
                    value={montantPaye}
                    onChange={(e) => setMontantPaye(parseInt(e.target.value) || 0)}
                  />
                </Card>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          {saving ? (
            <CircularProgress size={24} sx={{ mr: 2 }} />
          ) : (
            <>
              <Button disabled={activeStep === 0} onClick={() => setActiveStep(activeStep - 1)}>Retour</Button>
              {activeStep < steps.length - 1 ? (
                <Button 
                  variant="contained" 
                  onClick={() => setActiveStep(activeStep + 1)}
                  disabled={!nomAcheteur || !telAcheteur}
                >
                  Suivant
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={handleSave}
                  disabled={selectedProduits.length === 0}
                >
                  Enregistrer
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}