import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import apiClient from "../../../utils/api";
import { Box, Card, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Pagination, CircularProgress, Grid, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Stepper, Step, StepLabel, Autocomplete, Chip, MenuItem, Select, FormControl, InputLabel, Tabs, Tab, Alert, Snackbar } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
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
    // Gestionnaire pour les champs TextField
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Gestionnaire spécifique pour les Select
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
            const token = localStorage.getItem("token");
            const response = await apiClient.post("/api/users/create-list/", formData);
            // Appeler le callback avec le nouvel utilisateur créé
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
export function VenteView() {
    const [ventes, setVentes] = useState([]);
    const [stats, setStats] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
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
    const [compteurs, setCompteurs] = useState([]);
    const [rfids, setRfids] = useState([]);
    const [selectedProduits, setSelectedProduits] = useState([]);
    const [montantPaye, setMontantPaye] = useState(0);
    const fetchVentes = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/api/ventes/`);
            setVentes(res.data || []);
            setTotalPages(1);
        }
        catch (err) {
            console.error("Erreur lors du fetch des ventes :", err);
            setVentes([]);
        }
        finally {
            setLoading(false);
        }
    };
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
    // Recherche user dynamique
    useEffect(() => {
        if (searchUser.length > 2) {
            apiClient
                .get(`/api/users/create-list/?search=${searchUser}`)
                .then((res) => setUsers(res.data || []))
                .catch((err) => {
                console.error(err);
                setUsers([]);
            });
        }
        else {
            setUsers([]);
        }
    }, [searchUser]);
    const fetchCompteursEtRfids = async () => {
        try {
            const [compteursRes, rfidsRes] = await Promise.all([
                apiClient.get("/api/compteur/inactifs/"),
                apiClient.get("/api/rfid/"),
            ]);
            setCompteurs(compteursRes.data || []);
            setRfids(rfidsRes.data || []);
        }
        catch (err) {
            console.error("Erreur lors du fetch des compteurs ou RFID :", err);
            setCompteurs([]);
            setRfids([]);
        }
    };
    useEffect(() => {
        fetchVentes();
        fetchStats();
        fetchCompteursEtRfids();
    }, [page]);
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
            // Validation côté client pour les montants négatifs
            if (montantPaye < 0) {
                setErrorMessage("Le montant payé ne peut pas être négatif");
                setOpenSnackbar(true);
                setSaving(false);
                return;
            }
            // Vérifier si les produits ont des prix négatifs
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
            fetchVentes();
            fetchStats();
        }
        catch (error) {
            console.error("Erreur lors de la création :", error);
            // Gestion des erreurs de validation du backend
            if (error.response?.data) {
                const errorData = error.response.data;
                if (errorData.montant_paye) {
                    setErrorMessage(errorData.montant_paye);
                }
                else if (errorData.details) {
                    setErrorMessage(errorData.details);
                }
                else if (typeof errorData === 'object') {
                    // Parcourir toutes les erreurs possibles
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
    const formatClientName = (vente) => {
        if (vente.nom_acheteur) {
            return vente.nom_acheteur;
        }
        if (vente.acheteur) {
            return `Utilisateur #${vente.acheteur}`;
        }
        return "Anonyme";
    };
    return (_jsxs(DashboardContent, { children: [_jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 3, flexWrap: "wrap" }, children: [_jsx(Typography, { variant: "h4", children: "Journal des ventes" }), _jsx(Button, { variant: "contained", color: "inherit", startIcon: _jsx(Iconify, { icon: "mingcute:add-line" }), onClick: () => setOpenDialog(true), children: "Nouvelle vente" })] }), _jsx(Snackbar, { open: openSnackbar, autoHideDuration: 6000, onClose: handleCloseSnackbar, anchorOrigin: { vertical: 'top', horizontal: 'center' }, children: _jsx(Alert, { onClose: handleCloseSnackbar, severity: "error", sx: { width: '100%' }, children: errorMessage }) }), statsLoading ? (_jsx(Box, { sx: { display: "flex", justifyContent: "center", mb: 3 }, children: "Chargement des statistiques..." })) : (_jsxs(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [_jsx(Grid, { sx: { flex: '1 1 20%', minWidth: 200 }, children: _jsxs(Card, { sx: { p: 2, textAlign: "center" }, children: [_jsx(Typography, { variant: "subtitle2", children: "Total ventes" }), _jsx(Typography, { variant: "h5", children: displayStats.total_ventes })] }) }), _jsx(Grid, { sx: { flex: '1 1 20%', minWidth: 200 }, children: _jsxs(Card, { sx: { p: 2, textAlign: "center" }, children: [_jsx(Typography, { variant: "subtitle2", children: "Montant calcul\u00E9" }), _jsxs(Typography, { variant: "h5", children: [displayStats.montant_total.toLocaleString(), " $"] })] }) }), _jsx(Grid, { sx: { flex: '1 1 20%', minWidth: 200 }, children: _jsxs(Card, { sx: { p: 2, textAlign: "center" }, children: [_jsx(Typography, { variant: "subtitle2", children: "Par RFID" }), _jsx(Typography, { variant: "h5", children: displayStats.ventes_rfid })] }) }), _jsx(Grid, { sx: { flex: '1 1 20%', minWidth: 200 }, children: _jsxs(Card, { sx: { p: 2, textAlign: "center" }, children: [_jsx(Typography, { variant: "subtitle2", children: "Par Compteur" }), _jsx(Typography, { variant: "h5", children: displayStats.ventes_compteur })] }) })] })), loading ? (_jsx(Box, { sx: { display: "flex", justifyContent: "center", mt: 5 }, children: _jsx(CircularProgress, {}) })) : (_jsxs(Card, { sx: { p: 2 }, children: [_jsx(TableContainer, { children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "ID" }), _jsx(TableCell, { children: "Client" }), _jsx(TableCell, { children: "T\u00E9l\u00E9phone" }), _jsx(TableCell, { children: "Montant Calcul\u00E9" }), _jsx(TableCell, { children: "Montant Pay\u00E9" }), _jsx(TableCell, { children: "Mode Paiement" }), _jsx(TableCell, { children: "Statut" }), _jsx(TableCell, { children: "Date" }), _jsx(TableCell, { children: "D\u00E9tails" })] }) }), _jsx(TableBody, { children: ventes.length > 0 ? (ventes.map((vente) => (_jsxs(React.Fragment, { children: [_jsxs(TableRow, { children: [_jsx(TableCell, { children: vente.id }), _jsx(TableCell, { children: formatClientName(vente) }), _jsx(TableCell, { children: vente.telephone_acheteur || "N/A" }), _jsxs(TableCell, { children: [vente.montant_total, " $"] }), _jsxs(TableCell, { children: [vente.montant_paye, " $"] }), _jsx(TableCell, { children: _jsx(Chip, { label: vente.mode_paiement, color: vente.mode_paiement === "cash" ? "success" : "primary", size: "small" }) }), _jsx(TableCell, { children: _jsx(Chip, { label: vente.statut, color: vente.statut === "payé" ? "success" : "default", size: "small" }) }), _jsx(TableCell, { children: new Date(vente.date_vente).toLocaleString() }), _jsx(TableCell, { children: _jsx(IconButton, { size: "small", onClick: () => {
                                                                const detailsElement = document.getElementById(`details-${vente.id}`);
                                                                if (detailsElement) {
                                                                    detailsElement.style.display = detailsElement.style.display === 'none' ? 'table-row' : 'none';
                                                                }
                                                            }, children: _jsx(ExpandMoreIcon, {}) }) })] }), _jsx(TableRow, { id: `details-${vente.id}`, style: { display: 'none' }, children: _jsx(TableCell, { colSpan: 9, children: _jsxs(Box, { sx: { p: 2, backgroundColor: '#f5f5f5' }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "D\u00E9tails de la vente" }), _jsxs(Grid, { container: true, spacing: 2, sx: { mb: 2 }, children: [_jsx(Grid, { sx: { width: { xs: '100%', sm: '50%' } }, children: _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Sexe:" }), " ", vente.sexe_acheteur || "N/A"] }) }), _jsx(Grid, { sx: { width: { xs: '100%', sm: '50%' } }, children: _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Adresse:" }), " ", vente.adresse_acheteur || "N/A"] }) })] }), vente.note && (_jsxs(Typography, { variant: "body2", color: "textSecondary", gutterBottom: true, children: [_jsx("strong", { children: "Note:" }), " ", vente.note] })), _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Produit" }), _jsx(TableCell, { children: "Quantit\u00E9" }), _jsx(TableCell, { children: "Prix unitaire" }), _jsx(TableCell, { children: "Montant" })] }) }), _jsx(TableBody, { children: vente.details_read.map((detail) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: detail.produit_nom }), _jsx(TableCell, { children: detail.quantite }), _jsxs(TableCell, { children: [detail.prix_unitaire, " $"] }), _jsxs(TableCell, { children: [detail.montant, " $"] })] }, detail.id))) })] })] }) }) })] }, vente.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 9, align: "center", children: "Aucune vente trouv\u00E9e" }) })) })] }) }), totalPages > 1 && (_jsx(Box, { sx: { display: "flex", justifyContent: "center", mt: 2 }, children: _jsx(Pagination, { count: totalPages, page: page, onChange: (_, value) => setPage(value), color: "primary" }) }))] })), _jsxs(Dialog, { open: openDialog, onClose: () => {
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
                }, fullWidth: true, maxWidth: "md", children: [_jsx(DialogTitle, { children: "Nouvelle vente" }), _jsxs(DialogContent, { children: [_jsx(Stepper, { activeStep: activeStep, sx: { mb: 3 }, children: steps.map((label) => (_jsx(Step, { children: _jsx(StepLabel, { children: label }) }, label))) }), activeStep === 0 && (_jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [_jsxs(Tabs, { value: userCreationTab, onChange: (_, newValue) => setUserCreationTab(newValue), children: [_jsx(Tab, { label: "Rechercher un utilisateur" }), _jsx(Tab, { label: "Cr\u00E9er un nouvel utilisateur" })] }), userCreationTab === 0 ? (_jsx(_Fragment, { children: _jsx(Autocomplete, { options: users, getOptionLabel: (u) => `${u.nom} - ${u.email || u.telephone}`, value: selectedUser, onChange: (_, v) => {
                                                setSelectedUser(v);
                                                if (v) {
                                                    setNomAcheteur(v.nom || "");
                                                    setTelAcheteur(v.telephone || "");
                                                    setSexeAcheteur(v.sexe || "");
                                                    setAdresseAcheteur(v.adresse || "");
                                                }
                                            }, onInputChange: (_, v) => setSearchUser(v), renderInput: (params) => (_jsx(TextField, { ...params, label: "Rechercher un utilisateur", helperText: "Tapez au moins 3 caract\u00E8res pour rechercher" })) }) })) : (_jsx(CreateUserForm, { onUserCreated: handleUserCreated, onCancel: () => setUserCreationTab(0) })), _jsx(TextField, { fullWidth: true, label: "Nom acheteur", value: nomAcheteur, onChange: (e) => setNomAcheteur(e.target.value), required: true }), _jsx(TextField, { fullWidth: true, label: "T\u00E9l\u00E9phone acheteur", value: telAcheteur, onChange: (e) => setTelAcheteur(e.target.value), required: true }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "Sexe" }), _jsxs(Select, { value: sexeAcheteur, label: "Sexe", onChange: (e) => setSexeAcheteur(e.target.value), children: [_jsx(MenuItem, { value: "M", children: "Masculin" }), _jsx(MenuItem, { value: "F", children: "F\u00E9minin" })] })] }), _jsx(TextField, { fullWidth: true, label: "Adresse acheteur", value: adresseAcheteur, onChange: (e) => setAdresseAcheteur(e.target.value), multiline: true, rows: 2 })] })), activeStep === 1 && (_jsxs(Box, { sx: {
                                    display: "flex",
                                    flexDirection: { xs: "column", md: "row" },
                                    gap: 2,
                                }, children: [_jsxs(Box, { sx: { flex: 1 }, children: [_jsx(Autocomplete, { options: compteurs, getOptionLabel: (p) => `${p.nom} (${p.code_serie})`, onChange: (_, v) => v && handleAddProduit({ ...v, prix: v.prix }, "compteur"), renderInput: (params) => (_jsx(TextField, { ...params, label: "Rechercher un compteur" })) }), _jsx(Autocomplete, { sx: { mt: 2 }, options: rfids, getOptionLabel: (r) => `${r.code_uid} (${r.telephone || "Anonyme"})`, onChange: (_, v) => v && handleAddProduit({ ...v, prix: v.prix }, "rfid"), renderInput: (params) => (_jsx(TextField, { ...params, label: "Rechercher une carte RFID" })) })] }), _jsx(Box, { sx: { flex: 1 }, children: _jsxs(Card, { sx: { p: 2 }, children: [_jsx(Typography, { variant: "h6", children: "Produits s\u00E9lectionn\u00E9s" }), selectedProduits.map((p, i) => (_jsxs(Box, { sx: {
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        p: 1,
                                                        mb: 0.5,
                                                        border: "1px solid #e0e0e0",
                                                        borderRadius: 1.5,
                                                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                                        backgroundColor: "#fafafa",
                                                    }, children: [_jsxs(Typography, { children: [p.nom || p.code_uid, " x ", p.quantite] }), _jsx(IconButton, { color: "error", onClick: () => handleRemoveProduit(i), children: _jsx(DeleteIcon, {}) })] }, i))), _jsxs(Typography, { sx: { mt: 2 }, children: ["Montant total: ", _jsxs("b", { children: [montantTotal, " $"] })] }), _jsx(TextField, { label: "Montant per\u00E7u", type: "number", fullWidth: true, sx: { mt: 2 }, value: montantPaye, onChange: (e) => {
                                                        const value = parseInt(e.target.value) || 0;
                                                        if (value >= 0) {
                                                            setMontantPaye(value);
                                                        }
                                                    }, error: montantPaye < 0, helperText: montantPaye < 0 ? "Le montant ne peut pas être négatif" : "", inputProps: { min: 0 } })] }) })] }))] }), _jsx(DialogActions, { children: saving ? (_jsx(CircularProgress, { size: 24, sx: { mr: 2 } })) : (_jsxs(_Fragment, { children: [_jsx(Button, { disabled: activeStep === 0, onClick: () => setActiveStep(activeStep - 1), children: "Retour" }), activeStep < steps.length - 1 ? (_jsx(Button, { variant: "contained", onClick: () => setActiveStep(activeStep + 1), disabled: !nomAcheteur || !telAcheteur, children: "Suivant" })) : (_jsx(Button, { variant: "contained", color: "success", onClick: handleSave, disabled: selectedProduits.length === 0 || montantPaye < 0, children: "Enregistrer" }))] })) })] })] }));
}
