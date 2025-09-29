import React, { useEffect, useState } from "react";
import apiClient from "../../../utils/api";
import {
  Box, Card, Button, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Pagination, CircularProgress, Grid,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Stepper, Step, StepLabel, Autocomplete, Chip,
  MenuItem, Select, FormControl, InputLabel, Tabs, Tab, Alert, Snackbar,
  Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText,
  Divider, Paper
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PaymentIcon from "@mui/icons-material/Payment";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
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

interface PaiementVente {
  id: number;
  montant: string;
  date_paiement: string;
  mode_paiement: string;
  transaction_id: string | null;
  note: string | null;
  effectue_par: number;
  effectue_par_nom: string;
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
  reste_a_payer: string;
  mode_paiement: string;
  transaction_id: string | null;
  date_vente: string;
  statut: string;
  note: string | null;
  details_read: VenteDetail[];
  paiements?: PaiementVente[];
  historique_paiements?: PaiementVente[];
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
  total_dettes: number;
  nombre_ventes_acompte: number;
}

interface Compteur {
  id: number;
  nom: string;
  code_serie: string;
  prix?: number;
  statut?: string;
}

interface RFID {
  id: number;
  code_uid: string;
  telephone: string;
  prix?: number;
  solde_litres?: number;
  user_nom?: string;
  statut?: string;
}

interface User {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  role: string;
  state: boolean;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page_size: number;
  total_pages: number;
  current_page: number;
  results: Vente[];
}

// Composant pour créer un nouvel utilisateur
function CreateUserForm({ onUserCreated, onCancel }: { onUserCreated: (user: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    password: "",
    role: "client"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
      const response = await apiClient.post(
        "/api/users/create-list/",
        formData
      );
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

      <Grid container spacing={2} sx={{ mt: 2 }}>
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
      </Grid>

      <DialogActions sx={{ px: 0, mt: 2 }}>
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

// Composant pour ajouter un paiement
function AjouterPaiementForm({ vente, onPaiementAdded, onCancel }: {
  vente: Vente,
  onPaiementAdded: () => void,
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    montant: "",
    mode_paiement: "cash",
    transaction_id: "",
    note: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
      await apiClient.post(
        `/api/ventes/${vente.id}/paiements/`,
        {
          ...formData,
          montant: parseFloat(formData.montant)
        }
      );
      onPaiementAdded();
    } catch (err: any) {
      console.error("Erreur lors de l'ajout du paiement:", err);
      setError(err.response?.data?.message || "Erreur lors de l'ajout du paiement");
    } finally {
      setLoading(false);
    }
  };

  const resteAPayer = parseFloat(vente.reste_a_payer);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="h6" gutterBottom>
        Ajouter un paiement - Vente #{vente.id}
      </Typography>

      <Grid container spacing={2}>
        <Grid sx={{ width: { xs: '100%' } }}>
          <TextField
            fullWidth
            label="Montant"
            name="montant"
            type="number"
            value={formData.montant}
            onChange={handleInputChange}
            required
            inputProps={{
              min: 0,
              max: resteAPayer,
              step: 0.01
            }}
            helperText={`Reste à payer: ${resteAPayer.toFixed(2)} $`}
          />
        </Grid>
        <Grid sx={{ width: { xs: '100%' } }}>
          <FormControl fullWidth>
            <InputLabel>Mode de paiement</InputLabel>
            <Select
              name="mode_paiement"
              value={formData.mode_paiement}
              label="Mode de paiement"
              onChange={(e) => handleSelectChange("mode_paiement", e.target.value as string)}
            >
              <MenuItem value="cash">Espèces</MenuItem>
              <MenuItem value="mobile_money">Mobile Money</MenuItem>
              <MenuItem value="carte">Carte Bancaire</MenuItem>
              <MenuItem value="mixte">Mixte</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid sx={{ width: { xs: '100%' } }}>
          <TextField
            fullWidth
            label="ID de transaction (optionnel)"
            name="transaction_id"
            value={formData.transaction_id}
            onChange={handleInputChange}
          />
        </Grid>
        <Grid sx={{ width: { xs: '100%' } }}>
          <TextField
            fullWidth
            label="Note (optionnel)"
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            multiline
            rows={2}
          />
        </Grid>
      </Grid>

      <DialogActions sx={{ px: 0, mt: 2 }}>
        <Button onClick={onCancel}>Annuler</Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !formData.montant || parseFloat(formData.montant) <= 0}
          startIcon={loading ? <CircularProgress size={16} /> : <PaymentIcon />}
        >
          Ajouter le paiement
        </Button>
      </DialogActions>
    </Box>
  );
}

// Composant pour les filtres
function FiltresVentes({
  filtres,
  onFiltresChange,
  onResetFiltres
}: {
  filtres: any;
  onFiltresChange: (newFiltres: any) => void;
  onResetFiltres: () => void;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Grid container spacing={2}>
        <Grid sx={{ width: { xs: '100%' } }}>
          <TextField
            fullWidth
            label="Recherche"
            value={filtres.search}
            onChange={(e) => onFiltresChange({ ...filtres, search: e.target.value })}
            placeholder="Nom, téléphone..."
            size="small"
          />
        </Grid>

        <Grid sx={{ width: { xs: '100%' } }}>
          <FormControl fullWidth size="small">
            <InputLabel>Mode paiement</InputLabel>
            <Select
              value={filtres.mode_paiement}
              label="Mode paiement"
              onChange={(e) => onFiltresChange({ ...filtres, mode_paiement: e.target.value })}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="cash">Espèces</MenuItem>
              <MenuItem value="mobile_money">Mobile Money</MenuItem>
              <MenuItem value="carte">Carte Bancaire</MenuItem>
              <MenuItem value="mixte">Mixte</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid sx={{ width: { xs: '100%' } }}>
          <FormControl fullWidth size="small">
            <InputLabel>Statut</InputLabel>
            <Select
              value={filtres.statut}
              label="Statut"
              onChange={(e) => onFiltresChange({ ...filtres, statut: e.target.value })}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="payé">Payé</MenuItem>
              <MenuItem value="acompte">Acompte</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid sx={{ width: { xs: '100%' } }}>
          <TextField
            fullWidth
            label="Date début"
            type="date"
            value={filtres.date_debut}
            onChange={(e) => onFiltresChange({ ...filtres, date_debut: e.target.value })}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>

        <Grid sx={{ width: { xs: '100%' } }}>
          <TextField
            fullWidth
            label="Date fin"
            type="date"
            value={filtres.date_fin}
            onChange={(e) => onFiltresChange({ ...filtres, date_fin: e.target.value })}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <Button
          onClick={onResetFiltres}
          variant="outlined"
          size="small"
        >
          Réinitialiser les filtres
        </Button>
      </Box>
    </Box>
  );
}

export function VenteView() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [ventesAcompte, setVentesAcompte] = useState<Vente[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5); // Par défaut 5 ventes par page
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  // État pour les filtres
  const [filtres, setFiltres] = useState({
    search: "",
    mode_paiement: "",
    statut: "",
    date_debut: "",
    date_fin: ""
  });

  // États pour les dialogues
  const [openDialog, setOpenDialog] = useState(false);
  const [openPaiementDialog, setOpenPaiementDialog] = useState(false);
  const [openFiltresDialog, setOpenFiltresDialog] = useState(false);
  const [selectedVenteForPaiement, setSelectedVenteForPaiement] = useState<Vente | null>(null);
  const [userCreationTab, setUserCreationTab] = useState(0);

  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Informations acheteur", "Produits vendus"];

  // Acheteur
  const [searchUser, setSearchUser] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [nomAcheteur, setNomAcheteur] = useState("");
  const [telAcheteur, setTelAcheteur] = useState("");
  const [sexeAcheteur, setSexeAcheteur] = useState("");
  const [adresseAcheteur, setAdresseAcheteur] = useState("");

  // Produits
  const [searchCompteur, setSearchCompteur] = useState("");
  const [searchRFID, setSearchRFID] = useState("");
  const [compteurs, setCompteurs] = useState<Compteur[]>([]);
  const [rfids, setRfids] = useState<RFID[]>([]);
  const [selectedProduits, setSelectedProduits] = useState<any[]>([]);
  const [montantPaye, setMontantPaye] = useState<number>(0);

  // ✅ FILTRER LES PRODUITS DÉJÀ SÉLECTIONNÉS
  const filteredCompteurs = compteurs.filter(compteur =>
    !selectedProduits.some(produit => produit.type === 'compteur' && produit.id === compteur.id)
  );

  const filteredRFIDs = rfids.filter(rfid =>
    !selectedProduits.some(produit => produit.type === 'rfid' && produit.id === rfid.id)
  );

  // ✅ CHARGEMENT DES COMPTEURS ET RFID AU DÉMARRAGE
  useEffect(() => {
    fetchDefaultCompteurs();
    fetchDefaultRFIDs();
    fetchVentes();
    fetchStats();
    fetchVentesAcompte();
  }, [page, pageSize, activeTab, filtres]); // Ajout de filtres dans les dépendances

  // FONCTION POUR CHARGER LES VENTES AVEC PAGINATION ET FILTRES
  const fetchVentes = async () => {
    try {
      setLoading(true);

      // Construction des paramètres de requête
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString()
      });

      // Ajout des filtres s'ils sont définis
      if (filtres.search) params.append('search', filtres.search);
      if (filtres.mode_paiement) params.append('mode_paiement', filtres.mode_paiement);
      if (filtres.statut) params.append('statut', filtres.statut);
      if (filtres.date_debut) params.append('date_debut', filtres.date_debut);
      if (filtres.date_fin) params.append('date_fin', filtres.date_fin);

      const res = await apiClient.get(`/api/ventes/?${params}`);
      const data: PaginatedResponse = res.data;

      setVentes(data.results || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error("Erreur lors du fetch des ventes :", err);
      setVentes([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // FONCTION POUR CHARGER LES VENTES AVEC ACOMPTE
  const fetchVentesAcompte = async () => {
    try {
      const res = await apiClient.get(`/api/ventes/acomptes/?page=${page}&page_size=${pageSize}`);
      const data: PaginatedResponse = res.data;
      setVentesAcompte(data.results || []);
    } catch (err) {
      console.error("Erreur lors du fetch des ventes avec acompte :", err);
      setVentesAcompte([]);
    }
  };

  // FONCTION POUR CHARGER LES COMPTEURS PAR DÉFAUT
  const fetchDefaultCompteurs = async () => {
    try {
      const response = await apiClient.get(
        `/api/compteur/list-compteur-pagination/?statut=stock&page_size=10`
      );
      setCompteurs(response.data.results || []);
    } catch (err) {
      console.error("Erreur lors du chargement des compteurs par défaut:", err);
      setCompteurs([]);
    }
  };

  // ✅ FONCTION POUR CHARGER LES RFID PAR DÉFAUT
  const fetchDefaultRFIDs = async () => {
    try {
      const response = await apiClient.get(
        `/api/rfid/search/?statut=stock&page_size=10`
      );
      setRfids(response.data.results || []);
    } catch (err) {
      console.error("Erreur lors du chargement des RFID par défaut:", err);
      setRfids([]);
    }
  };

  // ✅ RECHARGE LES COMPTEURS ET RFID QUAND LE DIALOG S'OUVRE
  useEffect(() => {
    if (openDialog && activeStep === 1) {
      fetchDefaultCompteurs();
      fetchDefaultRFIDs();
    }
  }, [openDialog, activeStep]);

  // Gestion des changements de filtres
  const handleFiltresChange = (newFiltres: any) => {
    setFiltres(newFiltres);
    setPage(1); // Reset à la première page quand les filtres changent
  };

  // Réinitialisation des filtres
  const handleResetFiltres = () => {
    setFiltres({
      search: "",
      mode_paiement: "",
      statut: "",
      date_debut: "",
      date_fin: ""
    });
    setPage(1);
    setOpenFiltresDialog(false);
  };

  // Appliquer les filtres et fermer la boîte de dialogue
  const handleApplyFiltres = () => {
    setOpenFiltresDialog(false);
    setPage(1);
  };

  // Fonctions de recherche optimisées avec debounce
  const searchUsers = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setUsers([]);
      return;
    }

    try {
      const response = await apiClient.get(
        `/api/users/search/?search=${encodeURIComponent(searchTerm)}&page_size=10`
      );
      setUsers(response.data.results || []);
    } catch (err) {
      console.error("Erreur lors de la recherche d'utilisateurs:", err);
      setUsers([]);
    }
  };

  const searchCompteursAPI = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      return;
    }

    try {
      const response = await apiClient.get(
        `/api/compteur/search/?search=${encodeURIComponent(searchTerm)}&statut=stock&page_size=10`
      );
      setCompteurs(response.data.results || []);
    } catch (err) {
      console.error("Erreur lors de la recherche de compteurs:", err);
    }
  };

  const searchRFIDsAPI = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      return;
    }

    try {
      const response = await apiClient.get(
        `/api/rfid/search/?search=${encodeURIComponent(searchTerm)}&statut=stock&page_size=10`
      );
      setRfids(response.data.results || []);
    } catch (err) {
      console.error("Erreur lors de la recherche de RFID:", err);
    }
  };

  // Debounce pour les recherches
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchUser);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchUser]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchCompteur.trim() === "") {
        fetchDefaultCompteurs();
      } else {
        searchCompteursAPI(searchCompteur);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchCompteur]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchRFID.trim() === "") {
        fetchDefaultRFIDs();
      } else {
        searchRFIDsAPI(searchRFID);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchRFID]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await apiClient.get("/api/ventes/stats/");
      setStats(res.data);
    } catch (err) {
      console.error("Erreur lors du fetch des statistiques :", err);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

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
      if (montantPaye < 0) {
        setErrorMessage("Le montant payé ne peut pas être négatif");
        setOpenSnackbar(true);
        setSaving(false);
        return;
      }

      const produitAvecPrixNegatif = selectedProduits.find(p => (p.prix || 0) < 0);
      if (produitAvecPrixNegatif) {
        setErrorMessage("Le prix d'un produit ne peut pas être négatif");
        setOpenSnackbar(true);
        setSaving(false);
        return;
      }

      await apiClient.post(
        `/api/ventes/create/`,
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
        }
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
      setSearchCompteur("");
      setSearchRFID("");
      fetchVentes();
      fetchStats();
      fetchVentesAcompte();
      fetchDefaultCompteurs();
      fetchDefaultRFIDs();
    } catch (error: any) {
      console.error("Erreur lors de la création :", error);

      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.montant_paye) {
          setErrorMessage(errorData.montant_paye);
        } else if (errorData.details) {
          setErrorMessage(errorData.details);
        } else if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0];
          if (Array.isArray(firstError)) {
            setErrorMessage(firstError[0]);
          } else if (typeof firstError === 'string') {
            setErrorMessage(firstError);
          } else {
            setErrorMessage("Erreur lors de la création de la vente");
          }
        } else {
          setErrorMessage("Erreur lors de la création de la vente");
        }
      } else {
        setErrorMessage("Erreur de connexion au serveur");
      }
      setOpenSnackbar(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setErrorMessage("");
  };

  // Gérer la création d'un nouvel utilisateur
  const handleUserCreated = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    setSelectedUser(newUser);
    setNomAcheteur(newUser.nom || "");
    setTelAcheteur(newUser.telephone || "");
    setSexeAcheteur("");
    setAdresseAcheteur("");
    setUserCreationTab(0);
  };

  // Gérer l'ajout d'un paiement
  const handleAjouterPaiement = (vente: Vente) => {
    setSelectedVenteForPaiement(vente);
    setOpenPaiementDialog(true);
  };

  const handlePaiementAdded = () => {
    setOpenPaiementDialog(false);
    setSelectedVenteForPaiement(null);
    fetchVentes();
    fetchStats();
    fetchVentesAcompte();
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
    ventes_rfid: 0,
    total_dettes: 0,
    nombre_ventes_acompte: 0
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

  // Afficher un badge avec le nombre de filtres actifs
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filtres.search) count++;
    if (filtres.mode_paiement) count++;
    if (filtres.statut) count++;
    if (filtres.date_debut) count++;
    if (filtres.date_fin) count++;
    return count;
  };

  const renderVentesTable = (ventesList: Vente[], showPaiementButton: boolean = false) => {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Montant Total</TableCell>
              <TableCell>Montant Payé</TableCell>
              <TableCell>Reste à Payer</TableCell>
              <TableCell>Statut</TableCell>
              {showPaiementButton && <TableCell>Actions</TableCell>}
              <TableCell>Détails</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ventesList.length > 0 ? (
              ventesList.map((vente) => (
                <React.Fragment key={vente.id}>
                  <TableRow>
                    <TableCell>{vente.id}</TableCell>
                    <TableCell>{formatClientName(vente)}</TableCell>
                    <TableCell>{vente.telephone_acheteur || "N/A"}</TableCell>
                    <TableCell>{vente.montant_total} $</TableCell>
                    <TableCell>{vente.montant_paye} $</TableCell>
                    <TableCell>
                      <Typography
                        color={parseFloat(vente.reste_a_payer) > 0 ? "error" : "success"}
                        fontWeight="bold"
                      >
                        {vente.reste_a_payer} $
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={vente.statut}
                        color={
                          vente.statut === "payé" ? "success" :
                            vente.statut === "acompte" ? "warning" : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    {showPaiementButton && (
                      <TableCell>
                        {parseFloat(vente.reste_a_payer) > 0 && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PaymentIcon />}
                            onClick={() => handleAjouterPaiement(vente)}
                          >
                            Payer
                          </Button>
                        )}
                      </TableCell>
                    )}
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
                    <TableCell colSpan={showPaiementButton ? 9 : 8}>
                      <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="h6" gutterBottom>Détails de la vente #{vente.id}</Typography>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid sx={{ width: { xs: '100%', sm: '33%' } }}>
                            <Typography variant="body2">
                              <strong>Mode paiement:</strong> {vente.mode_paiement}
                            </Typography>
                          </Grid>
                          <Grid sx={{ width: { xs: '100%', sm: '33%' } }}>
                            <Typography variant="body2">
                              <strong>Date:</strong> {new Date(vente.date_vente).toLocaleString()}
                            </Typography>
                          </Grid>
                          <Grid sx={{ width: { xs: '100%', sm: '33%' } }}>
                            <Typography variant="body2">
                              <strong>Sexe:</strong> {vente.sexe_acheteur || "N/A"}
                            </Typography>
                          </Grid>
                        </Grid>

                        {vente.adresse_acheteur && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>Adresse:</strong> {vente.adresse_acheteur}
                          </Typography>
                        )}

                        {vente.note && (
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            <strong>Note:</strong> {vente.note}
                          </Typography>
                        )}

                        {/* Historique des paiements */}
                        {(vente.paiements && vente.paiements.length > 0) ||
                          (vente.historique_paiements && vente.historique_paiements.length > 0) ? (
                          <Accordion sx={{ mt: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Typography variant="subtitle1">
                                Historique des paiements ({vente.paiements?.length || vente.historique_paiements?.length || 0})
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List>
                                {(vente.paiements || vente.historique_paiements || []).map((paiement, index) => (
                                  <React.Fragment key={paiement.id}>
                                    <ListItem>
                                      <ListItemText
                                        primary={`${paiement.montant} $ - ${paiement.mode_paiement}`}
                                        secondary={
                                          `Par ${paiement.effectue_par_nom} le ${new Date(paiement.date_paiement).toLocaleString()}${paiement.note ? ` - ${paiement.note}` : ''}`
                                        }
                                      />
                                    </ListItem>
                                    {index < (vente.paiements?.length || vente.historique_paiements?.length || 0) - 1 && <Divider />}
                                  </React.Fragment>
                                ))}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        ) : null}

                        {/* Détails des produits */}
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                          Produits vendus
                        </Typography>
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
                <TableCell
                  colSpan={showPaiementButton ? 9 : 8}
                  align="center"
                >
                  Aucune vente trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
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

      {/* Snackbar pour afficher les erreurs */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {statsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          Chargement des statistiques...
        </Box>
      ) : (
        <Box sx={{ mb: 3 }}>
          {/* Slider pour mobile */}
          <Box sx={{
            display: { xs: 'block', sm: 'none' },
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}>
            <Box sx={{
              display: 'flex',
              gap: 2,
              minWidth: 'max-content',
              pb: 1
            }}>
              <Card sx={{ p: 2, textAlign: "center", minWidth: 200 }}>
                <Typography variant="subtitle2">Total ventes</Typography>
                <Typography variant="h5">{displayStats.total_ventes}</Typography>
              </Card>
              <Card sx={{ p: 2, textAlign: "center", minWidth: 200 }}>
                <Typography variant="subtitle2">Chiffre d'affaires</Typography>
                <Typography variant="h5">{displayStats.montant_total.toLocaleString()} $</Typography>
              </Card>
              <Card sx={{ p: 2, textAlign: "center", minWidth: 200 }}>
                <Typography variant="subtitle2">En cours de paiement</Typography>
                <Typography variant="h5">{displayStats.nombre_ventes_acompte}</Typography>
              </Card>
              <Card sx={{
                p: 2,
                textAlign: "center",
                minWidth: 200,
                backgroundColor: displayStats.total_dettes > 0 ? '#fff3cd' : 'inherit'
              }}>
                <Typography variant="subtitle2">Dettes en cours</Typography>
                <Typography variant="h5" color={displayStats.total_dettes > 0 ? "error" : "success"}>
                  {displayStats.total_dettes.toLocaleString()} $
                </Typography>
              </Card>
              <Card sx={{ p: 2, textAlign: "center", minWidth: 200 }}>
                <Typography variant="subtitle2">Taux de recouvrement</Typography>
                <Typography variant="h5">
                  {displayStats.montant_total > 0
                    ? `${((displayStats.montant_total - displayStats.total_dettes) / displayStats.montant_total * 100).toFixed(1)}%`
                    : '100%'
                  }
                </Typography>
              </Card>
            </Box>
          </Box>

          {/* Grille normale pour desktop */}
          <Grid container spacing={2} sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Grid sx={{
              flex: '1 1 20%',
              minWidth: 200,
              maxWidth: '20%'
            }}>
              <Card sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="subtitle2">Total ventes</Typography>
                <Typography variant="h5">{displayStats.total_ventes}</Typography>
              </Card>
            </Grid>
            <Grid sx={{
              flex: '1 1 20%',
              minWidth: 200,
              maxWidth: '20%'
            }}>
              <Card sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="subtitle2">Chiffre d'affaires</Typography>
                <Typography variant="h5">{displayStats.montant_total.toLocaleString()} $</Typography>
              </Card>
            </Grid>
            <Grid sx={{
              flex: '1 1 20%',
              minWidth: 200,
              maxWidth: '20%'
            }}>
              <Card sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="subtitle2">En cours de paiement</Typography>
                <Typography variant="h5">{displayStats.nombre_ventes_acompte}</Typography>
              </Card>
            </Grid>
            <Grid sx={{
              flex: '1 1 20%',
              minWidth: 200,
              maxWidth: '20%'
            }}>
              <Card sx={{
                p: 2,
                textAlign: "center",
                backgroundColor: displayStats.total_dettes > 0 ? '#fff3cd' : 'inherit'
              }}>
                <Typography variant="subtitle2">Dettes en cours</Typography>
                <Typography variant="h5" color={displayStats.total_dettes > 0 ? "error" : "success"}>
                  {displayStats.total_dettes.toLocaleString()} $
                </Typography>
              </Card>
            </Grid>
            <Grid sx={{
              flex: '1 1 20%',
              minWidth: 200,
              maxWidth: '20%'
            }}>
              <Card sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="subtitle2">Taux de recouvrement</Typography>
                <Typography variant="h5">
                  {displayStats.montant_total > 0
                    ? `${((displayStats.montant_total - displayStats.total_dettes) / displayStats.montant_total * 100).toFixed(1)}%`
                    : '100%'
                  }
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Bouton pour ouvrir les filtres */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<FilterListIcon />}
          onClick={() => setOpenFiltresDialog(true)}
          variant="outlined"
          sx={{ position: 'relative' }}
        >
          Filtres
          {getActiveFiltersCount() > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}
            >
              {getActiveFiltersCount()}
            </Box>
          )}
        </Button>
      </Box>

      {/* Tabs pour naviguer entre toutes les ventes et les acomptes */}
      <Card sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Toutes les ventes" />
          <Tab label="Ventes avec acompte" />
        </Tabs>
      </Card>

      {/* Contrôle de la pagination */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Total: {activeTab === 0 ? totalCount : ventesAcompte.length} ventes
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2">Ventes par page:</Typography>
          <Select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            size="small"
            sx={{ minWidth: 80 }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card sx={{ p: 2 }}>
          {activeTab === 0 ? renderVentesTable(ventes) : renderVentesTable(ventesAcompte, true)}

          {/* Pagination améliorée */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, p: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Page {page} sur {totalPages} - {activeTab === 0 ? ventes.length : ventesAcompte.length} ventes affichées
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Card>
      )}

      {/* Dialog pour les filtres */}
      <Dialog
        open={openFiltresDialog}
        onClose={() => setOpenFiltresDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1 }} />
            Filtres des ventes
            {getActiveFiltersCount() > 0 && (
              <Chip
                label={`${getActiveFiltersCount()} actif(s)`}
                size="small"
                color="primary"
                sx={{ ml: 2 }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <FiltresVentes
            filtres={filtres}
            onFiltresChange={handleFiltresChange}
            onResetFiltres={handleResetFiltres}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFiltresDialog(false)}>Fermer</Button>
          <Button
            onClick={handleApplyFiltres}
            variant="contained"
          >
            Appliquer les filtres
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour nouvelle vente */}
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
          setSearchUser("");
          setSearchCompteur("");
          setSearchRFID("");
          fetchDefaultCompteurs();
          fetchDefaultRFIDs();
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
                        setSexeAcheteur("");
                        setAdresseAcheteur("");
                      }
                    }}
                    onInputChange={(_, v) => setSearchUser(v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Rechercher un utilisateur"
                        helperText="Tapez au moins 2 caractères pour rechercher"
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
                  options={filteredCompteurs}
                  getOptionLabel={(p) => `${p.nom} (${p.code_serie})${p.statut ? ` - ${p.statut}` : ''}`}
                  onInputChange={(_, v) => setSearchCompteur(v)}
                  onChange={(_, v) =>
                    v && handleAddProduit({ ...v, prix: v.prix || 0 }, "compteur")
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Rechercher un compteur (stock uniquement)"
                      helperText={`${filteredCompteurs.length} compteurs disponibles - Les compteurs sélectionnés sont masqués`}
                    />
                  )}
                />

                <Autocomplete
                  sx={{ mt: 2 }}
                  options={filteredRFIDs}
                  getOptionLabel={(r) => {
                    const solde = r.solde_litres ? ` - Solde: ${r.solde_litres}L` : '';
                    const user = r.user_nom ? ` (${r.user_nom})` : '';
                    const statut = r.statut ? ` - ${r.statut}` : '';
                    return `${r.code_uid}${user}${solde}${statut}`;
                  }}
                  onInputChange={(_, v) => setSearchRFID(v)}
                  onChange={(_, v) =>
                    v && handleAddProduit({ ...v, prix: v.prix || 0 }, "rfid")
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Rechercher une carte RFID (stock uniquement)"
                      helperText={`${filteredRFIDs.length} cartes RFID disponibles - Les cartes sélectionnées sont masquées`}
                    />
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
                      <Box>
                        <Typography variant="body2">
                          {p.nom || p.code_uid} x {p.quantite}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {p.type} - {p.prix || 0} ${p.statut ? ` - ${p.statut}` : ''}
                        </Typography>
                      </Box>
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
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (value >= 0) {
                        setMontantPaye(value);
                      }
                    }}
                    error={montantPaye < 0}
                    helperText={montantPaye < 0 ? "Le montant ne peut pas être négatif" : ""}
                    inputProps={{ min: 0 }}
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
                  disabled={selectedProduits.length === 0 || montantPaye < 0}
                >
                  Enregistrer
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog pour ajouter un paiement */}
      <Dialog
        open={openPaiementDialog}
        onClose={() => {
          setOpenPaiementDialog(false);
          setSelectedVenteForPaiement(null);
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Ajouter un paiement</DialogTitle>
        <DialogContent>
          {selectedVenteForPaiement && (
            <AjouterPaiementForm
              vente={selectedVenteForPaiement}
              onPaiementAdded={handlePaiementAdded}
              onCancel={() => {
                setOpenPaiementDialog(false);
                setSelectedVenteForPaiement(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardContent>
  );
}