import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import apiClient from "../../../utils/api";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress, Pagination, IconButton, Menu, MenuList, MenuItem as MenuItemMui, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tabs, Tab } from "@mui/material";
import { DashboardContent } from "../../../layouts/dashboard";
import { Iconify } from "../../../components/iconify";
import { AnalyticsWidgetSummary } from "../analytics-widget-summary";
import useMediaQuery from '@mui/material/useMediaQuery';
// Fonctions de garde de type
const isRecharge = (item) => {
    return item && 'Litre' in item && 'Moyen' in item;
};
const isPaiement = (item) => {
    return item && 'montant' in item && 'operateur' in item;
};
const isConsommation = (item) => {
    return item && 'compteur_nom' in item && 'litres' in item;
};
export function JournauxView() {
    const [activeTab, setActiveTab] = useState(0);
    const isMobile = useMediaQuery('(max-width:768px)');
    const isTablet = useMediaQuery('(max-width:1200px)');
    // États pour les recharges
    const [allRecharges, setAllRecharges] = useState([]);
    const [recharges, setRecharges] = useState([]);
    const [loadingRecharges, setLoadingRecharges] = useState(true);
    // États pour les paiements
    const [allPaiements, setAllPaiements] = useState([]);
    const [paiements, setPaiements] = useState([]);
    const [loadingPaiements, setLoadingPaiements] = useState(true);
    const [statsPaiements, setStatsPaiements] = useState({});
    // États pour les consommations
    const [allConsommations, setAllConsommations] = useState([]);
    const [consommations, setConsommations] = useState([]);
    const [loadingConsommations, setLoadingConsommations] = useState(true);
    const [statsConsommations, setStatsConsommations] = useState({});
    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    // Filtres communs
    const [searchUtilisateur, setSearchUtilisateur] = useState("");
    const [searchTelephone, setSearchTelephone] = useState("");
    // Filtres spécifiques aux recharges
    const [moyenFilter, setMoyenFilter] = useState("");
    // Filtres spécifiques aux paiements
    const [statutFilter, setStatutFilter] = useState("");
    const [operateurFilter, setOperateurFilter] = useState("");
    const [searchRFID, setSearchRFID] = useState("");
    // Filtres spécifiques aux consommations
    const [typeFilter, setTypeFilter] = useState("");
    const [searchCompteur, setSearchCompteur] = useState("");
    const [searchAccessCode, setSearchAccessCode] = useState("");
    // Menu actions
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemType, setItemType] = useState(null);
    // Dialog pour voir les détails
    const [openDialog, setOpenDialog] = useState(false);
    // Configuration du Slider
    const sliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: isMobile ? 1 : isTablet ? 2 : 4,
        slidesToScroll: 1,
        arrows: !isMobile,
        adaptiveHeight: true,
        centerMode: false,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 2,
                    arrows: true,
                    dots: true
                },
            },
            {
                breakpoint: 900,
                settings: {
                    slidesToShow: 2,
                    arrows: false,
                    dots: true
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    arrows: false,
                    dots: true
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    arrows: false,
                    dots: true
                },
            },
        ],
    };
    const handleMenuOpen = (event, item, type) => {
        setAnchorEl(event.currentTarget);
        setSelectedItem(item);
        setItemType(type);
    };
    const handleMenuClose = () => setAnchorEl(null);
    // Charger les recharges
    const fetchRecharges = async () => {
        try {
            setLoadingRecharges(true);
            const response = await apiClient.get(`/api/litrages/all-recharges/`);
            setAllRecharges(response.data);
            setRecharges(response.data);
        }
        catch (error) {
            console.error("Erreur lors du chargement des recharges :", error);
        }
        finally {
            setLoadingRecharges(false);
        }
    };
    // Charger les paiements
    const fetchPaiements = async () => {
        try {
            setLoadingPaiements(true);
            const response = await apiClient.get(`/api/paiements/all/`);
            setAllPaiements(response.data.paiements);
            setPaiements(response.data.paiements);
            setStatsPaiements(response.data.statistiques || {});
        }
        catch (error) {
            console.error("Erreur lors du chargement des paiements :", error);
        }
        finally {
            setLoadingPaiements(false);
        }
    };
    // Charger les consommations
    const fetchConsommations = async () => {
        try {
            setLoadingConsommations(true);
            const response = await apiClient.get(`/api/litrages/all-consommations/`);
            setAllConsommations(response.data);
            setConsommations(response.data);
            // Calculer les statistiques des consommations
            const totalConsommations = response.data.length;
            const totalLitres = Math.round(response.data.reduce((sum, c) => sum + c.litres, 0));
            const rfidCount = response.data.filter((c) => c.type === "RFID").length;
            const accessCodeCount = response.data.filter((c) => c.type === "Code d'accès").length;
            setStatsConsommations({
                total: totalConsommations,
                total_litres: totalLitres,
                rfid_count: rfidCount,
                access_code_count: accessCodeCount
            });
        }
        catch (error) {
            console.error("Erreur lors du chargement des consommations :", error);
        }
        finally {
            setLoadingConsommations(false);
        }
    };
    useEffect(() => {
        if (activeTab === 0) {
            fetchRecharges();
        }
        else if (activeTab === 1) {
            fetchPaiements();
        }
        else if (activeTab === 2) {
            fetchConsommations();
        }
    }, [activeTab]);
    // Filtrage local des recharges
    useEffect(() => {
        let filtered = [...allRecharges];
        if (searchUtilisateur) {
            filtered = filtered.filter((r) => r.Utilisateur.toLowerCase().includes(searchUtilisateur.toLowerCase()));
        }
        if (searchTelephone) {
            filtered = filtered.filter((r) => r.Telephone.toLowerCase().includes(searchTelephone.toLowerCase()));
        }
        if (moyenFilter) {
            filtered = filtered.filter((r) => r.Moyen.toLowerCase() === moyenFilter.toLowerCase());
        }
        setRecharges(filtered);
        setPage(1);
    }, [searchUtilisateur, searchTelephone, moyenFilter, allRecharges]);
    // Filtrage local des paiements
    useEffect(() => {
        let filtered = [...allPaiements];
        if (searchUtilisateur) {
            filtered = filtered.filter((p) => p.utilisateur_nom && p.utilisateur_nom.toLowerCase().includes(searchUtilisateur.toLowerCase()));
        }
        if (searchTelephone) {
            filtered = filtered.filter((p) => p.telephone.toLowerCase().includes(searchTelephone.toLowerCase()));
        }
        if (statutFilter) {
            filtered = filtered.filter((p) => p.statut === statutFilter);
        }
        if (operateurFilter) {
            filtered = filtered.filter((p) => p.operateur === operateurFilter);
        }
        if (searchRFID) {
            filtered = filtered.filter((p) => p.rfid_uid && p.rfid_uid.toLowerCase().includes(searchRFID.toLowerCase()));
        }
        setPaiements(filtered);
        setPage(1);
    }, [searchUtilisateur, searchTelephone, statutFilter, operateurFilter, searchRFID, allPaiements]);
    // Filtrage local des consommations
    useEffect(() => {
        let filtered = [...allConsommations];
        if (searchUtilisateur) {
            filtered = filtered.filter((c) => c.utilisateur_nom && c.utilisateur_nom.toLowerCase().includes(searchUtilisateur.toLowerCase()));
        }
        if (searchTelephone) {
            filtered = filtered.filter((c) => c.utilisateur_telephone && c.utilisateur_telephone.includes(searchTelephone));
        }
        if (typeFilter) {
            filtered = filtered.filter((c) => c.type === typeFilter);
        }
        if (searchCompteur) {
            filtered = filtered.filter((c) => c.compteur_nom.toLowerCase().includes(searchCompteur.toLowerCase()) ||
                c.compteur_code_serie.toLowerCase().includes(searchCompteur.toLowerCase()));
        }
        if (searchRFID) {
            filtered = filtered.filter((c) => c.rfid_uid && c.rfid_uid.toLowerCase().includes(searchRFID.toLowerCase()));
        }
        if (searchAccessCode) {
            filtered = filtered.filter((c) => c.access_code && c.access_code.toLowerCase().includes(searchAccessCode.toLowerCase()));
        }
        setConsommations(filtered);
        setPage(1);
    }, [searchUtilisateur, searchTelephone, typeFilter, searchCompteur, searchRFID, searchAccessCode, allConsommations]);
    // Pagination locale
    const getPaginatedData = () => {
        if (activeTab === 0) {
            return recharges.slice((page - 1) * pageSize, page * pageSize);
        }
        else if (activeTab === 1) {
            return paiements.slice((page - 1) * pageSize, page * pageSize);
        }
        else {
            return consommations.slice((page - 1) * pageSize, page * pageSize);
        }
    };
    const paginatedData = getPaginatedData();
    const totalItems = activeTab === 0 ? recharges.length : activeTab === 1 ? paiements.length : consommations.length;
    // Formater la date pour l'affichage
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return "Date invalide";
            }
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        catch (error) {
            return "Date invalide";
        }
    };
    // Obtenir la couleur du statut
    const getStatusColor = (statut) => {
        switch (statut) {
            case 'success': return 'success';
            case 'pending': return 'warning';
            case 'failed': return 'error';
            default: return 'default';
        }
    };
    // Obtenir le texte du statut
    const getStatusText = (statut) => {
        switch (statut) {
            case 'success': return 'Réussi';
            case 'pending': return 'En attente';
            case 'failed': return 'Échoué';
            default: return statut;
        }
    };
    // Obtenir la couleur du type
    const getTypeColor = (type) => {
        switch (type) {
            case 'RFID': return 'primary';
            case "Code d'accès": return 'secondary';
            default: return 'default';
        }
    };
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setPage(1);
        // Réinitialiser les filtres spécifiques
        setMoyenFilter("");
        setStatutFilter("");
        setOperateurFilter("");
        setTypeFilter("");
        setSearchRFID("");
        setSearchAccessCode("");
        setSearchCompteur("");
    };
    const resetAllFilters = () => {
        setSearchUtilisateur("");
        setSearchTelephone("");
        setMoyenFilter("");
        setStatutFilter("");
        setOperateurFilter("");
        setTypeFilter("");
        setSearchRFID("");
        setSearchAccessCode("");
        setSearchCompteur("");
    };
    const refreshData = () => {
        if (activeTab === 0) {
            fetchRecharges();
        }
        else if (activeTab === 1) {
            fetchPaiements();
        }
        else if (activeTab === 2) {
            fetchConsommations();
        }
    };
    return (_jsxs(DashboardContent, { children: [_jsxs(Box, { sx: { mb: 3, display: "flex", alignItems: "center" }, children: [_jsx(Typography, { variant: "h4", sx: { flexGrow: 1 }, children: "Journaux" }), _jsx(Button, { variant: "contained", color: "inherit", startIcon: _jsx(Iconify, { icon: "solar:restart-bold" }), onClick: refreshData, children: "Actualiser" })] }), _jsx(Card, { sx: { mb: 3 }, children: _jsxs(Tabs, { value: activeTab, onChange: handleTabChange, centered: true, children: [_jsx(Tab, { label: "Journal des Recharges" }), _jsx(Tab, { label: "Journal des Paiements" }), _jsx(Tab, { label: "Journal des Consommations" })] }) }), _jsx(Card, { sx: { p: 2, mb: 3 }, children: _jsxs(Box, { sx: { display: "flex", gap: 2, flexWrap: "wrap" }, children: [_jsx(TextField, { label: "Utilisateur", value: searchUtilisateur, onChange: (e) => setSearchUtilisateur(e.target.value), size: "small" }), _jsx(TextField, { label: "T\u00E9l\u00E9phone", value: searchTelephone, onChange: (e) => setSearchTelephone(e.target.value), size: "small" }), activeTab === 0 ? (_jsxs(Select, { value: moyenFilter, onChange: (e) => setMoyenFilter(e.target.value), displayEmpty: true, size: "small", children: [_jsx(MenuItem, { value: "", children: "Tous les moyens" }), _jsx(MenuItem, { value: "mobile", children: "Mobile" })] })) : activeTab === 1 ? (_jsxs(_Fragment, { children: [_jsxs(Select, { value: statutFilter, onChange: (e) => setStatutFilter(e.target.value), displayEmpty: true, size: "small", children: [_jsx(MenuItem, { value: "", children: "Tous les statuts" }), _jsx(MenuItem, { value: "success", children: "R\u00E9ussi" }), _jsx(MenuItem, { value: "pending", children: "En attente" }), _jsx(MenuItem, { value: "failed", children: "\u00C9chou\u00E9" })] }), _jsxs(Select, { value: operateurFilter, onChange: (e) => setOperateurFilter(e.target.value), displayEmpty: true, size: "small", children: [_jsx(MenuItem, { value: "", children: "Tous les op\u00E9rateurs" }), _jsx(MenuItem, { value: "mpesa", children: "M-Pesa" }), _jsx(MenuItem, { value: "airtel", children: "Airtel Money" }), _jsx(MenuItem, { value: "orange", children: "Orange Money" })] }), _jsx(TextField, { label: "Carte RFID", value: searchRFID, onChange: (e) => setSearchRFID(e.target.value), size: "small" })] })) : (_jsxs(_Fragment, { children: [_jsxs(Select, { value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), displayEmpty: true, size: "small", children: [_jsx(MenuItem, { value: "", children: "Tous les types" }), _jsx(MenuItem, { value: "RFID", children: "RFID" }), _jsx(MenuItem, { value: "Code d'acc\u00E8s", children: "Code d'Acc\u00E8s" })] }), _jsx(TextField, { label: "Compteur", value: searchCompteur, onChange: (e) => setSearchCompteur(e.target.value), size: "small" }), _jsx(TextField, { label: "Carte RFID", value: searchRFID, onChange: (e) => setSearchRFID(e.target.value), size: "small" }), _jsx(TextField, { label: "Code d'Acc\u00E8s", value: searchAccessCode, onChange: (e) => setSearchAccessCode(e.target.value), size: "small" })] })), _jsx(Button, { variant: "outlined", onClick: resetAllFilters, children: "R\u00E9initialiser" })] }) }), (activeTab === 1 || activeTab === 2) && (_jsx(Box, { sx: {
                    mb: 3,
                    '& .slick-slide': {
                        display: 'flex',
                        justifyContent: 'center'
                    },
                    '& .slick-list': {
                        margin: '0 -8px'
                    },
                    '& .slick-slide > div': {
                        padding: '0 8px',
                        width: '100%'
                    }
                }, children: activeTab === 1 ? (_jsxs(Slider, { ...sliderSettings, children: [_jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Montant Total", total: statsPaiements.montant_total || 0, color: "primary", suffix: " FC", isCurrency: true, icon: _jsx("img", { alt: "Revenue", src: "/assets/icons/glass/ic-glass-buy.svg" }), sx: { height: '100%' } }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Paiements R\u00E9ussis", total: statsPaiements.reussis || 0, color: "success", icon: _jsx("img", { alt: "RFID", src: "/assets/icons/glass/ic-glass-users.svg" }), sx: { height: '100%' } }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "En Attente", total: statsPaiements.en_attente || 0, color: "warning", icon: _jsx("img", { alt: "Water", src: "/assets/icons/glass/ic-glass-message.svg" }), sx: { height: '100%' } }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "\u00C9chou\u00E9s", total: statsPaiements.echecs || 0, color: "error", icon: _jsx("img", { alt: "Total", src: "/assets/icons/glass/ic-glass-bag.svg" }), sx: { height: '100%' } }) })] })) : (_jsxs(Slider, { ...sliderSettings, children: [_jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Total Consommations", total: statsConsommations.total || 0, color: "primary", icon: _jsx("img", { alt: "Total", src: "/assets/icons/glass/ic-glass-bag.svg" }), sx: { height: '100%' } }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Litres Total", total: statsConsommations.total_litres || 0, color: "success", suffix: " L", icon: _jsx("img", { alt: "Water", src: "/assets/icons/glass/ic-glass-message.svg" }), sx: { height: '100%' } }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Consommations RFID", total: statsConsommations.rfid_count || 0, color: "info", icon: _jsx("img", { alt: "RFID", src: "/assets/icons/glass/ic-glass-users.svg" }), sx: { height: '100%' } }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Codes d'Acc\u00E8s", total: statsConsommations.access_code_count || 0, color: "warning", icon: _jsx("img", { alt: "Revenue", src: "/assets/icons/glass/ic-glass-buy.svg" }), sx: { height: '100%' } }) })] })) })), _jsx(Card, { children: _jsx("div", { className: "p-4 bg-white shadow-md rounded-md overflow-x-auto", children: ((activeTab === 0 && loadingRecharges) || (activeTab === 1 && loadingPaiements) || (activeTab === 2 && loadingConsommations)) ? (_jsx("div", { className: "flex justify-center items-center py-10", children: _jsx(CircularProgress, {}) })) : (_jsxs(_Fragment, { children: [activeTab === 0 ? (_jsxs("table", { className: "w-full border-collapse min-w-[800px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100 text-left text-sm", children: [_jsx("th", { className: "p-2 border-b", children: "Date" }), _jsx("th", { className: "p-2 border-b", children: "Utilisateur" }), _jsx("th", { className: "p-2 border-b", children: "T\u00E9l\u00E9phone" }), _jsx("th", { className: "p-2 border-b", children: "Carte RFID" }), _jsx("th", { className: "p-2 border-b", children: "Litres" }), _jsx("th", { className: "p-2 border-b", children: "Moyen" }), _jsx("th", { className: "p-2 border-b text-center", children: "Actions" })] }) }), _jsx("tbody", { children: paginatedData.length > 0 ? (paginatedData.map((item, index) => {
                                            if (isRecharge(item)) {
                                                const recharge = item;
                                                return (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "p-2 border-b", children: formatDate(recharge.Date) }), _jsx("td", { className: "p-2 border-b", children: recharge.Utilisateur }), _jsx("td", { className: "p-2 border-b", children: recharge.Telephone }), _jsx("td", { className: "p-2 border-b", children: recharge["Carte RFID"] || "-" }), _jsxs("td", { className: "p-2 border-b", children: [recharge.Litre.toFixed(1), " L"] }), _jsx("td", { className: "p-2 border-b", children: _jsx("span", { className: "bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium", children: recharge.Moyen }) }), _jsx("td", { className: "p-2 border-b text-center", children: _jsx(IconButton, { onClick: (e) => handleMenuOpen(e, recharge, 'recharge'), children: _jsx(Iconify, { icon: "eva:more-vertical-fill" }) }) })] }, index));
                                            }
                                            return null;
                                        })) : (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center text-gray-500 py-6", children: "Aucune recharge trouv\u00E9e" }) })) })] })) : activeTab === 1 ? (_jsxs("table", { className: "w-full border-collapse min-w-[1100px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100 text-left text-sm", children: [_jsx("th", { className: "p-2 border-b", children: "Date" }), _jsx("th", { className: "p-2 border-b", children: "Utilisateur" }), _jsx("th", { className: "p-2 border-b", children: "T\u00E9l\u00E9phone" }), _jsx("th", { className: "p-2 border-b", children: "Carte RFID" }), _jsx("th", { className: "p-2 border-b", children: "Op\u00E9rateur" }), _jsx("th", { className: "p-2 border-b", children: "Montant" }), _jsx("th", { className: "p-2 border-b", children: "Litres" }), _jsx("th", { className: "p-2 border-b", children: "Statut" }), _jsx("th", { className: "p-2 border-b", children: "Transaction ID" }), _jsx("th", { className: "p-2 border-b text-center", children: "Actions" })] }) }), _jsx("tbody", { children: paginatedData.length > 0 ? (paginatedData.map((item) => {
                                            if (isPaiement(item)) {
                                                const paiement = item;
                                                return (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "p-2 border-b", children: formatDate(paiement.created_at) }), _jsxs("td", { className: "p-2 border-b", children: [paiement.utilisateur_nom || 'N/A', paiement.utilisateur_email && (_jsx("div", { className: "text-xs text-gray-500", children: paiement.utilisateur_email }))] }), _jsx("td", { className: "p-2 border-b", children: paiement.telephone }), _jsx("td", { className: "p-2 border-b", children: paiement.rfid_uid || 'Aucune' }), _jsx("td", { className: "p-2 border-b", children: paiement.operateur }), _jsxs("td", { className: "p-2 border-b", children: [paiement.montant, " FC"] }), _jsxs("td", { className: "p-2 border-b", children: [paiement.litres_credite, " L"] }), _jsx("td", { className: "p-2 border-b", children: _jsx(Chip, { label: getStatusText(paiement.statut), color: getStatusColor(paiement.statut), size: "small" }) }), _jsx("td", { className: "p-2 border-b", children: paiement.id_transaction_ext }), _jsx("td", { className: "p-2 border-b text-center", children: _jsx(IconButton, { onClick: (e) => handleMenuOpen(e, paiement, 'paiement'), children: _jsx(Iconify, { icon: "eva:more-vertical-fill" }) }) })] }, paiement.id));
                                            }
                                            return null;
                                        })) : (_jsx("tr", { children: _jsx("td", { colSpan: 10, className: "text-center text-gray-500 py-6", children: "Aucun paiement trouv\u00E9" }) })) })] })) : (_jsxs("table", { className: "w-full border-collapse min-w-[1300px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100 text-left text-sm", children: [_jsx("th", { className: "p-2 border-b", children: "ID" }), _jsx("th", { className: "p-2 border-b", children: "Date" }), _jsx("th", { className: "p-2 border-b", children: "Compteur" }), _jsx("th", { className: "p-2 border-b", children: "Litres" }), _jsx("th", { className: "p-2 border-b", children: "Type" }), _jsx("th", { className: "p-2 border-b", children: "Utilisateur" }), _jsx("th", { className: "p-2 border-b", children: "T\u00E9l\u00E9phone" }), _jsx("th", { className: "p-2 border-b", children: "Code Acc\u00E8s" }), _jsx("th", { className: "p-2 border-b", children: "UID RFID" }), _jsx("th", { className: "p-2 border-b text-center", children: "Actions" })] }) }), _jsx("tbody", { children: paginatedData.length > 0 ? (paginatedData.map((item) => {
                                            if (isConsommation(item)) {
                                                const consommation = item;
                                                return (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "p-2 border-b", children: consommation.id }), _jsx("td", { className: "p-2 border-b", children: formatDate(consommation.date) }), _jsxs("td", { className: "p-2 border-b", children: [consommation.compteur_nom, _jsx("div", { className: "text-xs text-gray-500", children: consommation.compteur_code_serie })] }), _jsxs("td", { className: "p-2 border-b", children: [consommation.litres, " L"] }), _jsx("td", { className: "p-2 border-b", children: _jsx(Chip, { label: consommation.type, color: getTypeColor(consommation.type), size: "small" }) }), _jsxs("td", { className: "p-2 border-b", children: [consommation.utilisateur_nom || "Anonyme", consommation.utilisateur_email && (_jsx("div", { className: "text-xs text-gray-500", children: consommation.utilisateur_email }))] }), _jsx("td", { className: "p-2 border-b", children: consommation.utilisateur_telephone || "N/A" }), _jsx("td", { className: "p-2 border-b", children: consommation.access_code ? (_jsx(Chip, { label: consommation.access_code, color: consommation.access_code_status === "valide" ? "success" : "default", size: "small" })) : ("N/A") }), _jsx("td", { className: "p-2 border-b", children: consommation.rfid_uid || "N/A" }), _jsx("td", { className: "p-2 border-b text-center", children: _jsx(IconButton, { onClick: (e) => handleMenuOpen(e, consommation, 'consommation'), children: _jsx(Iconify, { icon: "eva:more-vertical-fill" }) }) })] }, consommation.id));
                                            }
                                            return null;
                                        })) : (_jsx("tr", { children: _jsx("td", { colSpan: 10, className: "text-center text-gray-500 py-6", children: "Aucune consommation trouv\u00E9e" }) })) })] })), _jsxs(Box, { sx: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 2,
                                    flexWrap: "wrap",
                                    gap: 2,
                                }, children: [_jsx(Typography, { variant: "body2", children: `Affichage de ${paginatedData.length} sur ${totalItems} ${activeTab === 0 ? 'recharges' :
                                            activeTab === 1 ? 'paiements' :
                                                'consommations'}` }), _jsx(Pagination, { count: Math.ceil(totalItems / pageSize), page: page, onChange: (_, value) => setPage(value), color: "primary" })] })] })) }) }), _jsx(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, children: _jsx(MenuList, { children: _jsx(MenuItemMui, { onClick: () => {
                            setOpenDialog(true);
                            handleMenuClose();
                        }, children: "Voir les d\u00E9tails" }) }) }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), fullWidth: true, maxWidth: "md", children: [_jsxs(DialogTitle, { children: ["D\u00E9tails ", itemType === 'recharge' ? 'de la recharge' : itemType === 'paiement' ? 'du paiement' : 'de la consommation'] }), _jsxs(DialogContent, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [selectedItem && itemType === 'recharge' && isRecharge(selectedItem) && (_jsxs(_Fragment, { children: [_jsxs(Typography, { children: [_jsx("strong", { children: "Date:" }), " ", formatDate(selectedItem.Date)] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Utilisateur:" }), " ", selectedItem.Utilisateur] }), _jsxs(Typography, { children: [_jsx("strong", { children: "T\u00E9l\u00E9phone:" }), " ", selectedItem.Telephone] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Carte RFID:" }), " ", selectedItem["Carte RFID"] || "Non utilisée"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Litres:" }), " ", selectedItem.Litre.toFixed(1), " L"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Moyen de paiement:" }), " ", selectedItem.Moyen] })] })), selectedItem && itemType === 'paiement' && isPaiement(selectedItem) && (_jsxs(_Fragment, { children: [_jsxs(Typography, { children: [_jsx("strong", { children: "Date:" }), " ", formatDate(selectedItem.created_at)] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Utilisateur:" }), " ", selectedItem.utilisateur_nom || 'N/A'] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Email:" }), " ", selectedItem.utilisateur_email || 'N/A'] }), _jsxs(Typography, { children: [_jsx("strong", { children: "T\u00E9l\u00E9phone utilisateur:" }), " ", selectedItem.utilisateur_telephone || 'N/A'] }), _jsxs(Typography, { children: [_jsx("strong", { children: "T\u00E9l\u00E9phone de paiement:" }), " ", selectedItem.telephone] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Carte RFID:" }), " ", selectedItem.rfid_uid || 'Aucune carte'] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Op\u00E9rateur:" }), " ", selectedItem.operateur] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Montant:" }), " ", selectedItem.montant, " FC"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Litres cr\u00E9dit\u00E9s:" }), " ", selectedItem.litres_credite, " L"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Statut:" }), _jsx(Chip, { label: getStatusText(selectedItem.statut), color: getStatusColor(selectedItem.statut), size: "small", sx: { ml: 1 } })] }), _jsxs(Typography, { children: [_jsx("strong", { children: "ID Transaction:" }), " ", selectedItem.id_transaction_ext] }), _jsx(Typography, { children: _jsx("strong", { children: "R\u00E9ponse brute:" }) }), _jsx(Box, { sx: { p: 2, bgcolor: 'grey.100', borderRadius: 1, maxHeight: 200, overflow: 'auto' }, children: _jsx("pre", { children: JSON.stringify(selectedItem.raw_response, null, 2) }) })] })), selectedItem && itemType === 'consommation' && isConsommation(selectedItem) && (_jsxs(_Fragment, { children: [_jsxs(Typography, { children: [_jsx("strong", { children: "ID:" }), " ", selectedItem.id] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Date:" }), " ", formatDate(selectedItem.date)] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Compteur:" }), " ", selectedItem.compteur_nom, " (", selectedItem.compteur_code_serie, ")"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Litres consomm\u00E9s:" }), " ", selectedItem.litres, " L"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Type:" }), _jsx(Chip, { label: selectedItem.type, color: getTypeColor(selectedItem.type), size: "small", sx: { ml: 1 } })] }), _jsx(Typography, { variant: "h6", sx: { mt: 2 }, children: "Informations Utilisateur" }), _jsxs(Typography, { children: [_jsx("strong", { children: "Nom:" }), " ", selectedItem.utilisateur_nom || "Anonyme"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Email:" }), " ", selectedItem.utilisateur_email || "Non disponible"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "T\u00E9l\u00E9phone:" }), " ", selectedItem.utilisateur_telephone || "Non disponible"] }), selectedItem.type === "RFID" ? (_jsxs(_Fragment, { children: [_jsx(Typography, { variant: "h6", sx: { mt: 2 }, children: "Informations RFID" }), _jsxs(Typography, { children: [_jsx("strong", { children: "UID RFID:" }), " ", selectedItem.rfid_uid || "Non disponible"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "T\u00E9l\u00E9phone RFID:" }), " ", selectedItem.rfid_telephone || "Non disponible"] })] })) : (_jsxs(_Fragment, { children: [_jsx(Typography, { variant: "h6", sx: { mt: 2 }, children: "Informations Code d'Acc\u00E8s" }), _jsxs(Typography, { children: [_jsx("strong", { children: "Code:" }), " ", selectedItem.access_code || "Non disponible"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Statut:" }), " ", selectedItem.access_code_status || "Non disponible"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Litres demand\u00E9s:" }), " ", selectedItem.access_code_litres_demandes || 0, " L"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Cr\u00E9\u00E9 le:" }), " ", selectedItem.access_code_created_at ? formatDate(selectedItem.access_code_created_at) : "Non disponible"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "Expire le:" }), " ", selectedItem.access_code_expire_at ? formatDate(selectedItem.access_code_expire_at) : "Non disponible"] }), selectedItem.access_code_compteur_nom && (_jsxs(Typography, { children: [_jsx("strong", { children: "Compteur cible:" }), " ", selectedItem.access_code_compteur_nom, " (", selectedItem.access_code_compteur_code_serie, ")"] }))] }))] }))] }), _jsx(DialogActions, { children: _jsx(Button, { onClick: () => setOpenDialog(false), children: "Fermer" }) })] })] }));
}
