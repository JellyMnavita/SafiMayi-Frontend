import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Card, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Pagination, CircularProgress, Grid, MenuItem, Select, InputLabel, FormControl, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Tabs, Tab } from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";
export function VenteView() {
    const [ventes, setVentes] = useState([]);
    const [stats, setStats] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    // ✅ Ajout du champ "type" par défaut
    const [ventesForm, setVentesForm] = useState([
        { type: "compteur", compteur: "", rfid: "", acheteur: "", quantite: 1, prix_unitaire: "", mode_paiement: "cash" }
    ]);
    const [compteurs, setCompteurs] = useState([]);
    const [rfids, setRfids] = useState([]);
    const [clients, setClients] = useState([]);
    const fetchVentes = async (pageNumber = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axios.get(`https://safimayi-backend.onrender.com/api/ventes/stats-journal/?page=${pageNumber}`, { headers: { Authorization: `Bearer ${token}` } });
            setVentes(res.data.results);
            setStats(res.data.stats);
            setTotalPages(Math.ceil(res.data.count / 10));
        }
        catch (err) {
            console.error("Erreur lors du fetch des ventes :", err);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchClients = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("https://safimayi-backend.onrender.com/api/users/create-list/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setClients(res.data);
        }
        catch (err) {
            console.error("Erreur lors du fetch des clients :", err);
        }
    };
    const fetchCompteursEtRfids = async () => {
        try {
            const token = localStorage.getItem("token");
            const [compteursRes, rfidsRes] = await Promise.all([
                axios.get("https://safimayi-backend.onrender.com/api/compteur/inactifs/", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get("https://safimayi-backend.onrender.com/api/rfid/", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            setCompteurs(compteursRes.data);
            setRfids(rfidsRes.data);
        }
        catch (err) {
            console.error("Erreur lors du fetch des compteurs ou RFID :", err);
        }
    };
    useEffect(() => {
        fetchVentes(page);
        fetchCompteursEtRfids();
        fetchClients();
    }, [page]);
    const addVenteRow = () => {
        setVentesForm([
            ...ventesForm,
            { type: "compteur", compteur: "", rfid: "", acheteur: "", quantite: 1, prix_unitaire: "", mode_paiement: "cash" }
        ]);
    };
    const handleChange = (index, field, value) => {
        const newVentes = [...ventesForm];
        newVentes[index][field] = value;
        setVentesForm(newVentes);
    };
    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`https://safimayi-backend.onrender.com/api/ventes/create/`, ventesForm, { headers: { Authorization: `Bearer ${token}` } });
            setOpenDialog(false);
            setVentesForm([{ type: "compteur", compteur: "", rfid: "", acheteur: "", quantite: 1, prix_unitaire: "", mode_paiement: "cash" }]);
            fetchVentes(page);
        }
        catch (error) {
            console.error("Erreur lors de la création :", error);
        }
    };
    return (_jsxs(DashboardContent, { children: [_jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 3, flexWrap: "wrap" }, children: [_jsx(Typography, { variant: "h4", children: "Journal des ventes" }), _jsx(Button, { variant: "contained", color: "inherit", startIcon: _jsx(Iconify, { icon: "mingcute:add-line" }), onClick: () => setOpenDialog(true), children: "Nouvelle vente" })] }), loading ? (_jsx(Box, { sx: { display: "flex", justifyContent: "center", mt: 5 }, children: _jsx(CircularProgress, {}) })) : (_jsxs(_Fragment, { children: [stats && (_jsxs(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [_jsx(Grid, { sx: { flex: '1 1 20%', minWidth: 200 }, children: _jsxs(Card, { sx: { p: 2, textAlign: "center" }, children: [_jsx(Typography, { children: "Total ventes" }), _jsx(Typography, { variant: "h5", children: stats.total_ventes })] }) }), _jsx(Grid, { sx: { flex: '1 1 20%', minWidth: 200 }, children: _jsxs(Card, { sx: { p: 2, textAlign: "center" }, children: [_jsx(Typography, { children: "Montant total" }), _jsxs(Typography, { variant: "h5", children: [stats.montant_total, " FC"] })] }) }), _jsx(Grid, { sx: { flex: '1 1 20%', minWidth: 200 }, children: _jsxs(Card, { sx: { p: 2, textAlign: "center" }, children: [_jsx(Typography, { children: "Par RFID" }), _jsx(Typography, { variant: "h5", children: stats.ventes_rfid })] }) }), _jsx(Grid, { sx: { flex: '1 1 20%', minWidth: 200 }, children: _jsxs(Card, { sx: { p: 2, textAlign: "center" }, children: [_jsx(Typography, { children: "Par Compteur" }), _jsx(Typography, { variant: "h5", children: stats.ventes_compteur })] }) })] })), _jsxs(Card, { sx: { p: 2 }, children: [_jsx(TableContainer, { children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Produit" }), _jsx(TableCell, { children: "Quantit\u00E9" }), _jsx(TableCell, { children: "Prix unitaire" }), _jsx(TableCell, { children: "Montant" }), _jsx(TableCell, { children: "Paiement" }), _jsx(TableCell, { children: "Client" }), _jsx(TableCell, { children: "Date" })] }) }), _jsx(TableBody, { children: ventes.length > 0 ? (ventes.map((v) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: v.produit }), _jsx(TableCell, { children: v.quantite }), _jsxs(TableCell, { children: [v.prix_unitaire, " FC"] }), _jsxs(TableCell, { children: [v.montant_total, " FC"] }), _jsx(TableCell, { children: v.mode_paiement }), _jsx(TableCell, { children: v.acheteur }), _jsx(TableCell, { children: new Date(v.date_vente).toLocaleString() })] }, v.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, align: "center", children: "Aucune vente trouv\u00E9e" }) })) })] }) }), _jsx(Box, { sx: { display: "flex", justifyContent: "center", mt: 2 }, children: _jsx(Pagination, { count: totalPages, page: page, onChange: (_, value) => setPage(value), color: "primary" }) })] })] })), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), fullWidth: true, maxWidth: "md", children: [_jsx(DialogTitle, { children: "Nouvelle vente" }), _jsxs(DialogContent, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [ventesForm.map((vente, index) => (_jsxs(Box, { sx: { border: "1px solid #ccc", p: 2, borderRadius: 2, mb: 2 }, children: [_jsxs(Tabs, { value: vente.type, onChange: (_, v) => handleChange(index, "type", v), sx: { width: "100%", mb: 2 }, children: [_jsx(Tab, { label: "Vente Compteur", value: "compteur" }), _jsx(Tab, { label: "Vente RFID", value: "rfid" })] }), vente.type === "compteur" && (_jsxs(_Fragment, { children: [_jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { id: `compteur-label-${index}`, children: "Compteur" }), _jsx(Select, { labelId: `compteur-label-${index}`, label: "Compteur", value: vente.compteur, onChange: (e) => handleChange(index, "compteur", e.target.value), children: compteurs.map((c) => (_jsxs(MenuItem, { value: c.id, children: [c.nom, " (", c.code_serie, ")"] }, c.id))) })] }), _jsxs(FormControl, { fullWidth: true, sx: { mt: 2 }, children: [_jsx(InputLabel, { id: `client-label-${index}`, children: "Client" }), _jsx(Select, { labelId: `client-label-${index}`, label: "Client", value: vente.acheteur, onChange: (e) => handleChange(index, "acheteur", e.target.value), required: true, children: clients.map((c) => (_jsxs(MenuItem, { value: c.id, children: [c.nom, " - ", c.email] }, c.id))) })] })] })), vente.type === "rfid" && (_jsxs(_Fragment, { children: [_jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { id: `rfid-label-${index}`, children: "Carte RFID" }), _jsx(Select, { labelId: `rfid-label-${index}`, label: "Carte RFID", value: vente.rfid, onChange: (e) => handleChange(index, "rfid", e.target.value), children: rfids.map((r) => (_jsxs(MenuItem, { value: r.id, children: [r.code_uid, " (", r.telephone || "Anonyme", ")"] }, r.id))) })] }), _jsxs(FormControl, { fullWidth: true, sx: { mt: 2 }, children: [_jsx(InputLabel, { id: `client-label-${index}`, children: "Client (optionnel)" }), _jsxs(Select, { labelId: `client-label-${index}`, label: "Client (optionnel)", value: vente.acheteur, onChange: (e) => handleChange(index, "acheteur", e.target.value), children: [_jsx(MenuItem, { value: "", children: "\u2014 Aucun \u2014" }), clients.map((c) => (_jsxs(MenuItem, { value: c.id, children: [c.nom, " - ", c.email] }, c.id)))] })] })] })), _jsx(TextField, { label: "Prix", type: "number", fullWidth: true, sx: { mt: 2 }, value: vente.prix_unitaire, onChange: (e) => handleChange(index, "prix_unitaire", e.target.value) }), _jsxs(FormControl, { fullWidth: true, sx: { mt: 2 }, children: [_jsx(InputLabel, { id: `mode-paiement-label-${index}`, children: "Mode de paiement" }), _jsxs(Select, { labelId: `mode-paiement-label-${index}`, label: "Mode de paiement", value: vente.mode_paiement, onChange: (e) => handleChange(index, "mode_paiement", e.target.value), children: [_jsx(MenuItem, { value: "cash", children: "Esp\u00E8ces" }), _jsx(MenuItem, { value: "mobile_money", children: "Mobile Money" }), _jsx(MenuItem, { value: "carte", children: "Carte Bancaire" })] })] })] }, index))), _jsx(Button, { variant: "outlined", onClick: addVenteRow, children: "Ajouter une autre vente" })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpenDialog(false), children: "Annuler" }), _jsx(Button, { variant: "contained", onClick: handleSave, children: "Enregistrer" })] })] })] }));
}
