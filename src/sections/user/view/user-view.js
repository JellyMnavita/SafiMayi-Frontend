import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import apiClient from "../../../utils/api";
import { Box, Card, Typography, TextField, IconButton, Button, Menu, MenuList, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Select, Pagination, FormControl, CircularProgress, Grid, InputLabel, Alert, Snackbar, Chip } from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";
export function UserView() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    // Search + Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [stateFilter, setStateFilter] = useState("");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    // Menu contextuel
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    // Dialog (create/edit)
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({});
    const [saveLoading, setSaveLoading] = useState(false);
    // Charger utilisateurs avec pagination et filtres
    const fetchUsers = async (pageNum = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pageNum.toString(),
                page_size: pageSize.toString(),
            });
            if (searchTerm)
                params.append('search', searchTerm);
            if (roleFilter)
                params.append('role', roleFilter);
            if (stateFilter !== '')
                params.append('state', stateFilter);
            const res = await apiClient.get(`/api/users/list/?${params.toString()}`);
            setUsers(res.data.results);
            setTotalCount(res.data.count);
            setTotalPages(res.data.total_pages);
            setPage(res.data.page);
        }
        catch (err) {
            console.error("Erreur lors du chargement des utilisateurs", err);
            setError("Erreur lors du chargement des utilisateurs");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchUsers(1);
    }, [pageSize, searchTerm, roleFilter, stateFilter]);
    // Recherche avec debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, roleFilter, stateFilter, pageSize]);
    // Menu actions
    const handleMenuOpen = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };
    const handleMenuClose = () => setAnchorEl(null);
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
    // Save (create/update)
    const handleSave = async () => {
        try {
            setSaveLoading(true);
            setError("");
            // Validation des champs requis
            if (!formData.nom || !formData.email || !formData.telephone || !formData.role) {
                setError("Veuillez remplir tous les champs obligatoires");
                return;
            }
            // Pour la création, vérifier le mot de passe
            if (!formData.id && !formData.password) {
                setError("Le mot de passe est requis pour la création");
                return;
            }
            if (formData.id) {
                // Modification - utiliser PUT pour la mise à jour complète
                await apiClient.put(`/api/users/${formData.id}/`, formData);
                setSuccessMessage("Utilisateur modifié avec succès");
            }
            else {
                // Création
                await apiClient.post("/api/users/create-list/", formData);
                setSuccessMessage("Utilisateur créé avec succès");
            }
            fetchUsers(page);
            setOpenDialog(false);
            setFormData({});
        }
        catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
            const errorMessage = error.response?.data?.detail ||
                error.response?.data?.message ||
                "Erreur lors de la sauvegarde";
            setError(errorMessage);
        }
        finally {
            setSaveLoading(false);
        }
    };
    // Supprimer un utilisateur
    const handleDelete = async () => {
        try {
            if (!selectedUser)
                return;
            await apiClient.delete(`/api/users/${selectedUser.id}/`);
            setSuccessMessage("Utilisateur désactivé avec succès");
            fetchUsers(page);
            handleMenuClose();
        }
        catch (error) {
            console.error("Erreur lors de la suppression :", error);
            setError(error.response?.data?.detail || "Erreur lors de la suppression");
        }
    };
    // Activer/Désactiver un utilisateur
    const handleToggleStatus = async () => {
        try {
            if (!selectedUser)
                return;
            const newState = !selectedUser.state;
            await apiClient.patch(`/api/users/${selectedUser.id}/`, { state: newState });
            setSuccessMessage(`Utilisateur ${newState ? "activé" : "désactivé"} avec succès`);
            fetchUsers(page);
            handleMenuClose();
        }
        catch (error) {
            console.error("Erreur lors du changement de statut :", error);
            setError(error.response?.data?.detail || "Erreur lors du changement de statut");
        }
    };
    // Réinitialiser tous les filtres
    const handleResetFilters = () => {
        setSearchTerm("");
        setRoleFilter("");
        setStateFilter("");
        setPage(1);
    };
    // Changement de page
    const handlePageChange = (event, value) => {
        setPage(value);
        fetchUsers(value);
    };
    // Obtenir le libellé du rôle
    const getRoleLabel = (role) => {
        const roles = {
            'client': 'Client',
            'admin': 'Administrateur',
            'agent': 'Agent Commercial',
            'gerant': 'Gérant',
            'owner': 'Propriétaire'
        };
        return roles[role] || role;
    };
    return (_jsxs(DashboardContent, { children: [_jsxs(Box, { sx: { mb: 5, display: "flex", alignItems: "center" }, children: [_jsxs(Typography, { variant: "h4", sx: { flexGrow: 1 }, children: ["Utilisateurs (", totalCount, ")"] }), _jsx(Button, { variant: "contained", color: "inherit", startIcon: _jsx(Iconify, { icon: "mingcute:add-line" }), onClick: () => {
                            setFormData({});
                            setOpenDialog(true);
                            setError("");
                        }, children: "Nouvel utilisateur" })] }), _jsx(Card, { sx: { p: 2, mb: 3 }, children: _jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [_jsxs(Box, { sx: {
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }, children: [_jsx(TextField, { label: "Rechercher un utilisateur", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), size: "small", placeholder: "Nom, email, t\u00E9l\u00E9phone...", sx: { minWidth: 250, flexGrow: 1 } }), _jsxs(Box, { sx: { display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }, children: [_jsxs(FormControl, { size: "small", sx: { minWidth: 120 }, children: [_jsx(InputLabel, { children: "R\u00F4le" }), _jsxs(Select, { value: roleFilter, label: "R\u00F4le", onChange: (e) => setRoleFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "Tous" }), _jsx(MenuItem, { value: "client", children: "Client" }), _jsx(MenuItem, { value: "admin", children: "Admin" }), _jsx(MenuItem, { value: "agent", children: "Agent" }), _jsx(MenuItem, { value: "gerant", children: "G\u00E9rant" }), _jsx(MenuItem, { value: "owner", children: "Propri\u00E9taire" })] })] }), _jsxs(FormControl, { size: "small", sx: { minWidth: 100 }, children: [_jsx(InputLabel, { children: "Statut" }), _jsxs(Select, { value: stateFilter, label: "Statut", onChange: (e) => setStateFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "Tous" }), _jsx(MenuItem, { value: "true", children: "Actif" }), _jsx(MenuItem, { value: "false", children: "Inactif" })] })] }), _jsx(Button, { variant: "outlined", size: "small", startIcon: _jsx(Iconify, { icon: showAdvancedFilters ? "mingcute:close-line" : "ic:round-filter-list" }), onClick: () => setShowAdvancedFilters(!showAdvancedFilters), sx: { whiteSpace: 'nowrap' }, children: showAdvancedFilters ? "Masquer" : "Plus de filtres" }), _jsx(Button, { variant: "outlined", size: "small", onClick: handleResetFilters, startIcon: _jsx(Iconify, { icon: "solar:restart-bold" }), children: "R\u00E9initialiser" })] })] }), showAdvancedFilters && (_jsx(Box, { sx: {
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                                alignItems: "center",
                                pt: 2,
                                borderTop: 1,
                                borderColor: 'divider'
                            }, children: _jsxs(FormControl, { size: "small", sx: { minWidth: 100 }, children: [_jsx(InputLabel, { children: "Par page" }), _jsxs(Select, { value: pageSize, label: "Par page", onChange: (e) => setPageSize(Number(e.target.value)), children: [_jsx(MenuItem, { value: 10, children: "10" }), _jsx(MenuItem, { value: 20, children: "20" }), _jsx(MenuItem, { value: 50, children: "50" }), _jsx(MenuItem, { value: 100, children: "100" })] })] }) })), (roleFilter || stateFilter) && (_jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Filtres actifs:" }), roleFilter && (_jsx(Chip, { size: "small", label: `Rôle: ${getRoleLabel(roleFilter)}`, onDelete: () => setRoleFilter("") })), stateFilter && (_jsx(Chip, { size: "small", label: `Statut: ${stateFilter === "true" ? "Actif" : "Inactif"}`, onDelete: () => setStateFilter("") }))] }))] }) }), totalPages > 1 && (_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Page ", page, " sur ", totalPages, "(", totalCount, " utilisateurs au total)"] }), _jsx(Pagination, { count: totalPages, page: page, onChange: handlePageChange, color: "primary" })] })), _jsx(Card, { children: _jsx("div", { className: "p-4 bg-white shadow-md rounded-md overflow-x-auto", children: loading ? (_jsx("div", { className: "flex justify-center items-center py-10", children: _jsx(CircularProgress, {}) })) : (_jsxs(_Fragment, { children: [_jsxs("table", { className: "w-full border-collapse min-w-[700px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100 text-left text-sm", children: [_jsx("th", { className: "p-3 border-b font-semibold", children: "Nom" }), _jsx("th", { className: "p-3 border-b font-semibold", children: "Email" }), _jsx("th", { className: "p-3 border-b font-semibold", children: "T\u00E9l\u00E9phone" }), _jsx("th", { className: "p-3 border-b font-semibold", children: "R\u00F4le" }), _jsx("th", { className: "p-3 border-b font-semibold", children: "Statut" }), _jsx("th", { className: "p-3 border-b font-semibold text-center", children: "Actions" })] }) }), _jsx("tbody", { children: users.length > 0 ? (users.map((user) => (_jsxs("tr", { className: "hover:bg-gray-50 cursor-pointer", onClick: () => {
                                                setFormData(user);
                                                setOpenDialog(true);
                                                setError("");
                                            }, children: [_jsx("td", { className: "p-3 border-b", children: _jsx(Box, { sx: {
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: 1
                                                        }, children: _jsx(Typography, { variant: "body2", fontWeight: "medium", children: user.nom }) }) }), _jsx("td", { className: "p-3 border-b", children: _jsx(Typography, { variant: "body2", children: user.email }) }), _jsx("td", { className: "p-3 border-b", children: user.telephone ? (_jsx(Typography, { variant: "body2", children: user.telephone })) : (_jsx(Typography, { variant: "body2", color: "text.secondary", children: "-" })) }), _jsx("td", { className: "p-3 border-b", children: _jsx(Chip, { label: getRoleLabel(user.role), size: "small", variant: "outlined", color: user.role === 'admin' ? 'error' :
                                                            user.role === 'owner' ? 'warning' :
                                                                user.role === 'agent' ? 'info' :
                                                                    user.role === 'gerant' ? 'secondary' : 'default' }) }), _jsx("td", { className: "p-3 border-b", children: user.state ? (_jsx(Chip, { label: "Actif", size: "small", color: "success", variant: "filled" })) : (_jsx(Chip, { label: "Inactif", size: "small", color: "error", variant: "filled" })) }), _jsx("td", { className: "p-3 border-b text-center", children: _jsx(IconButton, { onClick: (e) => {
                                                            e.stopPropagation();
                                                            handleMenuOpen(e, user);
                                                        }, size: "small", children: _jsx(Iconify, { icon: "eva:more-vertical-fill" }) }) })] }, user.id)))) : (_jsx("tr", { children: _jsxs("td", { colSpan: 6, className: "text-center text-gray-500 py-6", children: [_jsx(Typography, { variant: "h6", color: "text.secondary", children: "Aucun utilisateur trouv\u00E9" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: "Essayez de modifier vos crit\u00E8res de recherche" })] }) })) })] }), _jsxs(Box, { sx: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 2,
                                    flexWrap: "wrap",
                                    gap: 2,
                                }, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: `Affichage de ${users.length} sur ${totalCount} utilisateurs` }), _jsx(Pagination, { count: totalPages, page: page, onChange: handlePageChange, color: "primary" })] })] })) }) }), _jsx(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, children: _jsxs(MenuList, { children: [_jsx(MenuItem, { onClick: () => {
                                setFormData(selectedUser || {});
                                setOpenDialog(true);
                                setError("");
                                handleMenuClose();
                            }, children: "Modifier" }), _jsx(MenuItem, { onClick: handleToggleStatus, children: selectedUser?.state ? "Désactiver" : "Activer" }), _jsx(MenuItem, { onClick: handleDelete, sx: { color: "error.main" }, children: "Supprimer" })] }) }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), fullWidth: true, maxWidth: "sm", children: [_jsx(DialogTitle, { children: formData.id ? "Modifier l'utilisateur" : "Nouvel utilisateur" }), _jsxs(DialogContent, { sx: { mt: 2 }, children: [error && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), _jsxs(Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [_jsx(Grid, { sx: { width: '100%' }, children: _jsx(TextField, { label: "Nom complet", name: "nom", value: formData.nom || "", onChange: handleInputChange, fullWidth: true, required: true }) }), _jsx(Grid, { sx: { width: '100%' }, children: _jsx(TextField, { label: "Email", name: "email", type: "email", value: formData.email || "", onChange: handleInputChange, fullWidth: true, required: true }) }), _jsx(Grid, { sx: { width: '100%' }, children: _jsx(TextField, { label: "T\u00E9l\u00E9phone", name: "telephone", value: formData.telephone || "", onChange: handleInputChange, fullWidth: true, required: true }) }), !formData.id && (_jsx(Grid, { sx: { width: '100%' }, children: _jsx(TextField, { label: "Mot de passe", name: "password", type: "password", value: formData.password || "", onChange: handleInputChange, fullWidth: true, required: !formData.id }) })), _jsx(Grid, { sx: { width: '100%' }, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "R\u00F4le" }), _jsxs(Select, { name: "role", value: formData.role || "client", label: "R\u00F4le", onChange: (e) => handleSelectChange("role", e.target.value), required: true, children: [_jsx(MenuItem, { value: "client", children: "Client" }), _jsx(MenuItem, { value: "admin", children: "Admin" }), _jsx(MenuItem, { value: "agent", children: "Agent Commercial" }), _jsx(MenuItem, { value: "gerant", children: "G\u00E9rant" }), _jsx(MenuItem, { value: "owner", children: "Propri\u00E9taire" })] })] }) })] })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpenDialog(false), disabled: saveLoading, children: "Annuler" }), _jsx(Button, { variant: "contained", onClick: handleSave, disabled: saveLoading, startIcon: saveLoading ? _jsx(CircularProgress, { size: 16 }) : null, children: saveLoading ? "Enregistrement..." : "Enregistrer" })] })] }), _jsx(Snackbar, { open: !!error, autoHideDuration: 6000, onClose: () => setError(""), anchorOrigin: { vertical: 'bottom', horizontal: 'center' }, children: _jsx(Alert, { severity: "error", onClose: () => setError(""), children: error }) }), _jsx(Snackbar, { open: !!successMessage, autoHideDuration: 3000, onClose: () => setSuccessMessage(""), anchorOrigin: { vertical: 'bottom', horizontal: 'center' }, children: _jsx(Alert, { severity: "success", onClose: () => setSuccessMessage(""), children: successMessage }) })] }));
}
