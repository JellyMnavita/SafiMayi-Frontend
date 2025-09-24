import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import apiClient from "../../../utils/api";
import { Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress, IconButton, Menu, MenuList, MenuItem as MenuItemMui, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Tabs, Tab } from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";
export function RFIDView() {
    const [allRfid, setAllRfid] = useState([]);
    const [rfids, setRfids] = useState([]);
    const [loading, setLoading] = useState(true);
    // Filtres
    const [searchCode, setSearchCode] = useState("");
    const [searchTel, setSearchTel] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
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
    // Charger les cartes
    const fetchRfids = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/api/rfid/`);
            const data = response.data.results || response.data;
            setAllRfid(data);
            setRfids(data);
        }
        catch (error) {
            console.error("Erreur lors du chargement :", error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchRfids();
    }, []);
    // Filtrage local
    useEffect(() => {
        let filtered = [...allRfid];
        if (searchCode) {
            filtered = filtered.filter((c) => {
                if (!c.code_uid)
                    return false;
                return c.code_uid.toLowerCase().includes(searchCode.toLowerCase());
            });
        }
        if (searchTel) {
            filtered = filtered.filter((c) => {
                if (!c.telephone)
                    return false;
                return c.telephone.toLowerCase().includes(searchTel.toLowerCase());
            });
        }
        if (statusFilter) {
            filtered = filtered.filter((c) => String(c.active) === statusFilter);
        }
        setRfids(filtered);
    }, [searchCode, searchTel, statusFilter, allRfid]);
    // Save
    const handleSave = async () => {
        try {
            if (mode === "single") {
                if (formData.id) {
                    // Edition
                    await apiClient.put(`/api/rfid/update/${formData.id}/`, {
                        telephone: formData.telephone,
                        code_uid: formData.code_uid,
                    });
                }
                else {
                    // Création
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
            fetchRfids();
            setOpenDialog(false);
            setFormData({});
        }
        catch (error) {
            console.error("Erreur sauvegarde :", error);
            alert("Erreur lors de la sauvegarde de la carte RFID");
        }
    };
    // Toggle activation
    const handleToggleActivation = async (code_uid) => {
        try {
            setRfids(prevRfids => prevRfids.map(rfid => rfid.code_uid === code_uid
                ? { ...rfid, active: !rfid.active }
                : rfid));
            await apiClient.post(`/api/rfid/toggle/`, { uid: code_uid });
            fetchRfids();
        }
        catch (error) {
            console.error("Erreur lors de l'activation/désactivation :", error);
            fetchRfids();
            alert("Erreur lors de la modification du statut de la carte");
        }
    };
    return (_jsxs(DashboardContent, { children: [_jsxs(Box, { sx: { mb: 5, display: "flex", alignItems: "center" }, children: [_jsx(Typography, { variant: "h4", sx: { flexGrow: 1 }, children: "Cartes RFID" }), _jsx(Button, { variant: "contained", color: "inherit", startIcon: _jsx(Iconify, { icon: "mingcute:add-line" }), onClick: () => {
                            setFormData({});
                            setMode("single");
                            setOpenDialog(true);
                        }, children: "Ajouter une carte RFID" })] }), _jsx(Card, { sx: { p: 2, mb: 3 }, children: _jsxs(Box, { sx: { display: "flex", gap: 2, flexWrap: "wrap" }, children: [_jsx(TextField, { label: "Code UID", value: searchCode, onChange: (e) => setSearchCode(e.target.value), size: "small" }), _jsx(TextField, { label: "T\u00E9l\u00E9phone", value: searchTel, onChange: (e) => setSearchTel(e.target.value), size: "small" }), _jsxs(Select, { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), displayEmpty: true, size: "small", children: [_jsx(MenuItem, { value: "", children: "Tous" }), _jsx(MenuItem, { value: "true", children: "Actifs" }), _jsx(MenuItem, { value: "false", children: "D\u00E9sactiv\u00E9s" })] }), _jsx(Button, { variant: "outlined", onClick: () => {
                                setSearchCode("");
                                setSearchTel("");
                                setStatusFilter("");
                            }, children: "R\u00E9initialiser" })] }) }), _jsx(Grid, { container: true, spacing: 2, children: loading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', width: '100%', p: 3 }, children: _jsx(CircularProgress, {}) })) : rfids.length > 0 ? (rfids.map((rfid) => (_jsx(Grid, { size: { xs: 12, sm: 6, md: 4, lg: 3 }, children: _jsxs(Card, { sx: { p: 2, display: "flex", flexDirection: "column", gap: 1.5 }, children: [_jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [_jsx(Typography, { variant: "subtitle1", fontWeight: "bold", children: rfid.code_uid }), _jsx(IconButton, { onClick: (e) => handleMenuOpen(e, rfid), size: "small", children: _jsx(Iconify, { icon: "eva:more-vertical-fill" }) })] }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["T\u00E9l:  ", rfid.telephone || "Non attribué"] }), _jsxs(Box, { sx: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: (rfid.solde_litres || 0) > 0 ? 'success.light' : 'grey.50'
                                }, children: [_jsx(Typography, { variant: "body2", fontWeight: "medium", children: "Solde litres:" }), _jsxs(Typography, { variant: "body2", sx: {
                                            fontWeight: 'bold',
                                            color: (rfid.solde_litres || 0) > 0 ? 'success.dark' : 'text.secondary'
                                        }, children: [rfid.solde_litres || 0, " L"] })] }), _jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: new Date(rfid.created_at).toLocaleDateString() }), _jsxs(Typography, { variant: "caption", fontWeight: "medium", children: [rfid.prix, " \u20AC"] })] }), _jsx(Box, { children: rfid.active ? (_jsx("span", { className: "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium", children: "Actif" })) : (_jsx("span", { className: "bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium", children: "D\u00E9sactiv\u00E9" })) })] }) }, rfid.id)))) : (_jsx(Typography, { sx: { p: 3 }, children: "Aucune carte RFID trouv\u00E9e" })) }), _jsx(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, children: _jsxs(MenuList, { children: [_jsx(MenuItemMui, { onClick: () => {
                                setFormData(selectedRfid || {});
                                setOpenDialog(true);
                                handleMenuClose();
                                setMode("single");
                            }, children: "Configurer" }), _jsx(MenuItemMui, { onClick: () => {
                                if (selectedRfid)
                                    handleToggleActivation(selectedRfid.code_uid);
                                handleMenuClose();
                            }, children: selectedRfid?.active ? "Désactiver" : "Activer" })] }) }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), fullWidth: true, maxWidth: "sm", children: [_jsx(DialogTitle, { children: formData.id ? "Éditer la carte RFID" : "Nouvelle carte RFID" }), _jsxs(DialogContent, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [_jsxs(Tabs, { value: mode, onChange: (e, v) => setMode(v), children: [_jsx(Tab, { label: "Simple", value: "single" }), !formData.id && _jsx(Tab, { label: "Multiple", value: "multiple" }), !formData.id && _jsx(Tab, { label: "Auto", value: "auto" })] }), mode === "single" && (_jsxs(_Fragment, { children: [_jsx(TextField, { label: "Code UID", value: formData.code_uid || "", onChange: (e) => setFormData({ ...formData, code_uid: e.target.value }), fullWidth: true }), _jsx(TextField, { label: "T\u00E9l\u00E9phone", value: formData.telephone || "", onChange: (e) => setFormData({ ...formData, telephone: e.target.value }), fullWidth: true })] })), !formData.id && (_jsxs(_Fragment, { children: [mode === "multiple" && (_jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [(formData.list || []).map((item, index) => (_jsxs(Box, { sx: { display: "flex", gap: 2, alignItems: "center" }, children: [_jsx(TextField, { label: "Code UID", value: item.code_uid || "", onChange: (e) => {
                                                            const newList = [...(formData.list || [])];
                                                            newList[index] = { ...newList[index], code_uid: e.target.value };
                                                            setFormData({ ...formData, list: newList });
                                                        }, fullWidth: true }), _jsx(TextField, { label: "T\u00E9l\u00E9phone", value: item.telephone || "", onChange: (e) => {
                                                            const newList = [...(formData.list || [])];
                                                            newList[index] = { ...newList[index], telephone: e.target.value };
                                                            setFormData({ ...formData, list: newList });
                                                        }, fullWidth: true }), _jsx(IconButton, { color: "error", onClick: () => {
                                                            const newList = [...(formData.list || [])];
                                                            newList.splice(index, 1);
                                                            setFormData({ ...formData, list: newList });
                                                        }, children: _jsx(Iconify, { icon: "solar:trash-bin-trash-bold" }) })] }, index))), _jsx(Button, { variant: "outlined", size: "small", onClick: () => setFormData({
                                                    ...formData,
                                                    list: [...(formData.list || []), { code_uid: "", telephone: "" }],
                                                }), children: "+ Ajouter une carte" })] })), mode === "auto" && (_jsx(TextField, { label: "Nombre de cartes", type: "number", value: formData.nombre || 1, onChange: (e) => setFormData({ ...formData, nombre: Number(e.target.value) }), fullWidth: true }))] }))] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpenDialog(false), children: "Annuler" }), _jsx(Button, { variant: "contained", onClick: handleSave, children: "Enregistrer" })] })] })] }));
}
