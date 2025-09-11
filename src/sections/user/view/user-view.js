import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Card, Typography, TextField, IconButton, Button, Menu, MenuList, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Select, Pagination, FormControl, CircularProgress } from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";
export function UserView() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
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
    // Charger utilisateurs
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axios.get("https://safimayi-backend.onrender.com/api/users/create-list/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data);
        }
        catch (err) {
            console.error("Erreur lors du chargement des utilisateurs", err);
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
        (roleFilter ? u.role === roleFilter : true));
    // Pagination locale
    const paginatedData = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
    // Menu actions
    const handleMenuOpen = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };
    const handleMenuClose = () => setAnchorEl(null);
    // Save (create/update)
    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            if (formData.id) {
                await axios.put(`https://safimayi-backend.onrender.com/api/users/${formData.id}/`, formData, { headers: { Authorization: `Bearer ${token}` } });
            }
            else {
                await axios.post("https://safimayi-backend.onrender.com/api/users/create-list/", formData, { headers: { Authorization: `Bearer ${token}` } });
            }
            fetchUsers();
            setOpenDialog(false);
            setFormData({});
        }
        catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
        }
    };
    return (_jsxs(DashboardContent, { children: [_jsxs(Box, { sx: { mb: 5, display: "flex", alignItems: "center" }, children: [_jsx(Typography, { variant: "h4", sx: { flexGrow: 1 }, children: "Utilisateurs" }), _jsx(Button, { variant: "contained", color: "inherit", startIcon: _jsx(Iconify, { icon: "mingcute:add-line" }), onClick: () => {
                            setFormData({});
                            setOpenDialog(true);
                        }, children: "Nouvel utilisateur" })] }), _jsx(Card, { sx: { p: 2, mb: 3 }, children: _jsxs(Box, { sx: { display: "flex", gap: 2, flexWrap: "wrap" }, children: [_jsx(TextField, { label: "Nom", value: searchNom, onChange: (e) => setSearchNom(e.target.value), size: "small" }), _jsx(TextField, { label: "Email", value: searchEmail, onChange: (e) => setSearchEmail(e.target.value), size: "small" }), _jsx(FormControl, { size: "small", children: _jsxs(Select, { value: roleFilter, onChange: (e) => setRoleFilter(e.target.value), displayEmpty: true, label: "R\u00F4le", children: [_jsx(MenuItem, { value: "", children: "Tous" }), _jsx(MenuItem, { value: "client", children: "Client" }), _jsx(MenuItem, { value: "admin", children: "Admin" }), _jsx(MenuItem, { value: "agent", children: "Agent" })] }) }), _jsx(Button, { variant: "outlined", onClick: () => {
                                setSearchNom("");
                                setSearchEmail("");
                                setRoleFilter("");
                            }, children: "R\u00E9initialiser" })] }) }), _jsx(Card, { children: _jsx("div", { className: "p-4 bg-white shadow-md rounded-md overflow-x-auto", children: loading ? (_jsx("div", { className: "flex justify-center items-center py-10", children: _jsx(CircularProgress, {}) })) : (_jsxs(_Fragment, { children: [_jsxs("table", { className: "w-full border-collapse min-w-[700px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100 text-left text-sm", children: [_jsx("th", { className: "p-2 border-b", children: "Nom" }), _jsx("th", { className: "p-2 border-b", children: "Email" }), _jsx("th", { className: "p-2 border-b", children: "T\u00E9l\u00E9phone" }), _jsx("th", { className: "p-2 border-b", children: "R\u00F4le" }), _jsx("th", { className: "p-2 border-b", children: "Statut" }), _jsx("th", { className: "p-2 border-b text-center", children: "Actions" })] }) }), _jsx("tbody", { children: paginatedData.length > 0 ? (paginatedData.map((user) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "p-2 border-b", children: user.nom }), _jsx("td", { className: "p-2 border-b", children: user.email }), _jsx("td", { className: "p-2 border-b", children: user.telephone }), _jsx("td", { className: "p-2 border-b capitalize", children: user.role }), _jsx("td", { className: "p-2 border-b", children: user.state ? (_jsx("span", { className: "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium", children: "Actif" })) : (_jsx("span", { className: "bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium", children: "Banni" })) }), _jsx("td", { className: "p-2 border-b text-center", children: _jsx(IconButton, { onClick: (e) => handleMenuOpen(e, user), children: _jsx(Iconify, { icon: "eva:more-vertical-fill" }) }) })] }, user.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "text-center text-gray-500 py-6", children: "Aucun utilisateur trouv\u00E9" }) })) })] }), _jsxs(Box, { sx: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 2,
                                    flexWrap: "wrap",
                                    gap: 2,
                                }, children: [_jsx(Typography, { variant: "body2", children: `Affichage de ${paginatedData.length} sur ${filteredUsers.length} utilisateurs` }), _jsx(Pagination, { count: Math.ceil(filteredUsers.length / pageSize), page: page, onChange: (_, value) => setPage(value), color: "primary" })] })] })) }) }), _jsx(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, children: _jsxs(MenuList, { children: [_jsx(MenuItem, { onClick: () => {
                                setFormData(selectedUser || {});
                                setOpenDialog(true);
                                handleMenuClose();
                            }, children: "Modifier" }), _jsx(MenuItem, { onClick: () => {
                                console.log("TODO: delete user", selectedUser);
                                handleMenuClose();
                            }, children: "Supprimer" })] }) }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), fullWidth: true, maxWidth: "sm", children: [_jsx(DialogTitle, { children: formData.id ? "Modifier l’utilisateur" : "Nouvel utilisateur" }), _jsxs(DialogContent, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 2 }, children: [_jsx(TextField, { label: "Nom", value: formData.nom || "", onChange: (e) => setFormData({ ...formData, nom: e.target.value }), fullWidth: true }), _jsx(TextField, { label: "Email", type: "email", value: formData.email || "", onChange: (e) => setFormData({ ...formData, email: e.target.value }), fullWidth: true }), _jsx(TextField, { label: "T\u00E9l\u00E9phone", value: formData.telephone || "", onChange: (e) => setFormData({ ...formData, telephone: e.target.value }), fullWidth: true }), _jsx(FormControl, { fullWidth: true, children: _jsxs(Select, { value: formData.role || "client", onChange: (e) => setFormData({ ...formData, role: e.target.value }), children: [_jsx(MenuItem, { value: "client", children: "Client" }), _jsx(MenuItem, { value: "admin", children: "Admin" }), _jsx(MenuItem, { value: "agent", children: "Agent" })] }) })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpenDialog(false), children: "Annuler" }), _jsx(Button, { variant: "contained", onClick: handleSave, children: "Enregistrer" })] })] })] }));
}
