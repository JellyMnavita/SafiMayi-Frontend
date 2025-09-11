import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Remplace ton code par celui-ci
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress, Pagination, IconButton, Menu, MenuList, MenuItem as MenuItemMui, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab } from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";
export function CompteurView() {
    const [allCompteurs, setAllCompteurs] = useState([]);
    const [compteurs, setCompteurs] = useState([]);
    const [loading, setLoading] = useState(true);
    // Mode création : single | manual | auto
    const [mode, setMode] = useState("single");
    // States pour chaque mode
    const [formData, setFormData] = useState({});
    const [bulkCompteurs, setBulkCompteurs] = useState([
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
    const [page, setPage] = useState(1);
    const [pageSize] = useState(5);
    // Filtres
    const [searchNom, setSearchNom] = useState("");
    const [searchCode, setSearchCode] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    // Menu actions
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedCompteur, setSelectedCompteur] = useState(null);
    // Dialog
    const [openDialog, setOpenDialog] = useState(false);
    const handleMenuOpen = (event, compteur) => {
        setAnchorEl(event.currentTarget);
        setSelectedCompteur(compteur);
    };
    const handleMenuClose = () => setAnchorEl(null);
    // Charger les compteurs
    const fetchCompteurs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`https://safimayi-backend.onrender.com/api/compteur/`, { headers: { Authorization: `Bearer ${token}` } });
            const data = response.data.results || response.data;
            setAllCompteurs(data);
            setCompteurs(data);
        }
        catch (error) {
            console.error("Erreur lors du chargement :", error);
        }
        finally {
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
            filtered = filtered.filter((c) => c.nom.toLowerCase().includes(searchNom.toLowerCase()));
        }
        if (searchCode) {
            filtered = filtered.filter((c) => c.code_serie.toLowerCase().includes(searchCode.toLowerCase()));
        }
        if (statusFilter) {
            filtered = filtered.filter((c) => String(c.actif) === statusFilter);
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
                await axios.put(`https://safimayi-backend.onrender.com/api/compteur/${formData.id}/`, formData, { headers: { Authorization: `Bearer ${token}` } });
            }
            else if (mode === "manual") {
                // Création multiple manuelle
                await axios.post(`https://safimayi-backend.onrender.com/api/compteur/`, bulkCompteurs, { headers: { Authorization: `Bearer ${token}` } });
            }
            else if (mode === "auto") {
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
                        nom: `Compteur-${i}`,
                        code_serie: i.toString(),
                        siteforage: null,
                        date_installation: null,
                        actif: false,
                    });
                }
                await axios.post(`https://safimayi-backend.onrender.com/api/compteur/`, generatedCompteurs, { headers: { Authorization: `Bearer ${token}` } });
            }
            else {
                // Création simple
                await axios.post(`https://safimayi-backend.onrender.com/api/compteur/`, formData, { headers: { Authorization: `Bearer ${token}` } });
            }
            fetchCompteurs();
            setOpenDialog(false);
            setFormData({});
            setBulkCompteurs([{ nom: "", code_serie: "", siteforage: 0, actif: true, date_installation: "" }]);
            setAutoForm({ nom: "", siteforage: 0, date_installation: "", code_start: "", code_end: "" });
            setMode("single");
        }
        catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
        }
    };
    // Toggle activation
    const handleToggleActivation = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`https://safimayi-backend.onrender.com/api/compteur/toggle-activation/${id}/`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchCompteurs();
        }
        catch (error) {
            console.error("Erreur lors du changement d'état :", error);
        }
    };
    return (_jsxs(DashboardContent, { children: [_jsxs(Box, { sx: { mb: 5, display: "flex", alignItems: "center" }, children: [_jsx(Typography, { variant: "h4", sx: { flexGrow: 1 }, children: "Compteurs" }), _jsx(Button, { variant: "contained", color: "inherit", startIcon: _jsx(Iconify, { icon: "mingcute:add-line" }), onClick: () => {
                            setFormData({});
                            setMode("single");
                            setOpenDialog(true);
                        }, children: "Ajouter un compteur" })] }), _jsx(Card, { sx: { p: 2, mb: 3 }, children: _jsxs(Box, { sx: { display: "flex", gap: 2, flexWrap: "wrap" }, children: [_jsx(TextField, { label: "Nom", value: searchNom, onChange: (e) => setSearchNom(e.target.value), size: "small" }), _jsx(TextField, { label: "Code s\u00E9rie", value: searchCode, onChange: (e) => setSearchCode(e.target.value), size: "small" }), _jsxs(Select, { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), displayEmpty: true, size: "small", children: [_jsx(MenuItem, { value: "", children: "Tous" }), _jsx(MenuItem, { value: "true", children: "Actifs" }), _jsx(MenuItem, { value: "false", children: "D\u00E9sactiv\u00E9s" })] }), _jsx(Button, { variant: "outlined", onClick: () => {
                                setSearchNom("");
                                setSearchCode("");
                                setStatusFilter("");
                            }, children: "R\u00E9initialiser" })] }) }), _jsx(Card, { children: _jsx("div", { className: "p-4 bg-white shadow-md rounded-md overflow-x-auto", children: loading ? (_jsx("div", { className: "flex justify-center items-center py-10", children: _jsx("p", { className: "text-gray-500", children: _jsx(CircularProgress, {}) }) })) : (_jsxs(_Fragment, { children: [_jsxs("table", { className: "w-full border-collapse min-w-[700px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100 text-left text-sm", children: [_jsx("th", { className: "p-2 border-b", children: "Nom" }), _jsx("th", { className: "p-2 border-b", children: "Code s\u00E9rie" }), _jsx("th", { className: "p-2 border-b", children: "Site forage" }), _jsx("th", { className: "p-2 border-b", children: "Date de Fabrication" }), _jsx("th", { className: "p-2 border-b", children: "Status" }), _jsx("th", { className: "p-2 border-b text-center", children: "Actions" })] }) }), _jsx("tbody", { children: paginatedData.length > 0 ? (paginatedData.map((compteur) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "p-2 border-b", children: compteur.nom }), _jsx("td", { className: "p-2 border-b", children: compteur.code_serie }), _jsxs("td", { className: "p-2 border-b", children: ["Site #", compteur.siteforage] }), _jsx("td", { className: "p-2 border-b", children: compteur.date_installation || "-" }), _jsx("td", { className: "p-2 border-b", children: compteur.actif ? (_jsx("span", { className: "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium", children: "Actif" })) : (_jsx("span", { className: "bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium", children: "D\u00E9sactiv\u00E9" })) }), _jsx("td", { className: "p-2 border-b text-center", children: _jsx(IconButton, { onClick: (e) => handleMenuOpen(e, compteur), children: _jsx(Iconify, { icon: "eva:more-vertical-fill" }) }) })] }, compteur.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center text-gray-500 py-6", children: "Aucun compteur trouv\u00E9" }) })) })] }), _jsxs(Box, { sx: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 2,
                                    flexWrap: "wrap",
                                    gap: 2,
                                }, children: [_jsx(Typography, { variant: "body2", children: `Affichage de ${paginatedData.length} sur ${compteurs.length} compteurs` }), _jsx(Pagination, { count: Math.ceil(compteurs.length / pageSize), page: page, onChange: (_, value) => setPage(value), color: "primary" })] })] })) }) }), _jsx(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, children: _jsxs(MenuList, { children: [_jsx(MenuItemMui, { onClick: () => {
                                setFormData(selectedCompteur || {});
                                setOpenDialog(true);
                                handleMenuClose();
                            }, children: "Modifier" }), _jsx(MenuItemMui, { onClick: () => {
                                if (selectedCompteur)
                                    handleToggleActivation(selectedCompteur.id);
                                handleMenuClose();
                            }, children: selectedCompteur?.actif ? "Désactiver" : "Activer" })] }) }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), fullWidth: true, maxWidth: "sm", children: [_jsx(DialogTitle, { children: formData.id ? "Modifier le compteur" : "Ajouter un compteur" }), _jsxs(DialogContent, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [_jsxs(Tabs, { value: mode, onChange: (e, v) => setMode(v), children: [_jsx(Tab, { label: "Un seul compteur", value: "single" }), !formData.id && _jsx(Tab, { label: "Plusieurs manuels", value: "manual" }), !formData.id && _jsx(Tab, { label: "Auto", value: "auto" })] }), mode === "single" && (_jsxs(_Fragment, { children: [_jsx(TextField, { label: "Nom", value: formData.nom || "", onChange: (e) => setFormData({ ...formData, nom: e.target.value }), fullWidth: true }), _jsx(TextField, { label: "Code s\u00E9rie", value: formData.code_serie || "", onChange: (e) => setFormData({ ...formData, code_serie: e.target.value }), fullWidth: true }), _jsx(TextField, { label: "Site forage", type: "number", value: formData.siteforage || "", onChange: (e) => setFormData({ ...formData, siteforage: Number(e.target.value) }), fullWidth: true }), _jsx(TextField, { label: "Date d'installation", type: "date", value: formData.date_installation || "", onChange: (e) => setFormData({ ...formData, date_installation: e.target.value }), fullWidth: true, InputLabelProps: { shrink: true } })] })), mode === "manual" && (_jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [(bulkCompteurs || []).map((c, index) => (_jsxs(Box, { sx: { display: "flex", gap: 2, alignItems: "center" }, children: [_jsx(TextField, { label: "Nom", value: c.nom || "", onChange: (e) => {
                                                    const list = [...bulkCompteurs];
                                                    list[index].nom = e.target.value;
                                                    setBulkCompteurs(list);
                                                }, fullWidth: true }), _jsx(TextField, { label: "Code s\u00E9rie", value: c.code_serie || "", onChange: (e) => {
                                                    const list = [...bulkCompteurs];
                                                    list[index].code_serie = e.target.value;
                                                    setBulkCompteurs(list);
                                                }, fullWidth: true }), _jsx(TextField, { label: "Site forage", type: "number", value: c.siteforage || "", onChange: (e) => {
                                                    const list = [...bulkCompteurs];
                                                    list[index].siteforage = Number(e.target.value);
                                                    setBulkCompteurs(list);
                                                }, fullWidth: true }), _jsx(IconButton, { color: "error", onClick: () => setBulkCompteurs(bulkCompteurs.filter((_, i) => i !== index)), children: _jsx(Iconify, { icon: "solar:trash-bin-trash-bold" }) })] }, index))), _jsx(Button, { variant: "outlined", size: "small", onClick: () => setBulkCompteurs([
                                            ...bulkCompteurs,
                                            { nom: "", code_serie: "", siteforage: 0, actif: true },
                                        ]), children: "+ Ajouter un compteur" })] })), mode === "auto" && (_jsxs(_Fragment, { children: [_jsx(TextField, { label: "Nom g\u00E9n\u00E9rique", value: autoForm.nom, onChange: (e) => setAutoForm({ ...autoForm, nom: e.target.value }), fullWidth: true }), _jsx(TextField, { label: "Date d'installation", type: "date", value: autoForm.date_installation, onChange: (e) => setAutoForm({ ...autoForm, date_installation: e.target.value }), fullWidth: true, InputLabelProps: { shrink: true } }), _jsx(TextField, { label: "Code s\u00E9rie d\u00E9but", type: "number", value: autoForm.code_start, onChange: (e) => setAutoForm({ ...autoForm, code_start: e.target.value }), fullWidth: true }), _jsx(TextField, { label: "Code s\u00E9rie fin", type: "number", value: autoForm.code_end, onChange: (e) => setAutoForm({ ...autoForm, code_end: e.target.value }), fullWidth: true })] }))] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpenDialog(false), children: "Annuler" }), _jsx(Button, { variant: "contained", onClick: handleSave, children: "Enregistrer" })] })] })] }));
}
