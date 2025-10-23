import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import apiClient from "../../../utils/api";
import { Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress, IconButton, Menu, MenuList, MenuItem as MenuItemMui, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Tabs, Tab, Pagination, FormControl, InputLabel, Autocomplete, Chip } from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";
import DeleteIcon from "@mui/icons-material/Delete";
export function RFIDView() {
    const [rfids, setRfids] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null); // NOUVEAU ÉTAT
    const [loading, setLoading] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toggling, setToggling] = useState(null);
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        page_size: 8,
        current_page: 1,
        total_pages: 1
    });
    // Filtres
    const [searchCode, setSearchCode] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [statutFilter, setStatutFilter] = useState("");
    const [pageSize, setPageSize] = useState(8);
    // Recherche utilisateur
    const [searchUser, setSearchUser] = useState("");
    // Menu actions
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRfid, setSelectedRfid] = useState(null);
    // Dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [mode, setMode] = useState("single");
    const [formData, setFormData] = useState({});
    const handleMenuOpen = (event, rfid) => {
        setAnchorEl(event.currentTarget);
        setSelectedRfid(rfid);
    };
    const handleMenuClose = () => setAnchorEl(null);
    // Charger les utilisateurs avec debounce - SIMPLIFIÉ
    const searchUsers = async (searchTerm) => {
        if (searchTerm.length < 2) {
            setUsers([]);
            return;
        }
        try {
            setLoadingUsers(true);
            const response = await apiClient.get(`/api/users/search/?search=${encodeURIComponent(searchTerm)}&page_size=10`);
            setUsers(response.data.results || []);
        }
        catch (err) {
            console.error("Erreur lors de la recherche d'utilisateurs:", err);
            setUsers([]);
        }
        finally {
            setLoadingUsers(false);
        }
    };
    // Debounce pour la recherche d'utilisateurs
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchUsers(searchUser);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchUser]);
    // Charger les cartes avec pagination et filtres
    const fetchRfids = async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                page_size: pageSize.toString(),
            });
            if (searchCode)
                params.append('search', searchCode);
            if (statusFilter)
                params.append('active', statusFilter);
            if (statutFilter)
                params.append('statut', statutFilter);
            const response = await apiClient.get(`/api/rfid/list-rfid-pagination?${params}`);
            const data = response.data;
            setRfids(data.results || []);
            setPagination({
                count: data.count || 0,
                next: data.next || null,
                previous: data.previous || null,
                page_size: data.page_size || 20,
                current_page: data.current_page || 1,
                total_pages: data.total_pages || 1
            });
        }
        catch (error) {
            console.error("Erreur lors du chargement :", error);
        }
        finally {
            setLoading(false);
        }
    };
    // Chargement initial
    useEffect(() => {
        fetchRfids(1);
    }, []);
    // Recherche avec debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchRfids(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchCode, statusFilter, statutFilter, pageSize]);
    // Changement de page
    const handlePageChange = (event, value) => {
        fetchRfids(value);
    };
    // Changement de la taille de page
    const handlePageSizeChange = (event) => {
        const newSize = parseInt(event.target.value);
        setPageSize(newSize);
    };
    // Save
    const handleSave = async () => {
        try {
            setSaving(true);
            if (mode === "single") {
                if (formData.id) {
                    const updateData = {};
                    if (formData.telephone !== undefined)
                        updateData.telephone = formData.telephone;
                    if (formData.code_uid !== undefined)
                        updateData.code_uid = formData.code_uid;
                    if (formData.code !== undefined)
                        updateData.code = formData.code;
                    if (formData.user_id !== undefined) {
                        updateData.user_id = formData.user_id;
                    }
                    await apiClient.put(`/api/rfid/update/${formData.id}/`, updateData);
                }
                else {
                    await apiClient.post(`/api/rfid/`, {
                        code_uid: formData.code_uid,
                        telephone: formData.telephone,
                    });
                }
            }
            if (mode === "multiple") {
                await apiClient.post(`/api/rfid/`, formData.list || []);
            }
            if (mode === "auto") {
                await apiClient.post(`/api/rfid/`, {
                    nombre: formData.nombre,
                });
            }
            fetchRfids(pagination.current_page);
            setOpenDialog(false);
            setFormData({});
            setSearchUser("");
            setUsers([]);
            setCurrentUser(null);
        }
        catch (error) {
            console.error("Erreur sauvegarde :", error);
            alert("Erreur lors de la sauvegarde de la carte RFID");
        }
        finally {
            setSaving(false);
        }
    };
    // Toggle activation
    const handleToggleActivation = async (code_uid) => {
        try {
            setToggling(code_uid);
            await apiClient.post(`/api/rfid/toggle/`, { uid: code_uid });
            fetchRfids(pagination.current_page);
        }
        catch (error) {
            console.error("Erreur lors de l'activation/désactivation :", error);
            alert("Erreur lors de la modification du statut de la carte");
        }
        finally {
            setToggling(null);
        }
    };
    // Réinitialiser les filtres
    const handleResetFilters = () => {
        setSearchCode("");
        setStatusFilter("");
        setStatutFilter("");
        setPageSize(8);
    };
    // Trouver l'utilisateur sélectionné pour l'affichage - CORRIGÉ
    const getSelectedUser = () => {
        if (!formData.user_id)
            return null;
        // Chercher d'abord dans currentUser, puis dans users
        if (currentUser && currentUser.id === formData.user_id) {
            return currentUser;
        }
        return users.find(user => user.id === formData.user_id) || null;
    };
    // Charger l'utilisateur actuel quand le dialog s'ouvre - CORRIGÉ
    useEffect(() => {
        if (openDialog && formData.id && formData.user_id && !currentUser) {
            const fetchCurrentUser = async () => {
                try {
                    const response = await apiClient.get(`/api/users/${formData.user_id}/`);
                    const user = response.data;
                    setCurrentUser(user); // Stocker l'utilisateur actuel séparément
                }
                catch (error) {
                    console.error("Erreur lors du chargement de l'utilisateur actuel:", error);
                }
            };
            fetchCurrentUser();
        }
    }, [openDialog, formData.id, formData.user_id, currentUser]);
    // Fonction pour ouvrir le dialog de configuration en cliquant sur la carte - CORRIGÉ
    const handleCardClick = (rfid) => {
        setFormData(rfid);
        setOpenDialog(true);
        setMode("single");
        setSearchUser("");
        setUsers([]);
        setCurrentUser(null); // Reset de l'utilisateur actuel
    };
    return (_jsxs(DashboardContent, { children: [_jsxs(Box, { sx: { mb: 5, display: "flex", alignItems: "center" }, children: [_jsxs(Typography, { variant: "h4", sx: { flexGrow: 1 }, children: ["Cartes RFID (", pagination.count, ")"] }), _jsx(Button, { variant: "contained", color: "inherit", startIcon: _jsx(Iconify, { icon: "mingcute:add-line" }), onClick: () => {
                            setFormData({});
                            setMode("single");
                            setOpenDialog(true);
                            setSearchUser("");
                            setUsers([]);
                            setCurrentUser(null);
                        }, children: "Ajouter une carte RFID" })] }), _jsx(Card, { sx: { p: 2, mb: 3 }, children: _jsxs(Box, { sx: { display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }, children: [_jsx(TextField, { label: "Rechercher (UID, Code, T\u00E9l\u00E9phone)", value: searchCode, onChange: (e) => setSearchCode(e.target.value), size: "small", placeholder: "UID, code ou t\u00E9l\u00E9phone...", sx: { minWidth: 200 } }), _jsxs(FormControl, { size: "small", sx: { minWidth: 120 }, children: [_jsx(InputLabel, { children: "Statut actif" }), _jsxs(Select, { value: statusFilter, label: "Statut actif", onChange: (e) => setStatusFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "Tous" }), _jsx(MenuItem, { value: "true", children: "Actifs" }), _jsx(MenuItem, { value: "false", children: "D\u00E9sactiv\u00E9s" })] })] }), _jsxs(FormControl, { size: "small", sx: { minWidth: 120 }, children: [_jsx(InputLabel, { children: "Statut" }), _jsxs(Select, { value: statutFilter, label: "Statut", onChange: (e) => setStatutFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "Tous" }), _jsx(MenuItem, { value: "stock", children: "En stock" }), _jsx(MenuItem, { value: "vendu", children: "Vendu" }), _jsx(MenuItem, { value: "actif", children: "Actif" }), _jsx(MenuItem, { value: "bloque", children: "Bloqu\u00E9" })] })] }), _jsxs(FormControl, { size: "small", sx: { minWidth: 120 }, children: [_jsx(InputLabel, { children: "Par page" }), _jsxs(Select, { value: pageSize, label: "Par page", onChange: handlePageSizeChange, children: [_jsx(MenuItem, { value: 8, children: "8" }), _jsx(MenuItem, { value: 20, children: "20" }), _jsx(MenuItem, { value: 40, children: "40" }), _jsx(MenuItem, { value: 60, children: "60" }), _jsx(MenuItem, { value: 100, children: "100" })] })] }), _jsx(Button, { variant: "outlined", onClick: handleResetFilters, children: "R\u00E9initialiser" })] }) }), pagination.total_pages > 1 && (_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Page ", pagination.current_page, " sur ", pagination.total_pages, "(", pagination.count, " cartes au total)"] }), _jsx(Pagination, { count: pagination.total_pages, page: pagination.current_page, onChange: handlePageChange, color: "primary" })] })), _jsx(Grid, { container: true, spacing: 2, children: loading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', width: '100%', p: 3 }, children: _jsx(CircularProgress, {}) })) : rfids.length > 0 ? (rfids.map((rfid) => (_jsx(Grid, { size: { xs: 12, sm: 6, md: 4, lg: 3 }, children: _jsxs(Card, { sx: {
                            p: 2,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                            height: '100%',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                boxShadow: 3,
                                transform: 'translateY(-2px)'
                            }
                        }, onClick: () => handleCardClick(rfid), children: [_jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [_jsx(Typography, { variant: "subtitle1", fontWeight: "bold", children: rfid.code_uid }), _jsx(IconButton, { onClick: (e) => {
                                            e.stopPropagation();
                                            handleMenuOpen(e, rfid);
                                        }, size: "small", disabled: toggling === rfid.code_uid, children: toggling === rfid.code_uid ? (_jsx(CircularProgress, { size: 20 })) : (_jsx(Iconify, { icon: "eva:more-vertical-fill" })) })] }), _jsxs(Box, { sx: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: '#0486d9',
                                    color: 'white'
                                }, children: [_jsx(Typography, { variant: "body2", fontWeight: "bold", children: "Code:" }), _jsx(Typography, { variant: "body2", fontWeight: "bold", children: rfid.code || "N/A" })] }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["T\u00E9l: ", rfid.telephone || "Non attribué"] }), rfid.user_nom && (_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 0.5 }, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Utilisateur:" }), _jsx(Chip, { label: rfid.user_nom, size: "small", variant: "outlined", color: "primary" })] })), _jsxs(Box, { sx: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: (rfid.solde_litres || 0) > 0 ? 'success.light' : 'grey.50'
                                }, children: [_jsx(Typography, { variant: "body2", fontWeight: "medium", children: "Solde litres:" }), _jsxs(Typography, { variant: "body2", sx: {
                                            fontWeight: 'bold',
                                            color: (rfid.solde_litres || 0) > 0 ? 'success.dark' : 'text.secondary'
                                        }, children: [rfid.solde_litres || 0, " L"] })] }), _jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mt: 'auto' }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: new Date(rfid.created_at).toLocaleDateString() }), _jsx(Box, { children: rfid.active ? (_jsx("span", { className: "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium", children: "Actif" })) : (_jsx("span", { className: "bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium", children: "D\u00E9sactiv\u00E9" })) })] })] }) }, rfid.id)))) : (_jsxs(Box, { sx: { width: '100%', textAlign: 'center', p: 3 }, children: [_jsx(Typography, { variant: "h6", color: "text.secondary", children: "Aucune carte RFID trouv\u00E9e" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: "Essayez de modifier vos crit\u00E8res de recherche" })] })) }), pagination.total_pages > 1 && (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', mt: 3 }, children: _jsx(Pagination, { count: pagination.total_pages, page: pagination.current_page, onChange: handlePageChange, color: "primary", size: "large" }) })), _jsx(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, children: _jsxs(MenuList, { children: [_jsx(MenuItemMui, { onClick: () => {
                                setFormData(selectedRfid || {});
                                setOpenDialog(true);
                                handleMenuClose();
                                setMode("single");
                                setSearchUser("");
                                setUsers([]);
                                setCurrentUser(null);
                            }, children: "Configurer" }), _jsx(MenuItemMui, { onClick: () => {
                                if (selectedRfid)
                                    handleToggleActivation(selectedRfid.code_uid);
                                handleMenuClose();
                            }, disabled: toggling === selectedRfid?.code_uid, children: toggling === selectedRfid?.code_uid ? (_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(CircularProgress, { size: 16 }), _jsx("span", { children: "Chargement..." })] })) : (selectedRfid?.active ? "Désactiver" : "Activer") })] }) }), _jsxs(Dialog, { open: openDialog, onClose: () => {
                    if (!saving) {
                        setOpenDialog(false);
                        setFormData({});
                        setSearchUser("");
                        setUsers([]);
                        setCurrentUser(null);
                    }
                }, fullWidth: true, maxWidth: "sm", children: [_jsx(DialogTitle, { children: formData.id ? "Éditer la carte RFID" : "Nouvelle carte RFID" }), _jsxs(DialogContent, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [_jsxs(Tabs, { value: mode, onChange: (e, v) => setMode(v), children: [_jsx(Tab, { label: "Simple", value: "single" }), !formData.id && _jsx(Tab, { label: "Multiple", value: "multiple" }), !formData.id && _jsx(Tab, { label: "Auto", value: "auto" })] }), mode === "single" && (_jsxs(_Fragment, { children: [_jsx(TextField, { label: "Code UID", value: formData.code_uid || "", onChange: (e) => setFormData({ ...formData, code_uid: e.target.value }), fullWidth: true, disabled: saving }), formData.id && (_jsx(TextField, { label: "Code (6 chiffres)", value: formData.code || "", onChange: (e) => setFormData({ ...formData, code: e.target.value }), fullWidth: true, inputProps: { maxLength: 6 }, helperText: "Code \u00E0 6 chiffres unique", disabled: saving })), _jsx(TextField, { label: "T\u00E9l\u00E9phone", value: formData.telephone || "", onChange: (e) => setFormData({ ...formData, telephone: e.target.value }), fullWidth: true, disabled: saving }), formData.id && (_jsxs(FormControl, { fullWidth: true, children: [_jsx(Autocomplete, { options: users, getOptionLabel: (option) => `${option.nom} - ${option.telephone || option.email}`, value: getSelectedUser(), onChange: (event, newValue) => {
                                                    setFormData({
                                                        ...formData,
                                                        user_id: newValue ? newValue.id : null
                                                    });
                                                }, onInputChange: (event, newValue) => {
                                                    setSearchUser(newValue);
                                                }, renderInput: (params) => (_jsx(TextField, { ...params, label: "Associer \u00E0 un utilisateur", placeholder: "Tapez au moins 2 caract\u00E8res pour rechercher...", helperText: "Recherchez un utilisateur par nom, email ou t\u00E9l\u00E9phone. Laissez vide ou cliquez sur 'Retirer' pour que la carte n'ait pas de propri\u00E9taire.", disabled: saving })), loading: loadingUsers, noOptionsText: searchUser.length < 2 ? "Tapez au moins 2 caractères" : "Aucun utilisateur trouvé", disabled: saving }), formData.user_id && getSelectedUser() && (_jsx(Box, { sx: { mt: 1, p: 1, backgroundColor: 'info.light', borderRadius: 1 }, children: _jsxs(Typography, { variant: "body2", color: "info.dark", children: ["Utilisateur actuel: ", getSelectedUser()?.nom, " (", getSelectedUser()?.telephone || getSelectedUser()?.email, ")"] }) })), formData.user_id && (_jsx(Button, { size: "small", color: "error", variant: "outlined", onClick: () => {
                                                    setFormData({
                                                        ...formData,
                                                        user_id: null
                                                    });
                                                    setSearchUser("");
                                                }, disabled: saving, startIcon: _jsx(DeleteIcon, {}), sx: { mt: 1 }, children: "Retirer l'utilisateur (devenir sans propri\u00E9taire)" })), !formData.user_id && formData.id && (_jsx(Box, { sx: { mt: 1, p: 1, backgroundColor: 'grey.100', borderRadius: 1 }, children: _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Aucun utilisateur associ\u00E9 - La carte n'appartient \u00E0 personne" }) }))] }))] })), !formData.id && (_jsxs(_Fragment, { children: [mode === "multiple" && (_jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [(formData.list || []).map((item, index) => (_jsxs(Box, { sx: { display: "flex", gap: 2, alignItems: "center" }, children: [_jsx(TextField, { label: "Code UID", value: item.code_uid || "", onChange: (e) => {
                                                            const newList = [...(formData.list || [])];
                                                            newList[index] = { ...newList[index], code_uid: e.target.value };
                                                            setFormData({ ...formData, list: newList });
                                                        }, fullWidth: true, disabled: saving }), _jsx(TextField, { label: "T\u00E9l\u00E9phone", value: item.telephone || "", onChange: (e) => {
                                                            const newList = [...(formData.list || [])];
                                                            newList[index] = { ...newList[index], telephone: e.target.value };
                                                            setFormData({ ...formData, list: newList });
                                                        }, fullWidth: true, disabled: saving }), _jsx(IconButton, { color: "error", onClick: () => {
                                                            const newList = [...(formData.list || [])];
                                                            newList.splice(index, 1);
                                                            setFormData({ ...formData, list: newList });
                                                        }, disabled: saving, children: _jsx(Iconify, { icon: "solar:trash-bin-trash-bold" }) })] }, index))), _jsx(Button, { variant: "outlined", size: "small", onClick: () => setFormData({
                                                    ...formData,
                                                    list: [...(formData.list || []), { code_uid: "", telephone: "" }],
                                                }), disabled: saving, children: "+ Ajouter une carte" })] })), mode === "auto" && (_jsx(TextField, { label: "Nombre de cartes", type: "number", value: formData.nombre || 1, onChange: (e) => setFormData({ ...formData, nombre: Number(e.target.value) }), fullWidth: true, disabled: saving }))] }))] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => {
                                    setOpenDialog(false);
                                    setFormData({});
                                    setSearchUser("");
                                    setUsers([]);
                                    setCurrentUser(null);
                                }, disabled: saving, children: "Annuler" }), _jsx(Button, { variant: "contained", onClick: handleSave, disabled: saving, startIcon: saving ? _jsx(CircularProgress, { size: 16 }) : null, children: saving ? "Enregistrement..." : "Enregistrer" })] })] })] }));
}
