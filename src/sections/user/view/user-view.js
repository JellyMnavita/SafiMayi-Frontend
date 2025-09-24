import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import apiClient from "../../../utils/api";
import { Box, Card, Typography, TextField, IconButton, Button, Menu, MenuList, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Select, Pagination, FormControl, CircularProgress, Grid, InputLabel, Alert, Snackbar } from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";
export function UserView() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    // Search + Filters
    const [searchNom, setSearchNom] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize] = useState(5);
    // Menu contextuel
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    // Dialog (create/edit)
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({});
    const [saveLoading, setSaveLoading] = useState(false);
    // Charger utilisateurs
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get("/api/users/create-list/");
            setUsers(res.data);
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
        fetchUsers();
    }, []);
    // Filtrage local
    const filteredUsers = users.filter((u) => u.nom.toLowerCase().includes(searchNom.toLowerCase()) &&
        u.email.toLowerCase().includes(searchEmail.toLowerCase()) &&
        (roleFilter ? u.role.toLowerCase() === roleFilter.toLowerCase() : true));
    // Pagination locale
    const paginatedData = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
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
            fetchUsers();
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
            fetchUsers();
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
            fetchUsers();
            handleMenuClose();
        }
        catch (error) {
            console.error("Erreur lors du changement de statut :", error);
            setError(error.response?.data?.detail || "Erreur lors du changement de statut");
        }
    };
    return (_jsxs(DashboardContent, { children: [_jsxs(Box, { sx: { mb: 5, display: "flex", alignItems: "center" }, children: [_jsx(Typography, { variant: "h4", sx: { flexGrow: 1 }, children: "Utilisateurs" }), _jsx(Button, { variant: "contained", color: "inherit", startIcon: _jsx(Iconify, { icon: "mingcute:add-line" }), onClick: () => {
                            setFormData({});
                            setOpenDialog(true);
                            setError("");
                        }, children: "Nouvel utilisateur" })] }), _jsx(Card, { sx: { p: 2, mb: 3 }, children: _jsxs(Box, { sx: { display: "flex", gap: 2, flexWrap: "wrap" }, children: [_jsx(TextField, { label: "Nom", value: searchNom, onChange: (e) => setSearchNom(e.target.value), size: "small" }), _jsx(TextField, { label: "Email", value: searchEmail, onChange: (e) => setSearchEmail(e.target.value), size: "small" }), _jsxs(FormControl, { size: "small", children: [_jsx(InputLabel, { id: "role-filter-label", children: "R\u00F4le" }), _jsxs(Select, { value: roleFilter, onChange: (e) => setRoleFilter(e.target.value), displayEmpty: true, label: "R\u00F4le", labelId: "role-filter-label", style: { minWidth: 120 }, children: [_jsx(MenuItem, { value: "client", children: "Client" }), _jsx(MenuItem, { value: "admin", children: "Admin" }), _jsx(MenuItem, { value: "agent", children: "Agent" }), _jsx(MenuItem, { value: "gerant", children: "G\u00E9rant" }), _jsx(MenuItem, { value: "owner", children: "Propri\u00E9taire" })] })] }), _jsx(Button, { variant: "outlined", onClick: () => {
                                setSearchNom("");
                                setSearchEmail("");
                                setRoleFilter("");
                            }, children: "R\u00E9initialiser" })] }) }), _jsx(Card, { children: _jsx("div", { className: "p-4 bg-white shadow-md rounded-md overflow-x-auto", children: loading ? (_jsx("div", { className: "flex justify-center items-center py-10", children: _jsx(CircularProgress, {}) })) : (_jsxs(_Fragment, { children: [_jsxs("table", { className: "w-full border-collapse min-w-[700px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100 text-left text-sm", children: [_jsx("th", { className: "p-2 border-b", children: "Nom" }), _jsx("th", { className: "p-2 border-b", children: "Email" }), _jsx("th", { className: "p-2 border-b", children: "T\u00E9l\u00E9phone" }), _jsx("th", { className: "p-2 border-b", children: "R\u00F4le" }), _jsx("th", { className: "p-2 border-b", children: "Statut" }), _jsx("th", { className: "p-2 border-b text-center", children: "Actions" })] }) }), _jsx("tbody", { children: paginatedData.length > 0 ? (paginatedData.map((user) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "p-2 border-b", children: user.nom }), _jsx("td", { className: "p-2 border-b", children: user.email }), _jsx("td", { className: "p-2 border-b", children: user.telephone }), _jsx("td", { className: "p-2 border-b capitalize", children: user.role }), _jsx("td", { className: "p-2 border-b", children: user.state ? (_jsx("span", { className: "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium", children: "Actif" })) : (_jsx("span", { className: "bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium", children: "Inactif" })) }), _jsx("td", { className: "p-2 border-b text-center", children: _jsx(IconButton, { onClick: (e) => handleMenuOpen(e, user), children: _jsx(Iconify, { icon: "eva:more-vertical-fill" }) }) })] }, user.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center text-gray-500 py-6", children: "Aucun utilisateur trouv\u00E9" }) })) })] }), _jsxs(Box, { sx: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 2,
                                    flexWrap: "wrap",
                                    gap: 2,
                                }, children: [_jsx(Typography, { variant: "body2", children: `Affichage de ${paginatedData.length} sur ${filteredUsers.length} utilisateurs` }), _jsx(Pagination, { count: Math.ceil(filteredUsers.length / pageSize), page: page, onChange: (_, value) => setPage(value), color: "primary" })] })] })) }) }), _jsx(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, children: _jsxs(MenuList, { children: [_jsx(MenuItem, { onClick: () => {
                                setFormData(selectedUser || {});
                                setOpenDialog(true);
                                setError("");
                                handleMenuClose();
                            }, children: "Modifier" }), _jsx(MenuItem, { onClick: handleToggleStatus, children: selectedUser?.state ? "Désactiver" : "Activer" }), _jsx(MenuItem, { onClick: handleDelete, sx: { color: "error.main" }, children: "Supprimer" })] }) }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), fullWidth: true, maxWidth: "sm", children: [_jsx(DialogTitle, { children: formData.id ? "Modifier l'utilisateur" : "Nouvel utilisateur" }), _jsxs(DialogContent, { sx: { mt: 2 }, children: [error && _jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }), _jsxs(Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [_jsx(Grid, { sx: { width: '100%' }, children: _jsx(TextField, { label: "Nom complet", name: "nom", value: formData.nom || "", onChange: handleInputChange, fullWidth: true, required: true }) }), _jsx(Grid, { sx: { width: '100%' }, children: _jsx(TextField, { label: "Email", name: "email", type: "email", value: formData.email || "", onChange: handleInputChange, fullWidth: true, required: true }) }), _jsx(Grid, { sx: { width: '100%' }, children: _jsx(TextField, { label: "T\u00E9l\u00E9phone", name: "telephone", value: formData.telephone || "", onChange: handleInputChange, fullWidth: true, required: true }) }), !formData.id && (_jsx(Grid, { sx: { width: '100%' }, children: _jsx(TextField, { label: "Mot de passe", name: "password", type: "password", value: formData.password || "", onChange: handleInputChange, fullWidth: true, required: !formData.id }) })), _jsx(Grid, { sx: { width: '100%' }, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "R\u00F4le" }), _jsxs(Select, { name: "role", value: formData.role || "client", label: "R\u00F4le", onChange: (e) => handleSelectChange("role", e.target.value), required: true, children: [_jsx(MenuItem, { value: "client", children: "Client" }), _jsx(MenuItem, { value: "admin", children: "Admin" }), _jsx(MenuItem, { value: "agent", children: "Agent Commercial" }), _jsx(MenuItem, { value: "gerant", children: "G\u00E9rant" }), _jsx(MenuItem, { value: "owner", children: "Propri\u00E9taire" })] })] }) })] })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpenDialog(false), disabled: saveLoading, children: "Annuler" }), _jsx(Button, { variant: "contained", onClick: handleSave, disabled: saveLoading, startIcon: saveLoading ? _jsx(CircularProgress, { size: 16 }) : null, children: saveLoading ? "Enregistrement..." : "Enregistrer" })] })] }), _jsx(Snackbar, { open: !!error, autoHideDuration: 6000, onClose: () => setError(""), anchorOrigin: { vertical: 'bottom', horizontal: 'center' }, children: _jsx(Alert, { severity: "error", onClose: () => setError(""), children: error }) }), _jsx(Snackbar, { open: !!successMessage, autoHideDuration: 3000, onClose: () => setSuccessMessage(""), anchorOrigin: { vertical: 'bottom', horizontal: 'center' }, children: _jsx(Alert, { severity: "success", onClose: () => setSuccessMessage(""), children: successMessage }) })] }));
}
