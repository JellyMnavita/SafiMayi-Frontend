import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import apiClient from "../../../utils/api";
import { Box, Card, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Pagination, CircularProgress, Grid, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Stepper, Step, StepLabel, Autocomplete, Chip, MenuItem, Select, FormControl, InputLabel, Tabs, Tab, Alert, Snackbar, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Divider } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PaymentIcon from "@mui/icons-material/Payment";
import FilterListIcon from "@mui/icons-material/FilterList";
import { IconButton } from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";
// Composant pour créer un nouvel utilisateur
function CreateUserForm({ onUserCreated, onCancel }) {
    const [formData, setFormData] = useState({
        nom: "",
        email: "",
        telephone: "",
        password: "",
        role: "client"
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await apiClient.post("/api/users/create-list/", formData);
            onUserCreated(response.data);
        }
        catch (err) {
            console.error("Erreur lors de la création de l'utilisateur:", err);
            setError(err.response?.data?.message || "Erreur lors de la création de l'utilisateur");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(Box, { component: "form", onSubmit: handleSubmit, sx: { mt: 2 }, children: [error && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), _jsxs(Grid, { container: true, spacing: 2, sx: { mt: 2 }, children: [_jsx(Grid, { sx: { width: { xs: '100%' } }, children: _jsx(TextField, { fullWidth: true, label: "Nom complet", name: "nom", value: formData.nom, onChange: handleInputChange, required: true }) }), _jsx(Grid, { sx: { width: { xs: '100%' } }, children: _jsx(TextField, { fullWidth: true, label: "Email", name: "email", type: "email", value: formData.email, onChange: handleInputChange, required: true }) }), _jsx(Grid, { sx: { width: { xs: '100%' } }, children: _jsx(TextField, { fullWidth: true, label: "T\u00E9l\u00E9phone", name: "telephone", value: formData.telephone, onChange: handleInputChange, required: true }) }), _jsx(Grid, { sx: { width: { xs: '100%' } }, children: _jsx(TextField, { fullWidth: true, label: "Mot de passe", name: "password", type: "password", value: formData.password, onChange: handleInputChange, required: true }) }), _jsx(Grid, { sx: { width: { xs: '100%' } }, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "R\u00F4le" }), _jsxs(Select, { name: "role", value: formData.role, label: "R\u00F4le", onChange: (e) => handleSelectChange("role", e.target.value), children: [_jsx(MenuItem, { value: "client", children: "Client" }), _jsx(MenuItem, { value: "owner", children: "Proprietaire de forage" })] })] }) })] }), _jsxs(DialogActions, { sx: { px: 0, mt: 2 }, children: [_jsx(Button, { onClick: onCancel, children: "Annuler" }), _jsx(Button, { type: "submit", variant: "contained", disabled: loading, startIcon: loading ? _jsx(CircularProgress, { size: 16 }) : _jsx(PersonAddIcon, {}), children: "Cr\u00E9er l'utilisateur" })] })] }));
}
// Composant pour ajouter un paiement
function AjouterPaiementForm({ vente, onPaiementAdded, onCancel }) {
    const [formData, setFormData] = useState({
        montant: "",
        mode_paiement: "cash",
        transaction_id: "",
        note: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await apiClient.post(`/api/ventes/${vente.id}/paiements/`, {
                ...formData,
                montant: parseFloat(formData.montant)
            });
            onPaiementAdded();
        }
        catch (err) {
            console.error("Erreur lors de l'ajout du paiement:", err);
            setError(err.response?.data?.message || "Erreur lors de l'ajout du paiement");
        }
        finally {
            setLoading(false);
        }
    };
    const resteAPayer = parseFloat(vente.reste_a_payer);
    return (_jsxs(Box, { component: "form", onSubmit: handleSubmit, sx: { mt: 2 }, children: [error && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), _jsxs(Typography, { variant: "h6", gutterBottom: true, children: ["Ajouter un paiement - Vente #", vente.id] }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { sx: { width: { xs: '100%' } }, children: _jsx(TextField, { fullWidth: true, label: "Montant", name: "montant", type: "number", value: formData.montant, onChange: handleInputChange, required: true, inputProps: {
                                min: 0,
                                max: resteAPayer,
                                step: 0.01
                            }, helperText: `Reste à payer: ${resteAPayer.toFixed(2)} $` }) }), _jsx(Grid, { sx: { width: { xs: '100%' } }, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Mode de paiement" }), _jsxs(Select, { name: "mode_paiement", value: formData.mode_paiement, label: "Mode de paiement", onChange: (e) => handleSelectChange("mode_paiement", e.target.value), children: [_jsx(MenuItem, { value: "cash", children: "Esp\u00E8ces" }), _jsx(MenuItem, { value: "mobile_money", children: "Mobile Money" }), _jsx(MenuItem, { value: "carte", children: "Carte Bancaire" })] })] }) }), _jsx(Grid, { sx: { width: { xs: '100%' } }, children: _jsx(TextField, { fullWidth: true, label: "ID de transaction (optionnel)", name: "transaction_id", value: formData.transaction_id, onChange: handleInputChange }) }), _jsx(Grid, { sx: { width: { xs: '100%' } }, children: _jsx(TextField, { fullWidth: true, label: "Note (optionnel)", name: "note", value: formData.note, onChange: handleInputChange, multiline: true, rows: 2 }) })] }), _jsxs(DialogActions, { sx: { px: 0, mt: 2 }, children: [_jsx(Button, { onClick: onCancel, children: "Annuler" }), _jsx(Button, { type: "submit", variant: "contained", disabled: loading || !formData.montant || parseFloat(formData.montant) <= 0, startIcon: loading ? _jsx(CircularProgress, { size: 16 }) : _jsx(PaymentIcon, {}), children: "Ajouter le paiement" })] })] }));
}
// Composant pour les filtres
function FiltresVentes({ filtres, onFiltresChange, onResetFiltres }) {
    return (_jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [_jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { sx: { width: { xs: '100%' } }, children: _jsx(TextField, { fullWidth: true, label: "Recherche", value: filtres.search, onChange: (e) => onFiltresChange({ ...filtres, search: e.target.value }), placeholder: "Nom, t\u00E9l\u00E9phone...", size: "small" }) }), _jsx(Grid, { sx: { width: { xs: '100%' } }, children: _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { children: "Mode paiement" }), _jsxs(Select, { value: filtres.mode_paiement, label: "Mode paiement", onChange: (e) => onFiltresChange({ ...filtres, mode_paiement: e.target.value }), children: [_jsx(MenuItem, { value: "", children: "Tous" }), _jsx(MenuItem, { value: "cash", children: "Esp\u00E8ces" }), _jsx(MenuItem, { value: "mobile_money", children: "Mobile Money" }), _jsx(MenuItem, { value: "carte", children: "Carte Bancaire" })] })] }) }), _jsx(Grid, { sx: { width: { xs: '100%' } }, children: _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { children: "Statut" }), _jsxs(Select, { value: filtres.statut, label: "Statut", onChange: (e) => onFiltresChange({ ...filtres, statut: e.target.value }), children: [_jsx(MenuItem, { value: "", children: "Tous" }), _jsx(MenuItem, { value: "pay\u00E9", children: "Pay\u00E9" }), _jsx(MenuItem, { value: "acompte", children: "Acompte" })] })] }) }), _jsx(Grid, { sx: { width: { xs: '100%' } }, children: _jsx(TextField, { fullWidth: true, label: "Date d\u00E9but", type: "date", value: filtres.date_debut, onChange: (e) => onFiltresChange({ ...filtres, date_debut: e.target.value }), InputLabelProps: { shrink: true }, size: "small" }) }), _jsx(Grid, { sx: { width: { xs: '100%' } }, children: _jsx(TextField, { fullWidth: true, label: "Date fin", type: "date", value: filtres.date_fin, onChange: (e) => onFiltresChange({ ...filtres, date_fin: e.target.value }), InputLabelProps: { shrink: true }, size: "small" }) })] }), _jsx(Box, { sx: { display: 'flex', justifyContent: 'flex-end', mt: 1 }, children: _jsx(Button, { onClick: onResetFiltres, variant: "outlined", size: "small", children: "R\u00E9initialiser les filtres" }) })] }));
}
export function VenteView() {
    const [ventes, setVentes] = useState([]);
    const [ventesAcompte, setVentesAcompte] = useState([]);
    const [stats, setStats] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(5); // Par défaut 5 ventes par page
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
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
    const [selectedVenteForPaiement, setSelectedVenteForPaiement] = useState(null);
    const [userCreationTab, setUserCreationTab] = useState(0);
    // Stepper state
    const [activeStep, setActiveStep] = useState(0);
    const steps = ["Informations acheteur", "Produits vendus"];
    // Acheteur
    const [searchUser, setSearchUser] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [nomAcheteur, setNomAcheteur] = useState("");
    const [telAcheteur, setTelAcheteur] = useState("");
    const [sexeAcheteur, setSexeAcheteur] = useState("");
    const [adresseAcheteur, setAdresseAcheteur] = useState("");
    // Produits
    const [searchCompteur, setSearchCompteur] = useState("");
    const [searchRFID, setSearchRFID] = useState("");
    const [compteurs, setCompteurs] = useState([]);
    const [rfids, setRfids] = useState([]);
    const [selectedProduits, setSelectedProduits] = useState([]);
    const [montantPaye, setMontantPaye] = useState(0);
    // ✅ FILTRER LES PRODUITS DÉJÀ SÉLECTIONNÉS
    const filteredCompteurs = compteurs.filter(compteur => !selectedProduits.some(produit => produit.type === 'compteur' && produit.id === compteur.id));
    const filteredRFIDs = rfids.filter(rfid => !selectedProduits.some(produit => produit.type === 'rfid' && produit.id === rfid.id));
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
            if (filtres.search)
                params.append('search', filtres.search);
            if (filtres.mode_paiement)
                params.append('mode_paiement', filtres.mode_paiement);
            if (filtres.statut)
                params.append('statut', filtres.statut);
            if (filtres.date_debut)
                params.append('date_debut', filtres.date_debut);
            if (filtres.date_fin)
                params.append('date_fin', filtres.date_fin);
            const res = await apiClient.get(`/api/ventes/?${params}`);
            const data = res.data;
            setVentes(data.results || []);
            setTotalPages(data.total_pages || 1);
            setTotalCount(data.count || 0);
        }
        catch (err) {
            console.error("Erreur lors du fetch des ventes :", err);
            setVentes([]);
            setTotalPages(1);
            setTotalCount(0);
        }
        finally {
            setLoading(false);
        }
    };
    // FONCTION POUR CHARGER LES VENTES AVEC ACOMPTE
    const fetchVentesAcompte = async () => {
        try {
            const res = await apiClient.get(`/api/ventes/acomptes/?page=${page}&page_size=${pageSize}`);
            const data = res.data;
            setVentesAcompte(data.results || []);
        }
        catch (err) {
            console.error("Erreur lors du fetch des ventes avec acompte :", err);
            setVentesAcompte([]);
        }
    };
    // FONCTION POUR CHARGER LES COMPTEURS PAR DÉFAUT
    const fetchDefaultCompteurs = async () => {
        try {
            const response = await apiClient.get(`/api/compteur/list-compteur-pagination/?statut=stock&page_size=10`);
            setCompteurs(response.data.results || []);
        }
        catch (err) {
            console.error("Erreur lors du chargement des compteurs par défaut:", err);
            setCompteurs([]);
        }
    };
    // ✅ FONCTION POUR CHARGER LES RFID PAR DÉFAUT
    const fetchDefaultRFIDs = async () => {
        try {
            const response = await apiClient.get(`/api/rfid/search/?statut=stock&page_size=10`);
            setRfids(response.data.results || []);
        }
        catch (err) {
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
    const handleFiltresChange = (newFiltres) => {
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
    const searchUsers = async (searchTerm) => {
        if (searchTerm.length < 2) {
            setUsers([]);
            return;
        }
        try {
            const response = await apiClient.get(`/api/users/search/?search=${encodeURIComponent(searchTerm)}&page_size=10`);
            setUsers(response.data.results || []);
        }
        catch (err) {
            console.error("Erreur lors de la recherche d'utilisateurs:", err);
            setUsers([]);
        }
    };
    const searchCompteursAPI = async (searchTerm) => {
        if (searchTerm.length < 2) {
            return;
        }
        try {
            const response = await apiClient.get(`/api/compteur/search/?search=${encodeURIComponent(searchTerm)}&statut=stock&page_size=10`);
            setCompteurs(response.data.results || []);
        }
        catch (err) {
            console.error("Erreur lors de la recherche de compteurs:", err);
        }
    };
    const searchRFIDsAPI = async (searchTerm) => {
        if (searchTerm.length < 2) {
            return;
        }
        try {
            const response = await apiClient.get(`/api/rfid/search/?search=${encodeURIComponent(searchTerm)}&statut=stock&page_size=10`);
            setRfids(response.data.results || []);
        }
        catch (err) {
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
            }
            else {
                searchCompteursAPI(searchCompteur);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchCompteur]);
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchRFID.trim() === "") {
                fetchDefaultRFIDs();
            }
            else {
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
        }
        catch (err) {
            console.error("Erreur lors du fetch des statistiques :", err);
            setStats(null);
        }
        finally {
            setStatsLoading(false);
        }
    };
    const handleAddProduit = (produit, type) => {
        setSelectedProduits([...selectedProduits, { ...produit, quantite: 1, type }]);
    };
    const handleRemoveProduit = (index) => {
        const updated = [...selectedProduits];
        updated.splice(index, 1);
        setSelectedProduits(updated);
    };
    const montantTotal = selectedProduits.reduce((sum, p) => sum + p.quantite * (p.prix || 0), 0);
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
            await apiClient.post(`/api/ventes/create/`, {
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
            });
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
        }
        catch (error) {
            console.error("Erreur lors de la création :", error);
            if (error.response?.data) {
                const errorData = error.response.data;
                if (errorData.montant_paye) {
                    setErrorMessage(errorData.montant_paye);
                }
                else if (errorData.details) {
                    setErrorMessage(errorData.details);
                }
                else if (typeof errorData === 'object') {
                    const firstError = Object.values(errorData)[0];
                    if (Array.isArray(firstError)) {
                        setErrorMessage(firstError[0]);
                    }
                    else if (typeof firstError === 'string') {
                        setErrorMessage(firstError);
                    }
                    else {
                        setErrorMessage("Erreur lors de la création de la vente");
                    }
                }
                else {
                    setErrorMessage("Erreur lors de la création de la vente");
                }
            }
            else {
                setErrorMessage("Erreur de connexion au serveur");
            }
            setOpenSnackbar(true);
        }
        finally {
            setSaving(false);
        }
    };
    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
        setErrorMessage("");
    };
    // Gérer la création d'un nouvel utilisateur
    const handleUserCreated = (newUser) => {
        setUsers(prev => [...prev, newUser]);
        setSelectedUser(newUser);
        setNomAcheteur(newUser.nom || "");
        setTelAcheteur(newUser.telephone || "");
        setSexeAcheteur("");
        setAdresseAcheteur("");
        setUserCreationTab(0);
    };
    // Gérer l'ajout d'un paiement
    const handleAjouterPaiement = (vente) => {
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
    const formatClientName = (vente) => {
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
        if (filtres.search)
            count++;
        if (filtres.mode_paiement)
            count++;
        if (filtres.statut)
            count++;
        if (filtres.date_debut)
            count++;
        if (filtres.date_fin)
            count++;
        return count;
    };
    const renderVentesTable = (ventesList, showPaiementButton = false) => {
        return (_jsx(TableContainer, { children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "ID" }), _jsx(TableCell, { children: "Client" }), _jsx(TableCell, { children: "T\u00E9l\u00E9phone" }), _jsx(TableCell, { children: "Montant Total" }), _jsx(TableCell, { children: "Montant Pay\u00E9" }), _jsx(TableCell, { children: "Reste \u00E0 Payer" }), _jsx(TableCell, { children: "Statut" }), showPaiementButton && _jsx(TableCell, { children: "Actions" }), _jsx(TableCell, { children: "D\u00E9tails" })] }) }), _jsx(TableBody, { children: ventesList.length > 0 ? (ventesList.map((vente) => (_jsxs(React.Fragment, { children: [_jsxs(TableRow, { children: [_jsx(TableCell, { children: vente.id }), _jsx(TableCell, { children: formatClientName(vente) }), _jsx(TableCell, { children: vente.telephone_acheteur || "N/A" }), _jsxs(TableCell, { children: [vente.montant_total, " $"] }), _jsxs(TableCell, { children: [vente.montant_paye, " $"] }), _jsx(TableCell, { children: _jsxs(Typography, { color: parseFloat(vente.reste_a_payer) > 0 ? "error" : "success", fontWeight: "bold", children: [vente.reste_a_payer, " $"] }) }), _jsx(TableCell, { children: _jsx(Chip, { label: vente.statut, color: vente.statut === "payé" ? "success" :
                                                    vente.statut === "acompte" ? "warning" : "default", size: "small" }) }), showPaiementButton && (_jsx(TableCell, { children: parseFloat(vente.reste_a_payer) > 0 && (_jsx(Button, { size: "small", variant: "outlined", startIcon: _jsx(PaymentIcon, {}), onClick: () => handleAjouterPaiement(vente), children: "Payer" })) })), _jsx(TableCell, { children: _jsx(IconButton, { size: "small", onClick: () => {
                                                    const detailsElement = document.getElementById(`details-${vente.id}`);
                                                    if (detailsElement) {
                                                        detailsElement.style.display = detailsElement.style.display === 'none' ? 'table-row' : 'none';
                                                    }
                                                }, children: _jsx(ExpandMoreIcon, {}) }) })] }), _jsx(TableRow, { id: `details-${vente.id}`, style: { display: 'none' }, children: _jsx(TableCell, { colSpan: showPaiementButton ? 9 : 8, children: _jsxs(Box, { sx: { p: 2, backgroundColor: '#f5f5f5' }, children: [_jsxs(Typography, { variant: "h6", gutterBottom: true, children: ["D\u00E9tails de la vente #", vente.id] }), _jsxs(Grid, { container: true, spacing: 2, sx: { mb: 2 }, children: [_jsx(Grid, { sx: { width: { xs: '100%', sm: '33%' } }, children: _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Mode paiement:" }), " ", vente.mode_paiement] }) }), _jsx(Grid, { sx: { width: { xs: '100%', sm: '33%' } }, children: _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Date:" }), " ", new Date(vente.date_vente).toLocaleString()] }) }), _jsx(Grid, { sx: { width: { xs: '100%', sm: '33%' } }, children: _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Sexe:" }), " ", vente.sexe_acheteur || "N/A"] }) })] }), vente.adresse_acheteur && (_jsxs(Typography, { variant: "body2", sx: { mb: 1 }, children: [_jsx("strong", { children: "Adresse:" }), " ", vente.adresse_acheteur] })), vente.note && (_jsxs(Typography, { variant: "body2", color: "textSecondary", sx: { mb: 2 }, children: [_jsx("strong", { children: "Note:" }), " ", vente.note] })), (vente.paiements && vente.paiements.length > 0) ||
                                                    (vente.historique_paiements && vente.historique_paiements.length > 0) ? (_jsxs(Accordion, { sx: { mt: 2 }, children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, {}), children: _jsxs(Typography, { variant: "subtitle1", children: ["Historique des paiements (", vente.paiements?.length || vente.historique_paiements?.length || 0, ")"] }) }), _jsx(AccordionDetails, { children: _jsx(List, { children: (vente.paiements || vente.historique_paiements || []).map((paiement, index) => (_jsxs(React.Fragment, { children: [_jsx(ListItem, { children: _jsx(ListItemText, { primary: `${paiement.montant} $ - ${paiement.mode_paiement}`, secondary: `Par ${paiement.effectue_par_nom} le ${new Date(paiement.date_paiement).toLocaleString()}${paiement.note ? ` - ${paiement.note}` : ''}` }) }), index < (vente.paiements?.length || vente.historique_paiements?.length || 0) - 1 && _jsx(Divider, {})] }, paiement.id))) }) })] })) : null, _jsx(Typography, { variant: "subtitle1", sx: { mt: 2, mb: 1 }, children: "Produits vendus" }), _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Produit" }), _jsx(TableCell, { children: "Quantit\u00E9" }), _jsx(TableCell, { children: "Prix unitaire" }), _jsx(TableCell, { children: "Montant" })] }) }), _jsx(TableBody, { children: vente.details_read.map((detail) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: detail.produit_nom }), _jsx(TableCell, { children: detail.quantite }), _jsxs(TableCell, { children: [detail.prix_unitaire, " $"] }), _jsxs(TableCell, { children: [detail.montant, " $"] })] }, detail.id))) })] })] }) }) })] }, vente.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: showPaiementButton ? 9 : 8, align: "center", children: "Aucune vente trouv\u00E9e" }) })) })] }) }));
    };
    return (_jsxs(DashboardContent, { children: [_jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 3, flexWrap: "wrap" }, children: [_jsx(Typography, { variant: "h4", children: "Journal des ventes" }), _jsx(Button, { variant: "contained", color: "inherit", startIcon: _jsx(Iconify, { icon: "mingcute:add-line" }), onClick: () => setOpenDialog(true), children: "Nouvelle vente" })] }), _jsx(Snackbar, { open: openSnackbar, autoHideDuration: 6000, onClose: handleCloseSnackbar, anchorOrigin: { vertical: 'top', horizontal: 'center' }, children: _jsx(Alert, { onClose: handleCloseSnackbar, severity: "error", sx: { width: '100%' }, children: errorMessage }) }), statsLoading ? (_jsx(Box, { sx: { display: "flex", justifyContent: "center", mb: 3 }, children: "Chargement des statistiques..." })) : (_jsxs(Box, { sx: { mb: 3 }, children: [_jsx(Box, { sx: {
                            display: { xs: 'block', sm: 'none' },
                            overflowX: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            '&::-webkit-scrollbar': {
                                display: 'none'
                            },
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none'
                        }, children: _jsxs(Box, { sx: {
                                display: 'flex',
                                gap: 2,
                                minWidth: 'max-content',
                                pb: 1
                            }, children: [_jsxs(Card, { sx: { p: 2, textAlign: "center", minWidth: 200 }, children: [_jsx(Typography, { variant: "subtitle2", children: "Total ventes" }), _jsx(Typography, { variant: "h5", children: displayStats.total_ventes })] }), _jsxs(Card, { sx: { p: 2, textAlign: "center", minWidth: 200 }, children: [_jsx(Typography, { variant: "subtitle2", children: "Chiffre d'affaires" }), _jsxs(Typography, { variant: "h5", children: [displayStats.montant_total.toLocaleString(), " $"] })] }), _jsxs(Card, { sx: { p: 2, textAlign: "center", minWidth: 200 }, children: [_jsx(Typography, { variant: "subtitle2", children: "En cours de paiement" }), _jsx(Typography, { variant: "h5", children: displayStats.nombre_ventes_acompte })] }), _jsxs(Card, { sx: {
                                        p: 2,
                                        textAlign: "center",
                                        minWidth: 200,
                                        backgroundColor: displayStats.total_dettes > 0 ? '#fff3cd' : 'inherit'
                                    }, children: [_jsx(Typography, { variant: "subtitle2", children: "Dettes en cours" }), _jsxs(Typography, { variant: "h5", color: displayStats.total_dettes > 0 ? "error" : "success", children: [displayStats.total_dettes.toLocaleString(), " $"] })] }), _jsxs(Card, { sx: { p: 2, textAlign: "center", minWidth: 200 }, children: [_jsx(Typography, { variant: "subtitle2", children: "Taux de recouvrement" }), _jsx(Typography, { variant: "h5", children: displayStats.montant_total > 0
                                                ? `${((displayStats.montant_total - displayStats.total_dettes) / displayStats.montant_total * 100).toFixed(1)}%`
                                                : '100%' })] })] }) }), _jsxs(Grid, { container: true, spacing: 2, sx: { display: { xs: 'none', sm: 'flex' } }, children: [_jsx(Grid, { sx: {
                                    flex: '1 1 20%',
                                    minWidth: 200,
                                    maxWidth: '20%'
                                }, children: _jsxs(Card, { sx: { p: 2, textAlign: "center" }, children: [_jsx(Typography, { variant: "subtitle2", children: "Total ventes" }), _jsx(Typography, { variant: "h5", children: displayStats.total_ventes })] }) }), _jsx(Grid, { sx: {
                                    flex: '1 1 20%',
                                    minWidth: 200,
                                    maxWidth: '20%'
                                }, children: _jsxs(Card, { sx: { p: 2, textAlign: "center" }, children: [_jsx(Typography, { variant: "subtitle2", children: "Chiffre d'affaires" }), _jsxs(Typography, { variant: "h5", children: [displayStats.montant_total.toLocaleString(), " $"] })] }) }), _jsx(Grid, { sx: {
                                    flex: '1 1 20%',
                                    minWidth: 200,
                                    maxWidth: '20%'
                                }, children: _jsxs(Card, { sx: {
                                        p: 2,
                                        textAlign: "center",
                                        backgroundColor: displayStats.total_dettes > 0 ? '#fff3cd' : 'inherit'
                                    }, children: [_jsx(Typography, { variant: "subtitle2", children: "Dettes en cours" }), _jsxs(Typography, { variant: "h5", color: displayStats.total_dettes > 0 ? "error" : "success", children: [displayStats.total_dettes.toLocaleString(), " $"] })] }) }), _jsx(Grid, { sx: {
                                    flex: '1 1 20%',
                                    minWidth: 200,
                                    maxWidth: '20%'
                                }, children: _jsxs(Card, { sx: { p: 2, textAlign: "center" }, children: [_jsx(Typography, { variant: "subtitle2", children: "Taux de recouvrement" }), _jsx(Typography, { variant: "h5", children: displayStats.montant_total > 0
                                                ? `${((displayStats.montant_total - displayStats.total_dettes) / displayStats.montant_total * 100).toFixed(1)}%`
                                                : '100%' })] }) })] })] })), _jsx(Box, { sx: { display: 'flex', justifyContent: 'flex-end', mb: 2 }, children: _jsxs(Button, { startIcon: _jsx(FilterListIcon, {}), onClick: () => setOpenFiltresDialog(true), variant: "outlined", sx: { position: 'relative' }, children: ["Filtres", getActiveFiltersCount() > 0 && (_jsx(Box, { sx: {
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
                            }, children: getActiveFiltersCount() }))] }) }), _jsx(Card, { sx: { mb: 2 }, children: _jsxs(Tabs, { value: activeTab, onChange: (_, newValue) => setActiveTab(newValue), children: [_jsx(Tab, { label: "Toutes les ventes" }), _jsx(Tab, { label: "Ventes avec acompte" })] }) }), _jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }, children: [_jsxs(Typography, { variant: "body2", color: "textSecondary", children: ["Total: ", activeTab === 0 ? totalCount : ventesAcompte.length, " ventes"] }), _jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [_jsx(Typography, { variant: "body2", children: "Ventes par page:" }), _jsxs(Select, { value: pageSize, onChange: (e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(1);
                                }, size: "small", sx: { minWidth: 80 }, children: [_jsx(MenuItem, { value: 5, children: "5" }), _jsx(MenuItem, { value: 10, children: "10" }), _jsx(MenuItem, { value: 20, children: "20" }), _jsx(MenuItem, { value: 50, children: "50" })] })] })] }), loading ? (_jsx(Box, { sx: { display: "flex", justifyContent: "center", mt: 5 }, children: _jsx(CircularProgress, {}) })) : (_jsxs(Card, { sx: { p: 2 }, children: [activeTab === 0 ? renderVentesTable(ventes) : renderVentesTable(ventesAcompte, true), totalPages > 1 && (_jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, p: 2 }, children: [_jsxs(Typography, { variant: "body2", color: "textSecondary", children: ["Page ", page, " sur ", totalPages, " - ", activeTab === 0 ? ventes.length : ventesAcompte.length, " ventes affich\u00E9es"] }), _jsx(Pagination, { count: totalPages, page: page, onChange: (_, value) => setPage(value), color: "primary", showFirstButton: true, showLastButton: true })] }))] })), _jsxs(Dialog, { open: openFiltresDialog, onClose: () => setOpenFiltresDialog(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center' }, children: [_jsx(FilterListIcon, { sx: { mr: 1 } }), "Filtres des ventes", getActiveFiltersCount() > 0 && (_jsx(Chip, { label: `${getActiveFiltersCount()} actif(s)`, size: "small", color: "primary", sx: { ml: 2 } }))] }) }), _jsx(DialogContent, { children: _jsx(FiltresVentes, { filtres: filtres, onFiltresChange: handleFiltresChange, onResetFiltres: handleResetFiltres }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpenFiltresDialog(false), children: "Fermer" }), _jsx(Button, { onClick: handleApplyFiltres, variant: "contained", children: "Appliquer les filtres" })] })] }), _jsxs(Dialog, { open: openDialog, onClose: () => {
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
                }, fullWidth: true, maxWidth: "md", children: [_jsx(DialogTitle, { children: "Nouvelle vente" }), _jsxs(DialogContent, { children: [_jsx(Stepper, { activeStep: activeStep, sx: { mb: 3 }, children: steps.map((label) => (_jsx(Step, { children: _jsx(StepLabel, { children: label }) }, label))) }), activeStep === 0 && (_jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [_jsxs(Tabs, { value: userCreationTab, onChange: (_, newValue) => setUserCreationTab(newValue), children: [_jsx(Tab, { label: "Rechercher un utilisateur" }), _jsx(Tab, { label: "Cr\u00E9er un nouvel utilisateur" })] }), userCreationTab === 0 ? (_jsx(_Fragment, { children: _jsx(Autocomplete, { options: users, getOptionLabel: (u) => `${u.nom} - ${u.email || u.telephone}`, value: selectedUser, onChange: (_, v) => {
                                                setSelectedUser(v);
                                                if (v) {
                                                    setNomAcheteur(v.nom || "");
                                                    setTelAcheteur(v.telephone || "");
                                                    setSexeAcheteur("");
                                                    setAdresseAcheteur("");
                                                }
                                            }, onInputChange: (_, v) => setSearchUser(v), renderInput: (params) => (_jsx(TextField, { ...params, label: "Rechercher un utilisateur", helperText: "Tapez au moins 2 caract\u00E8res pour rechercher" })) }) })) : (_jsx(CreateUserForm, { onUserCreated: handleUserCreated, onCancel: () => setUserCreationTab(0) })), _jsx(TextField, { fullWidth: true, label: "Nom acheteur", value: nomAcheteur, onChange: (e) => setNomAcheteur(e.target.value), required: true }), _jsx(TextField, { fullWidth: true, label: "T\u00E9l\u00E9phone acheteur", value: telAcheteur, onChange: (e) => setTelAcheteur(e.target.value), required: true }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Sexe" }), _jsxs(Select, { value: sexeAcheteur, label: "Sexe", onChange: (e) => setSexeAcheteur(e.target.value), children: [_jsx(MenuItem, { value: "M", children: "Masculin" }), _jsx(MenuItem, { value: "F", children: "F\u00E9minin" })] })] }), _jsx(TextField, { fullWidth: true, label: "Adresse acheteur", value: adresseAcheteur, onChange: (e) => setAdresseAcheteur(e.target.value), multiline: true, rows: 2 })] })), activeStep === 1 && (_jsxs(Box, { sx: {
                                    display: "flex",
                                    flexDirection: { xs: "column", md: "row" },
                                    gap: 2,
                                }, children: [_jsxs(Box, { sx: { flex: 1 }, children: [_jsx(Autocomplete, { options: filteredCompteurs, getOptionLabel: (p) => `${p.nom} (${p.code_serie})${p.statut ? ` - ${p.statut}` : ''}`, onInputChange: (_, v) => setSearchCompteur(v), onChange: (_, v) => v && handleAddProduit({ ...v, prix: v.prix || 0 }, "compteur"), renderInput: (params) => (_jsx(TextField, { ...params, label: "Rechercher un compteur (stock uniquement)", helperText: `${filteredCompteurs.length} compteurs disponibles - Les compteurs sélectionnés sont masqués` })) }), _jsx(Autocomplete, { sx: { mt: 2 }, options: filteredRFIDs, getOptionLabel: (r) => {
                                                    const solde = r.solde_litres ? ` - Solde: ${r.solde_litres}L` : '';
                                                    const user = r.user_nom ? ` (${r.user_nom})` : '';
                                                    const statut = r.statut ? ` - ${r.statut}` : '';
                                                    return `${r.code_uid}${user}${solde}${statut}`;
                                                }, onInputChange: (_, v) => setSearchRFID(v), onChange: (_, v) => v && handleAddProduit({ ...v, prix: v.prix || 0 }, "rfid"), renderInput: (params) => (_jsx(TextField, { ...params, label: "Rechercher une carte RFID (stock uniquement)", helperText: `${filteredRFIDs.length} cartes RFID disponibles - Les cartes sélectionnées sont masquées` })) })] }), _jsx(Box, { sx: { flex: 1 }, children: _jsxs(Card, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", children: "Produits s\u00E9lectionn\u00E9s" }), selectedProduits.map((p, i) => (_jsxs(Box, { sx: {
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        p: 1,
                                                        mb: 0.5,
                                                        border: "1px solid #e0e0e0",
                                                        borderRadius: 1.5,
                                                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                                        backgroundColor: "#fafafa",
                                                    }, children: [_jsxs(Box, { children: [_jsxs(Typography, { variant: "body2", children: [p.nom || p.code_uid, " x ", p.quantite] }), _jsxs(Typography, { variant: "caption", color: "textSecondary", children: [p.type, " - ", p.prix || 0, " $", p.statut ? ` - ${p.statut}` : ''] })] }), _jsx(IconButton, { color: "error", onClick: () => handleRemoveProduit(i), children: _jsx(DeleteIcon, {}) })] }, i))), _jsxs(Typography, { sx: { mt: 2 }, children: ["Montant total: ", _jsxs("b", { children: [montantTotal, " $"] })] }), _jsx(TextField, { label: "Montant per\u00E7u", type: "number", fullWidth: true, sx: { mt: 2 }, value: montantPaye, onChange: (e) => {
                                                        const value = parseInt(e.target.value) || 0;
                                                        if (value >= 0) {
                                                            setMontantPaye(value);
                                                        }
                                                    }, error: montantPaye < 0, helperText: montantPaye < 0 ? "Le montant ne peut pas être négatif" : "", inputProps: { min: 0 } })] }) })] }))] }), _jsx(DialogActions, { children: saving ? (_jsx(CircularProgress, { size: 24, sx: { mr: 2 } })) : (_jsxs(_Fragment, { children: [_jsx(Button, { disabled: activeStep === 0, onClick: () => setActiveStep(activeStep - 1), children: "Retour" }), activeStep < steps.length - 1 ? (_jsx(Button, { variant: "contained", onClick: () => setActiveStep(activeStep + 1), disabled: !nomAcheteur || !telAcheteur, children: "Suivant" })) : (_jsx(Button, { variant: "contained", color: "success", onClick: handleSave, disabled: selectedProduits.length === 0 || montantPaye < 0, children: "Enregistrer" }))] })) })] }), _jsxs(Dialog, { open: openPaiementDialog, onClose: () => {
                    setOpenPaiementDialog(false);
                    setSelectedVenteForPaiement(null);
                }, fullWidth: true, maxWidth: "sm", children: [_jsx(DialogTitle, { children: "Ajouter un paiement" }), _jsx(DialogContent, { children: selectedVenteForPaiement && (_jsx(AjouterPaiementForm, { vente: selectedVenteForPaiement, onPaiementAdded: handlePaiementAdded, onCancel: () => {
                                setOpenPaiementDialog(false);
                                setSelectedVenteForPaiement(null);
                            } })) })] })] }));
}
