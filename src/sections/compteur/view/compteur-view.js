import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from "react";
import apiClient from "../../../utils/api";
import { Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress, Pagination, IconButton, Menu, MenuList, MenuItem as MenuItemMui, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, FormControl, InputLabel, Chip, Autocomplete } from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";
export function CompteurView() {
    const [compteurs, setCompteurs] = useState([]);
    const [sitesForage, setSitesForage] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSites, setLoadingSites] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toggling, setToggling] = useState(null);
    // Pagination
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        page_size: 8,
        current_page: 1,
        total_pages: 1
    });
    // Filtres
    const [searchNom, setSearchNom] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [statutFilter, setStatutFilter] = useState("");
    const [selectedSiteForageFilter, setSelectedSiteForageFilter] = useState(null);
    const [selectedUserFilter, setSelectedUserFilter] = useState(null);
    const [pageSize, setPageSize] = useState(8);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    // Recherche pour les filtres
    const [searchSiteForageFilter, setSearchSiteForageFilter] = useState("");
    const [searchUserFilter, setSearchUserFilter] = useState("");
    // Mode création : single | manual | auto
    const [mode, setMode] = useState("single");
    // States pour chaque mode
    const [formData, setFormData] = useState({});
    const [bulkCompteurs, setBulkCompteurs] = useState([
        { siteforage: null, actif: true, date_installation: "" }
    ]);
    const [autoForm, setAutoForm] = useState({
        siteforage: null,
        date_installation: "",
        code_start: "",
        code_end: ""
    });
    // Recherche utilisateur
    const [searchUser, setSearchUser] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    // Recherche site forage
    const [searchSiteForage, setSearchSiteForage] = useState("");
    const [selectedSiteForage, setSelectedSiteForage] = useState(null);
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
    // Charger les compteurs avec pagination et filtres
    const fetchCompteurs = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                page_size: pageSize.toString(),
            });
            // Ajouter les filtres seulement s'ils sont définis
            if (searchNom)
                params.append('search', searchNom);
            if (statusFilter)
                params.append('actif', statusFilter);
            if (statutFilter)
                params.append('statut', statutFilter);
            if (selectedSiteForageFilter)
                params.append('siteforage', selectedSiteForageFilter.id.toString());
            if (selectedUserFilter)
                params.append('user_id', selectedUserFilter.id.toString());
            const response = await apiClient.get(`/api/compteur/list-compteur-pagination?${params}`);
            const data = response.data;
            setCompteurs(data.results || []);
            setPagination({
                count: data.count || 0,
                next: data.next || null,
                previous: data.previous || null,
                page_size: data.page_size || pageSize,
                current_page: page,
                total_pages: Math.ceil((data.count || 0) / pageSize)
            });
        }
        catch (error) {
            console.error("Erreur lors du chargement :", error);
        }
        finally {
            setLoading(false);
        }
    }, [searchNom, statusFilter, statutFilter, selectedSiteForageFilter, selectedUserFilter, pageSize]);
    // Charger les sites de forage par défaut
    const fetchDefaultSitesForage = async () => {
        try {
            setLoadingSites(true);
            const response = await apiClient.get(`/api/siteforage/search-pagination/?page_size=10`);
            setSitesForage(response.data.results || []);
        }
        catch (error) {
            console.error("Erreur lors du chargement des sites de forage :", error);
            setSitesForage([]);
        }
        finally {
            setLoadingSites(false);
        }
    };
    // Recherche de sites de forage avec debounce
    const searchSitesForage = useCallback(async (searchTerm) => {
        if (searchTerm.length < 2) {
            fetchDefaultSitesForage();
            return;
        }
        try {
            setLoadingSites(true);
            const response = await apiClient.get(`/api/siteforage/search-pagination/?search=${encodeURIComponent(searchTerm)}&page_size=10`);
            setSitesForage(response.data.results || []);
        }
        catch (error) {
            console.error("Erreur lors de la recherche des sites de forage :", error);
            setSitesForage([]);
        }
        finally {
            setLoadingSites(false);
        }
    }, []);
    // Charger les utilisateurs "owner" par défaut
    const fetchDefaultUsers = async () => {
        try {
            setLoadingUsers(true);
            const response = await apiClient.get(`/api/users/search/?role=owner&page_size=10`);
            setUsers(response.data.results || []);
        }
        catch (error) {
            console.error("Erreur lors du chargement des utilisateurs :", error);
            setUsers([]);
        }
        finally {
            setLoadingUsers(false);
        }
    };
    // Recherche d'utilisateurs "owner" avec debounce
    const searchUsers = useCallback(async (searchTerm) => {
        if (searchTerm.length < 2) {
            fetchDefaultUsers();
            return;
        }
        try {
            setLoadingUsers(true);
            const response = await apiClient.get(`/api/users/search/?search=${encodeURIComponent(searchTerm)}&role=owner&page_size=10`);
            setUsers(response.data.results || []);
        }
        catch (err) {
            console.error("Erreur lors de la recherche d'utilisateurs:", err);
            setUsers([]);
        }
        finally {
            setLoadingUsers(false);
        }
    }, []);
    // Chargement initial
    useEffect(() => {
        fetchCompteurs(1);
        fetchDefaultSitesForage();
        fetchDefaultUsers();
    }, [fetchCompteurs]);
    // Recherche avec debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCompteurs(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchNom, statusFilter, statutFilter, selectedSiteForageFilter, selectedUserFilter, pageSize, fetchCompteurs]);
    // Recherche utilisateur avec debounce (pour le formulaire)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchUser.trim() === "") {
                fetchDefaultUsers();
            }
            else {
                searchUsers(searchUser);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchUser, searchUsers]);
    // Recherche site forage avec debounce (pour le formulaire)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchSiteForage.trim() === "") {
                fetchDefaultSitesForage();
            }
            else {
                searchSitesForage(searchSiteForage);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchSiteForage, searchSitesForage]);
    // Recherche site forage avec debounce (pour les filtres)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchSiteForageFilter.trim() === "") {
                fetchDefaultSitesForage();
            }
            else {
                searchSitesForage(searchSiteForageFilter);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchSiteForageFilter, searchSitesForage]);
    // Recherche utilisateur avec debounce (pour les filtres)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchUserFilter.trim() === "") {
                fetchDefaultUsers();
            }
            else {
                searchUsers(searchUserFilter);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchUserFilter, searchUsers]);
    // Lors de l'ouverture du dialog, charger le site forage sélectionné si en mode édition
    useEffect(() => {
        if (openDialog && formData.id && formData.siteforage) {
            const site = sitesForage.find(s => s.id === formData.siteforage);
            if (site) {
                setSelectedSiteForage(site);
            }
        }
    }, [openDialog, formData.id, formData.siteforage, sitesForage]);
    // Lors de l'ouverture du dialog, charger l'utilisateur sélectionné si en mode édition
    useEffect(() => {
        if (openDialog && formData.id && formData.user) {
            const user = users.find(u => u.id === formData.user);
            if (user) {
                setSelectedUser(user);
            }
        }
    }, [openDialog, formData.id, formData.user, users]);
    // Changement de page
    const handlePageChange = (event, value) => {
        fetchCompteurs(value);
    };
    // Changement de la taille de page
    const handlePageSizeChange = (event) => {
        const newSize = typeof event.target.value === 'string' ? parseInt(event.target.value) : event.target.value;
        setPageSize(newSize);
    };
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
                const { siteforage, date_installation, code_start, code_end } = autoForm;
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
                        siteforage: siteforage,
                        date_installation: date_installation || null,
                        actif: false,
                    });
                }
                await apiClient.post(`/api/compteur/`, generatedCompteurs);
            }
            else {
                // Création simple
                await apiClient.post(`/api/compteur/`, formData);
            }
            fetchCompteurs(pagination.current_page);
            setOpenDialog(false);
            setFormData({});
            setSelectedUser(null);
            setSelectedSiteForage(null);
            setBulkCompteurs([{ siteforage: null, actif: true, date_installation: "" }]);
            setAutoForm({ siteforage: null, date_installation: "", code_start: "", code_end: "" });
            setMode("single");
        }
        catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
            alert("Erreur lors de la sauvegarde du compteur");
        }
        finally {
            setSubmitting(false);
        }
    };
    // Toggle activation
    const handleToggleActivation = async (id) => {
        try {
            setToggling(id);
            await apiClient.post(`/api/compteur/toggle-activation/${id}/`, {});
            fetchCompteurs(pagination.current_page);
        }
        catch (error) {
            console.error("Erreur lors du changement d'état :", error);
            alert("Erreur lors de la modification du statut du compteur");
        }
        finally {
            setToggling(null);
        }
    };
    // Réinitialiser les filtres
    const handleResetFilters = () => {
        setSearchNom("");
        setStatusFilter("");
        setStatutFilter("");
        setSelectedSiteForageFilter(null);
        setSelectedUserFilter(null);
        setSearchSiteForageFilter("");
        setSearchUserFilter("");
        setPageSize(8);
    };
    return (_jsxs(DashboardContent, { children: [_jsxs(Box, { sx: { mb: 5, display: "flex", alignItems: "center" }, children: [_jsxs(Typography, { variant: "h4", sx: { flexGrow: 1 }, children: ["Compteurs (", pagination.count, ")"] }), _jsx(Button, { variant: "contained", color: "inherit", startIcon: _jsx(Iconify, { icon: "mingcute:add-line" }), onClick: () => {
                            setFormData({});
                            setSelectedUser(null);
                            setSelectedSiteForage(null);
                            setMode("single");
                            setOpenDialog(true);
                        }, children: "Ajouter un compteur" })] }), _jsx(Card, { sx: { p: 2, mb: 3 }, children: _jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [_jsxs(Box, { sx: {
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }, children: [_jsx(TextField, { label: "Rechercher un compteur", value: searchNom, onChange: (e) => setSearchNom(e.target.value), size: "small", placeholder: "Code s\u00E9rie, site, propri\u00E9taire...", sx: { minWidth: 250, flexGrow: 1 } }), _jsxs(Box, { sx: { display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }, children: [_jsxs(FormControl, { size: "small", sx: { minWidth: 120 }, children: [_jsx(InputLabel, { children: "Statut" }), _jsxs(Select, { value: statutFilter, label: "Statut", onChange: (e) => setStatutFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "Tous" }), _jsx(MenuItem, { value: "stock", children: "En stock" }), _jsx(MenuItem, { value: "installe", children: "Install\u00E9" }), _jsx(MenuItem, { value: "en panne", children: "En panne" })] })] }), _jsxs(FormControl, { size: "small", sx: { minWidth: 100 }, children: [_jsx(InputLabel, { children: "Actif" }), _jsxs(Select, { value: statusFilter, label: "Actif", onChange: (e) => setStatusFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "Tous" }), _jsx(MenuItem, { value: "true", children: "Oui" }), _jsx(MenuItem, { value: "false", children: "Non" })] })] }), _jsx(Button, { variant: "outlined", size: "small", startIcon: _jsx(Iconify, { icon: showAdvancedFilters ? "mingcute:close-line" : "ic:round-filter-list" }), onClick: () => setShowAdvancedFilters(!showAdvancedFilters), sx: { whiteSpace: 'nowrap' }, children: showAdvancedFilters ? "Masquer" : "Plus de filtres" }), _jsx(Button, { variant: "outlined", size: "small", onClick: handleResetFilters, startIcon: _jsx(Iconify, { icon: "solar:restart-bold" }), children: "R\u00E9initialiser" })] })] }), showAdvancedFilters && (_jsxs(Box, { sx: {
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                                alignItems: "center",
                                pt: 2,
                                borderTop: 1,
                                borderColor: 'divider'
                            }, children: [_jsx(Autocomplete, { size: "small", options: sitesForage, getOptionLabel: (site) => `${site.nom}`, value: selectedSiteForageFilter, onChange: (_, newValue) => {
                                        setSelectedSiteForageFilter(newValue);
                                    }, onInputChange: (_, newInputValue) => {
                                        setSearchSiteForageFilter(newInputValue);
                                    }, renderInput: (params) => (_jsx(TextField, { ...params, label: "Site forage", placeholder: "Rechercher un site...", sx: { minWidth: 180 } })), loading: loadingSites }), _jsx(Autocomplete, { size: "small", options: users, getOptionLabel: (user) => `${user.nom}`, value: selectedUserFilter, onChange: (_, newValue) => {
                                        setSelectedUserFilter(newValue);
                                    }, onInputChange: (_, newInputValue) => {
                                        setSearchUserFilter(newInputValue);
                                    }, renderInput: (params) => (_jsx(TextField, { ...params, label: "Propri\u00E9taire", placeholder: "Rechercher...", sx: { minWidth: 180 } })), loading: loadingUsers }), _jsxs(FormControl, { size: "small", sx: { minWidth: 100 }, children: [_jsx(InputLabel, { children: "Par page" }), _jsxs(Select, { value: pageSize, label: "Par page", onChange: handlePageSizeChange, children: [_jsx(MenuItem, { value: 8, children: "8" }), _jsx(MenuItem, { value: 20, children: "20" }), _jsx(MenuItem, { value: 50, children: "50" })] })] })] })), (selectedSiteForageFilter || selectedUserFilter || statutFilter || statusFilter) && (_jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Filtres actifs:" }), selectedSiteForageFilter && (_jsx(Chip, { size: "small", label: `Site: ${selectedSiteForageFilter.nom}`, onDelete: () => setSelectedSiteForageFilter(null) })), selectedUserFilter && (_jsx(Chip, { size: "small", label: `Propriétaire: ${selectedUserFilter.nom}`, onDelete: () => setSelectedUserFilter(null) })), statutFilter && (_jsx(Chip, { size: "small", label: `Statut: ${statutFilter}`, onDelete: () => setStatutFilter("") })), statusFilter && (_jsx(Chip, { size: "small", label: `Actif: ${statusFilter === "true" ? "Oui" : "Non"}`, onDelete: () => setStatusFilter("") }))] }))] }) }), pagination.total_pages > 1 && (_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Page ", pagination.current_page, " sur ", pagination.total_pages, "(", pagination.count, " compteurs au total)"] }), _jsx(Pagination, { count: pagination.total_pages, page: pagination.current_page, onChange: handlePageChange, color: "primary" })] })), _jsx(Card, { children: _jsx(Box, { sx: { width: '100%', overflow: 'hidden' }, children: loading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }, children: _jsx(CircularProgress, {}) })) : (_jsxs(_Fragment, { children: [_jsx(Box, { sx: { overflowX: 'auto', width: '100%' }, children: _jsxs(Box, { sx: { minWidth: 800 }, children: [" ", _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { style: { backgroundColor: '#f8f9fa', textAlign: 'left' }, children: [_jsx("th", { style: { padding: '12px', borderBottom: '1px solid #e0e0e0', fontWeight: 600 }, children: "Code s\u00E9rie" }), _jsx("th", { style: { padding: '12px', borderBottom: '1px solid #e0e0e0', fontWeight: 600 }, children: "Site forage" }), _jsx("th", { style: { padding: '12px', borderBottom: '1px solid #e0e0e0', fontWeight: 600 }, children: "Propri\u00E9taire" }), _jsx("th", { style: { padding: '12px', borderBottom: '1px solid #e0e0e0', fontWeight: 600 }, children: "Statut" }), _jsx("th", { style: { padding: '12px', borderBottom: '1px solid #e0e0e0', fontWeight: 600 }, children: "Date installation" }), _jsx("th", { style: { padding: '12px', borderBottom: '1px solid #e0e0e0', fontWeight: 600 }, children: "Actif" }), _jsx("th", { style: { padding: '12px', borderBottom: '1px solid #e0e0e0', fontWeight: 600, textAlign: 'center' }, children: "Actions" })] }) }), _jsx("tbody", { children: compteurs.length > 0 ? (compteurs.map((compteur) => (_jsxs("tr", { className: "table-row", style: { cursor: 'pointer' }, onClick: () => {
                                                            setFormData(compteur);
                                                            setOpenDialog(true);
                                                            setMode("single");
                                                        }, children: [_jsx("td", { style: { padding: '12px', borderBottom: '1px solid #e0e0e0' }, children: _jsx(Box, { sx: {
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: 1,
                                                                        px: 1.5,
                                                                        py: 0.5,
                                                                        borderRadius: 1,
                                                                        bgcolor: '#0486d9',
                                                                        color: 'white'
                                                                    }, children: _jsx(Typography, { variant: "body2", fontWeight: "bold", children: compteur.code_serie || "N/A" }) }) }), _jsx("td", { style: { padding: '12px', borderBottom: '1px solid #e0e0e0' }, children: compteur.siteforage_nom ? (_jsx(Chip, { label: compteur.siteforage_nom, size: "small", variant: "outlined", color: "primary" })) : (_jsx(Typography, { variant: "body2", color: "text.secondary", children: "-" })) }), _jsx("td", { style: { padding: '12px', borderBottom: '1px solid #e0e0e0' }, children: compteur.user_nom ? (_jsx(Chip, { label: compteur.user_nom, size: "small", variant: "outlined", color: "secondary" })) : (_jsx(Typography, { variant: "body2", color: "text.secondary", children: "-" })) }), _jsx("td", { style: { padding: '12px', borderBottom: '1px solid #e0e0e0' }, children: _jsx(Chip, { label: compteur.statut || 'Non défini', size: "small", color: compteur.statut === 'installe' ? 'success' :
                                                                        compteur.statut === 'en panne' ? 'error' : 'default', variant: "filled" }) }), _jsx("td", { style: { padding: '12px', borderBottom: '1px solid #e0e0e0' }, children: _jsx(Typography, { variant: "body2", children: compteur.date_installation ?
                                                                        new Date(compteur.date_installation).toLocaleDateString() :
                                                                        "Non installé" }) }), _jsx("td", { style: { padding: '12px', borderBottom: '1px solid #e0e0e0' }, children: compteur.actif ? (_jsx(Box, { sx: {
                                                                        display: 'inline-block',
                                                                        bgcolor: 'success.light',
                                                                        color: 'success.dark',
                                                                        px: 1.5,
                                                                        py: 0.5,
                                                                        borderRadius: '12px',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 'medium'
                                                                    }, children: "Actif" })) : (_jsx(Box, { sx: {
                                                                        display: 'inline-block',
                                                                        bgcolor: 'error.light',
                                                                        color: 'error.dark',
                                                                        px: 1.5,
                                                                        py: 0.5,
                                                                        borderRadius: '12px',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 'medium'
                                                                    }, children: "D\u00E9sactiv\u00E9" })) }), _jsx("td", { style: { padding: '12px', borderBottom: '1px solid #e0e0e0', textAlign: 'center' }, children: _jsx(IconButton, { onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        handleMenuOpen(e, compteur);
                                                                    }, size: "small", disabled: toggling === compteur.id, children: toggling === compteur.id ? (_jsx(CircularProgress, { size: 20 })) : (_jsx(Iconify, { icon: "eva:more-vertical-fill" })) }) })] }, compteur.id)))) : (_jsx("tr", { children: _jsxs("td", { colSpan: 7, style: { textAlign: 'center', color: '#6b7280', padding: '24px' }, children: [_jsx(Typography, { variant: "h6", color: "text.secondary", children: "Aucun compteur trouv\u00E9" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: "Essayez de modifier vos crit\u00E8res de recherche" })] }) })) })] })] }) }), _jsxs(Box, { sx: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    p: 2,
                                    flexWrap: "wrap",
                                    gap: 2,
                                    borderTop: '1px solid',
                                    borderColor: 'divider'
                                }, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: `Affichage de ${compteurs.length} sur ${pagination.count} compteurs` }), _jsx(Pagination, { count: pagination.total_pages, page: pagination.current_page, onChange: handlePageChange, color: "primary" })] })] })) }) }), _jsx(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, children: _jsxs(MenuList, { children: [_jsx(MenuItemMui, { onClick: () => {
                                setFormData(selectedCompteur || {});
                                setOpenDialog(true);
                                handleMenuClose();
                                setMode("single");
                            }, children: "Configurer" }), _jsx(MenuItemMui, { onClick: () => {
                                if (selectedCompteur)
                                    handleToggleActivation(selectedCompteur.id);
                                handleMenuClose();
                            }, disabled: toggling === selectedCompteur?.id, children: toggling === selectedCompteur?.id ? (_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(CircularProgress, { size: 16 }), _jsx("span", { children: "Chargement..." })] })) : (selectedCompteur?.actif ? "Désactiver" : "Activer") })] }) }), _jsxs(Dialog, { open: openDialog, onClose: () => {
                    if (!submitting) {
                        setOpenDialog(false);
                        setFormData({});
                        setSelectedUser(null);
                        setSelectedSiteForage(null);
                        setMode("single");
                    }
                }, fullWidth: true, maxWidth: "sm", children: [_jsx(DialogTitle, { children: formData.id ? "Éditer le compteur" : "Nouveau compteur" }), _jsxs(DialogContent, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [_jsxs(Tabs, { value: mode, onChange: (e, v) => setMode(v), children: [_jsx(Tab, { label: "Simple", value: "single" }), !formData.id && _jsx(Tab, { label: "Multiple", value: "manual" }), !formData.id && _jsx(Tab, { label: "Auto", value: "auto" })] }), mode === "single" && (_jsxs(_Fragment, { children: [_jsx(Autocomplete, { options: users, getOptionLabel: (user) => `${user.nom} - ${user.email || user.telephone}`, value: selectedUser, onChange: (_, newValue) => {
                                            setSelectedUser(newValue);
                                            setFormData({
                                                ...formData,
                                                user: newValue?.id || undefined
                                            });
                                        }, onInputChange: (_, newInputValue) => {
                                            setSearchUser(newInputValue);
                                        }, renderInput: (params) => (_jsx(TextField, { ...params, label: "Propri\u00E9taire du compteur", placeholder: "Rechercher un propri\u00E9taire...", helperText: "Seuls les utilisateurs avec le r\u00F4le 'owner' sont affich\u00E9s" })), loading: loadingUsers }), _jsx(Autocomplete, { options: sitesForage, getOptionLabel: (site) => `${site.nom} - ${site.localisation} (${site.type})`, value: selectedSiteForage, onChange: (_, newValue) => {
                                            setSelectedSiteForage(newValue);
                                            setFormData({
                                                ...formData,
                                                siteforage: newValue?.id || null
                                            });
                                        }, onInputChange: (_, newInputValue) => {
                                            setSearchSiteForage(newInputValue);
                                        }, renderInput: (params) => (_jsx(TextField, { ...params, label: "Site de forage", placeholder: "Rechercher un site de forage...", helperText: "Tapez au moins 2 caract\u00E8res pour rechercher" })), loading: loadingSites }), _jsx(TextField, { label: "Date d'installation", type: "date", value: formData.date_installation || "", onChange: (e) => setFormData({ ...formData, date_installation: e.target.value }), fullWidth: true, InputLabelProps: { shrink: true }, disabled: submitting })] })), mode === "manual" && (_jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [(bulkCompteurs || []).map((item, index) => (_jsxs(Box, { sx: { display: "flex", gap: 2, alignItems: "center" }, children: [_jsx(Autocomplete, { options: sitesForage, getOptionLabel: (site) => `${site.nom} - ${site.localisation}`, value: sitesForage.find(site => site.id === item.siteforage) || null, onChange: (_, newValue) => {
                                                    const newList = [...bulkCompteurs];
                                                    newList[index] = {
                                                        ...newList[index],
                                                        siteforage: newValue?.id || null
                                                    };
                                                    setBulkCompteurs(newList);
                                                }, onInputChange: (_, newInputValue) => {
                                                    setSearchSiteForage(newInputValue);
                                                }, renderInput: (params) => (_jsx(TextField, { ...params, label: "Site de forage", placeholder: "Rechercher un site...", size: "small" })), loading: loadingSites, fullWidth: true }), _jsx(IconButton, { color: "error", onClick: () => {
                                                    const newList = bulkCompteurs.filter((_, i) => i !== index);
                                                    setBulkCompteurs(newList);
                                                }, disabled: submitting, size: "small", children: _jsx(Iconify, { icon: "solar:trash-bin-trash-bold" }) })] }, index))), _jsx(Button, { variant: "outlined", size: "small", onClick: () => setBulkCompteurs([
                                            ...bulkCompteurs,
                                            { siteforage: null, actif: true },
                                        ]), disabled: submitting, children: "+ Ajouter un compteur" })] })), mode === "auto" && (_jsxs(_Fragment, { children: [_jsx(Autocomplete, { options: sitesForage, getOptionLabel: (site) => `${site.nom} - ${site.localisation}`, value: sitesForage.find(site => site.id === autoForm.siteforage) || null, onChange: (_, newValue) => {
                                            setAutoForm({
                                                ...autoForm,
                                                siteforage: newValue?.id || null
                                            });
                                        }, onInputChange: (_, newInputValue) => {
                                            setSearchSiteForage(newInputValue);
                                        }, renderInput: (params) => (_jsx(TextField, { ...params, label: "Site de forage", placeholder: "Rechercher un site de forage...", helperText: "Site o\u00F9 seront install\u00E9s les compteurs" })), loading: loadingSites }), _jsx(TextField, { label: "Date d'installation", type: "date", value: autoForm.date_installation, onChange: (e) => setAutoForm({ ...autoForm, date_installation: e.target.value }), fullWidth: true, InputLabelProps: { shrink: true }, disabled: submitting }), _jsx(TextField, { label: "Nombre de compteurs \u00E0 cr\u00E9er", type: "number", value: autoForm.code_start, onChange: (e) => setAutoForm({ ...autoForm, code_start: e.target.value }), fullWidth: true, disabled: submitting, helperText: "Nombre de compteurs \u00E0 cr\u00E9er automatiquement" })] }))] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => {
                                    setOpenDialog(false);
                                    setFormData({});
                                    setSelectedUser(null);
                                    setSelectedSiteForage(null);
                                    setMode("single");
                                }, disabled: submitting, children: "Annuler" }), _jsx(Button, { variant: "contained", onClick: handleSave, disabled: submitting, startIcon: submitting ? _jsx(CircularProgress, { size: 16 }) : null, children: submitting ? "Enregistrement..." : "Enregistrer" })] })] })] }));
}
