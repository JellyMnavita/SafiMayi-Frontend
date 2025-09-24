import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// Remplace ton code par celui-ci
import { useEffect, useState } from "react";
import apiClient from "../../../utils/api";
import { Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress, Pagination, IconButton, Menu, MenuList, MenuItem as MenuItemMui, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, FormControl, InputLabel } from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";
export function CompteurView() {
    const [allCompteurs, setAllCompteurs] = useState([]);
    const [compteurs, setCompteurs] = useState([]);
    const [sitesForage, setSitesForage] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSites, setLoadingSites] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    // Mode création : single | manual | auto
    const [mode, setMode] = useState("single");
    // States pour chaque mode
    const [formData, setFormData] = useState({});
    const [bulkCompteurs, setBulkCompteurs] = useState([
        { nom: "", code_serie: "", siteforage: null, actif: true, date_installation: "" }
    ]);
    const [autoForm, setAutoForm] = useState({
        nom: "",
        siteforage: null,
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
    const [dateFilter, setDateFilter] = useState("");
    const [siteFilter, setSiteFilter] = useState("");
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
            const response = await apiClient.get(`/api/compteur/`);
            const data = response.data.results || response.data;
            setAllCompteurs(data);
            setCompteurs(data);
        }
        catch (error) {
            console.error("Erreur lors du chargement des compteurs :", error);
        }
        finally {
            setLoading(false);
        }
    };
    // Charger les sites de forage
    const fetchSitesForage = async () => {
        try {
            setLoadingSites(true);
            const response = await apiClient.get(`/api/siteforage/siteforages/`);
            setSitesForage(response.data);
        }
        catch (error) {
            console.error("Erreur lors du chargement des sites de forage :", error);
        }
        finally {
            setLoadingSites(false);
        }
    };
    useEffect(() => {
        fetchCompteurs();
        fetchSitesForage();
    }, []);
    // Filtrage local
    useEffect(() => {
        let filtered = [...allCompteurs];
        if (searchNom) {
            filtered = filtered.filter((c) => c.nom.toLowerCase().includes(searchNom.toLowerCase()));
        }
        if (searchCode) {
            filtered = filtered.filter((c) => c.code_serie?.toLowerCase().includes(searchCode.toLowerCase()));
        }
        if (statusFilter) {
            filtered = filtered.filter((c) => String(c.actif) === statusFilter);
        }
        if (dateFilter) {
            filtered = filtered.filter((c) => c.date_installation && c.date_installation.includes(dateFilter));
        }
        if (siteFilter) {
            filtered = filtered.filter((c) => c.siteforage !== null && String(c.siteforage) === siteFilter);
        }
        setCompteurs(filtered);
        setPage(1);
    }, [searchNom, searchCode, statusFilter, dateFilter, siteFilter, allCompteurs]);
    // Pagination locale
    const paginatedData = compteurs.slice((page - 1) * pageSize, page * pageSize);
    // Sauvegarde (création / update)
    const handleSave = async () => {
        try {
            setSubmitting(true);
            if (formData.id) {
                // Update
                await apiClient.put(`/api/compteur/${formData.id}/`, formData);
            }
            else if (mode === "manual") {
                // Création multiple manuelle
                await apiClient.post(`/api/compteur/`, bulkCompteurs);
            }
            else if (mode === "auto") {
                // Création automatique côté frontend
                const { nom, siteforage, date_installation, code_start, code_end } = autoForm;
                const start = parseInt(code_start, 10);
                const end = parseInt(code_end, 10);
                if (isNaN(start) || isNaN(end) || end < start) {
                    alert("Veuillez entrer un intervalle valide de codes.");
                    setSubmitting(false);
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
                await apiClient.post(`/api/compteur/`, generatedCompteurs);
            }
            else {
                // Création simple
                await apiClient.post(`/api/compteur/`, formData);
            }
            fetchCompteurs();
            setOpenDialog(false);
            setFormData({});
            setBulkCompteurs([{ nom: "", code_serie: "", siteforage: null, actif: true, date_installation: "" }]);
            setAutoForm({ nom: "", siteforage: null, date_installation: "", code_start: "", code_end: "" });
            setMode("single");
        }
        catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
        }
        finally {
            setSubmitting(false);
        }
    };
    // Toggle activation
    const handleToggleActivation = async (id) => {
        try {
            await apiClient.post(`/api/compteur/toggle-activation/${id}/`, {});
            fetchCompteurs();
        }
        catch (error) {
            console.error("Erreur lors du changement d'état :", error);
        }
    };
    // Récupérer les sites uniques pour le filtre (en excluant les valeurs null)
    const uniqueSites = Array.from(new Set(allCompteurs
        .filter(c => c.siteforage !== null)
        .map(c => c.siteforage))).sort((a, b) => a - b);
    return (_jsxs(DashboardContent, { children: [_jsxs(Box, { sx: { mb: 5, display: "flex", alignItems: "center" }, children: [_jsx(Typography, { variant: "h4", sx: { flexGrow: 1 }, children: "Compteurs" }), _jsx(Button, { variant: "contained", color: "inherit", startIcon: _jsx(Iconify, { icon: "mingcute:add-line" }), onClick: () => {
                            setFormData({});
                            setMode("single");
                            setOpenDialog(true);
                        }, disabled: submitting, children: "Ajouter un compteur" })] }), _jsx(Card, { sx: { p: 2, mb: 3 }, children: _jsxs(Box, { sx: { display: "flex", gap: 2, flexWrap: "wrap" }, children: [_jsx(TextField, { label: "Nom", value: searchNom, onChange: (e) => setSearchNom(e.target.value), size: "small", disabled: submitting }), _jsx(TextField, { label: "Code s\u00E9rie", value: searchCode, onChange: (e) => setSearchCode(e.target.value), size: "small", disabled: submitting }), _jsxs(Select, { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), displayEmpty: true, size: "small", disabled: submitting, children: [_jsx(MenuItem, { value: "", children: "Tous" }), _jsx(MenuItem, { value: "true", children: "Actifs" }), _jsx(MenuItem, { value: "false", children: "D\u00E9sactiv\u00E9s" })] }), _jsx(TextField, { label: "Date de fabrication", type: "date", value: dateFilter, onChange: (e) => setDateFilter(e.target.value), size: "small", InputLabelProps: { shrink: true }, disabled: submitting }), _jsxs(Select, { value: siteFilter, onChange: (e) => setSiteFilter(e.target.value), displayEmpty: true, size: "small", disabled: submitting, children: [_jsx(MenuItem, { value: "", children: "Tous les sites" }), uniqueSites.map(site => (_jsxs(MenuItem, { value: site.toString(), children: ["Site #", site] }, site)))] }), _jsx(Button, { variant: "outlined", onClick: () => {
                                setSearchNom("");
                                setSearchCode("");
                                setStatusFilter("");
                                setDateFilter("");
                                setSiteFilter("");
                            }, disabled: submitting, children: "R\u00E9initialiser" })] }) }), _jsx(Card, { children: _jsx("div", { className: "p-4 bg-white shadow-md rounded-md overflow-x-auto", children: loading ? (_jsx("div", { className: "flex justify-center items-center py-10", children: _jsx(CircularProgress, {}) })) : (_jsxs(_Fragment, { children: [_jsxs("table", { className: "w-full border-collapse min-w-[700px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100 text-left text-sm", children: [_jsx("th", { className: "p-2 border-b", children: "Nom" }), _jsx("th", { className: "p-2 border-b", children: "Code s\u00E9rie" }), _jsx("th", { className: "p-2 border-b", children: "Site forage" }), _jsx("th", { className: "p-2 border-b", children: "Date de Fabrication" }), _jsx("th", { className: "p-2 border-b", children: "Status" }), _jsx("th", { className: "p-2 border-b text-center", children: "Actions" })] }) }), _jsx("tbody", { children: paginatedData.length > 0 ? (paginatedData.map((compteur) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "p-2 border-b", children: compteur.nom }), _jsx("td", { className: "p-2 border-b", children: compteur.code_serie }), _jsx("td", { className: "p-2 border-b", children: compteur.siteforage !== null ?
                                                        `${sitesForage.find(s => s.id === compteur.siteforage)?.nom || 'Inconnu'}`
                                                        : "-" }), _jsx("td", { className: "p-2 border-b", children: compteur.date_installation || "-" }), _jsx("td", { className: "p-2 border-b", children: compteur.actif ? (_jsx("span", { className: "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium", children: "Actif" })) : (_jsx("span", { className: "bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium", children: "D\u00E9sactiv\u00E9" })) }), _jsx("td", { className: "p-2 border-b text-center", children: _jsx(IconButton, { onClick: (e) => handleMenuOpen(e, compteur), disabled: submitting, size: "small", children: _jsx(Iconify, { icon: "eva:more-vertical-fill" }) }) })] }, compteur.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center text-gray-500 py-6", children: "Aucun compteur trouv\u00E9" }) })) })] }), _jsxs(Box, { sx: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 2,
                                    flexWrap: "wrap",
                                    gap: 2,
                                }, children: [_jsx(Typography, { variant: "body2", children: `Affichage de ${paginatedData.length} sur ${compteurs.length} compteurs` }), _jsx(Pagination, { count: Math.ceil(compteurs.length / pageSize), page: page, onChange: (_, value) => setPage(value), color: "primary", disabled: submitting })] })] })) }) }), _jsx(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, children: _jsxs(MenuList, { children: [_jsx(MenuItemMui, { onClick: () => {
                                setFormData(selectedCompteur || {});
                                setOpenDialog(true);
                                handleMenuClose();
                            }, disabled: submitting, children: "Modifier" }), _jsx(MenuItemMui, { onClick: () => {
                                if (selectedCompteur)
                                    handleToggleActivation(selectedCompteur.id);
                                handleMenuClose();
                            }, disabled: submitting, children: selectedCompteur?.actif ? "Désactiver" : "Activer" })] }) }), _jsxs(Dialog, { open: openDialog, onClose: () => !submitting && setOpenDialog(false), fullWidth: true, maxWidth: "sm", children: [_jsx(DialogTitle, { children: formData.id ? "Modifier le compteur" : "Ajouter un compteur" }), _jsxs(DialogContent, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [_jsxs(Tabs, { value: mode, onChange: (e, v) => !submitting && setMode(v), children: [_jsx(Tab, { label: "Un seul compteur", value: "single", disabled: submitting }), !formData.id && _jsx(Tab, { label: "Plusieurs manuels", value: "manual", disabled: submitting }), !formData.id && _jsx(Tab, { label: "Auto", value: "auto", disabled: submitting })] }), mode === "single" && (_jsxs(_Fragment, { children: [_jsx(TextField, { label: "Nom", value: formData.nom || "", onChange: (e) => setFormData({ ...formData, nom: e.target.value }), fullWidth: true, disabled: submitting }), _jsx(TextField, { label: "Code s\u00E9rie", value: formData.code_serie || "", onChange: (e) => setFormData({ ...formData, code_serie: e.target.value }), fullWidth: true, disabled: submitting }), loadingSites ? (_jsx(CircularProgress, { size: 24 })) : (_jsxs(FormControl, { sx: { minWidth: 200 }, size: "small", children: [_jsx(InputLabel, { id: `site-forage-label`, shrink: true, children: "Site forage" }), _jsxs(Select, { labelId: `site-forage-label`, label: "Site forage", value: formData.siteforage === null ? "" : String(formData.siteforage), onChange: (e) => setFormData({
                                                    ...formData,
                                                    siteforage: e.target.value === "" ? null : Number(e.target.value)
                                                }), fullWidth: true, displayEmpty: true, disabled: submitting, children: [_jsx(MenuItem, { value: "", children: "Aucun site" }), sitesForage.map((site) => (_jsxs(MenuItem, { value: String(site.id), children: [site.nom, " - ", site.localisation] }, site.id)))] })] })), _jsx(TextField, { label: "Date d'installation", type: "date", value: formData.date_installation || "", onChange: (e) => setFormData({ ...formData, date_installation: e.target.value }), fullWidth: true, InputLabelProps: { shrink: true }, disabled: submitting })] })), mode === "manual" && (_jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [(bulkCompteurs || []).map((c, index) => (_jsxs(Box, { sx: { display: "flex", gap: 2, alignItems: "center", flexWrap: 'wrap' }, children: [_jsx(TextField, { label: "Nom", value: c.nom || "", onChange: (e) => {
                                                    const list = [...bulkCompteurs];
                                                    list[index].nom = e.target.value;
                                                    setBulkCompteurs(list);
                                                }, sx: { minWidth: 120 }, disabled: submitting, size: "small" }), _jsx(TextField, { label: "Code s\u00E9rie", value: c.code_serie || "", onChange: (e) => {
                                                    const list = [...bulkCompteurs];
                                                    list[index].code_serie = e.target.value;
                                                    setBulkCompteurs(list);
                                                }, sx: { minWidth: 120 }, disabled: submitting, size: "small" }), loadingSites ? (_jsx(CircularProgress, { size: 24 })) : (_jsxs(FormControl, { sx: { minWidth: 200 }, size: "small", children: [_jsx(InputLabel, { id: `site-forage-manuel-label`, shrink: true, children: "Site forage" }), _jsxs(Select, { labelId: `site-forage-manuel-label`, label: "Site forage", value: c.siteforage === null ? "" : String(c.siteforage), onChange: (e) => {
                                                            const list = [...bulkCompteurs];
                                                            list[index].siteforage = e.target.value === "" ? null : Number(e.target.value);
                                                            setBulkCompteurs(list);
                                                        }, sx: { minWidth: 200 }, displayEmpty: true, disabled: submitting, size: "small", children: [_jsx(MenuItem, { value: "", children: "Aucun site" }), sitesForage.map((site) => (_jsx(MenuItem, { value: site.id, children: site.nom }, site.id)))] })] })), _jsx(IconButton, { color: "error", onClick: () => setBulkCompteurs(bulkCompteurs.filter((_, i) => i !== index)), disabled: submitting, size: "small", children: _jsx(Iconify, { icon: "solar:trash-bin-trash-bold" }) })] }, index))), _jsx(Button, { variant: "outlined", size: "small", onClick: () => setBulkCompteurs([
                                            ...bulkCompteurs,
                                            { nom: "", code_serie: "", siteforage: null, actif: true },
                                        ]), disabled: submitting, children: "+ Ajouter un compteur" })] })), mode === "auto" && (_jsxs(_Fragment, { children: [_jsx(TextField, { label: "Nom g\u00E9n\u00E9rique", value: autoForm.nom, onChange: (e) => setAutoForm({ ...autoForm, nom: e.target.value }), fullWidth: true, disabled: submitting }), loadingSites ? (_jsx(CircularProgress, { size: 24 })) : (_jsxs(FormControl, { sx: { minWidth: 200 }, size: "small", children: [_jsx(InputLabel, { id: `site-forage-auto-label`, shrink: true, children: "Site forage" }), _jsxs(Select, { labelId: `site-forage-auto-label`, label: "Site forage", value: autoForm.siteforage === null ? "" : String(autoForm.siteforage), onChange: (e) => setAutoForm({
                                                    ...autoForm,
                                                    siteforage: e.target.value === "" ? null : Number(e.target.value)
                                                }), fullWidth: true, displayEmpty: true, disabled: submitting, children: [_jsx(MenuItem, { value: "", children: "Aucun site" }), sitesForage.map((site) => (_jsxs(MenuItem, { value: site.id, children: [site.nom, " - ", site.localisation] }, site.id)))] })] })), _jsx(TextField, { label: "Date d'installation", type: "date", value: autoForm.date_installation, onChange: (e) => setAutoForm({ ...autoForm, date_installation: e.target.value }), fullWidth: true, InputLabelProps: { shrink: true }, disabled: submitting }), _jsx(TextField, { label: "Code s\u00E9rie d\u00E9but", type: "number", value: autoForm.code_start, onChange: (e) => setAutoForm({ ...autoForm, code_start: e.target.value }), fullWidth: true, disabled: submitting }), _jsx(TextField, { label: "Code s\u00E9rie fin", type: "number", value: autoForm.code_end, onChange: (e) => setAutoForm({ ...autoForm, code_end: e.target.value }), fullWidth: true, disabled: submitting })] }))] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpenDialog(false), disabled: submitting, children: "Annuler" }), _jsx(Button, { variant: "contained", onClick: handleSave, disabled: submitting, startIcon: submitting ? _jsx(CircularProgress, { size: 16, sx: { color: 'white' } }) : undefined, children: submitting ? "Enregistrement..." : "Enregistrer" })] })] })] }));
}
