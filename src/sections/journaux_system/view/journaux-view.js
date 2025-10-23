import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import apiClient from "../../../utils/api";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress, Pagination, IconButton, Menu, MenuList, MenuItem as MenuItemMui, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tabs, Tab, Grid, Paper, FormControl, InputLabel } from "@mui/material";
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
    // États pour les données paginées
    const [recharges, setRecharges] = useState([]);
    const [paiements, setPaiements] = useState([]);
    const [consommations, setConsommations] = useState([]);
    const [loadingRecharges, setLoadingRecharges] = useState(true);
    const [loadingPaiements, setLoadingPaiements] = useState(true);
    const [loadingConsommations, setLoadingConsommations] = useState(true);
    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    // Filtres avec état pour la recherche avancée
    const [searchTerm, setSearchTerm] = useState("");
    const [dateDebut, setDateDebut] = useState("");
    const [dateFin, setDateFin] = useState("");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    // Filtres spécifiques
    const [moyenFilter, setMoyenFilter] = useState("");
    const [statutFilter, setStatutFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [compteurFilter, setCompteurFilter] = useState("");
    // Stats
    const [statsPaiements, setStatsPaiements] = useState({});
    const [statsConsommations, setStatsConsommations] = useState({
        total_consommations: 0,
        total_litres: 0,
        total_prix: 0,
        benefice_total: 0
    });
    // Menu et Dialog
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemType, setItemType] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    // Configuration du Slider responsive
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
    // Construction des paramètres de requête
    const buildQueryParams = () => {
        const params = {
            page: page.toString(),
            page_size: pageSize.toString(),
        };
        if (searchTerm)
            params.search = searchTerm;
        if (dateDebut)
            params.date_debut = dateDebut;
        if (dateFin)
            params.date_fin = dateFin;
        // Filtres spécifiques
        if (activeTab === 0 && moyenFilter)
            params.moyen = moyenFilter;
        if (activeTab === 1 && statutFilter)
            params.statut = statutFilter;
        if (activeTab === 2) {
            if (typeFilter)
                params.type_consommation = typeFilter;
            if (compteurFilter)
                params.compteur = compteurFilter;
        }
        return new URLSearchParams(params).toString();
    };
    // Charger les recharges avec pagination backend
    const fetchRecharges = async () => {
        try {
            setLoadingRecharges(true);
            const queryParams = buildQueryParams();
            const response = await apiClient.get(`/api/litrages/all-recharges/?${queryParams}`);
            setRecharges(response.data.results);
            setTotalCount(response.data.count);
            setTotalPages(response.data.total_pages);
        }
        catch (error) {
            console.error("Erreur lors du chargement des recharges :", error);
        }
        finally {
            setLoadingRecharges(false);
        }
    };
    // Charger les paiements avec pagination backend
    const fetchPaiements = async () => {
        try {
            setLoadingPaiements(true);
            const queryParams = buildQueryParams();
            const response = await apiClient.get(`/api/paiements/all/?${queryParams}`);
            setPaiements(response.data.results);
            setTotalCount(response.data.count);
            setTotalPages(response.data.total_pages);
            setStatsPaiements(response.data.statistiques || {});
        }
        catch (error) {
            console.error("Erreur lors du chargement des paiements :", error);
        }
        finally {
            setLoadingPaiements(false);
        }
    };
    // Charger les consommations avec pagination backend
    const fetchConsommations = async () => {
        try {
            setLoadingConsommations(true);
            const queryParams = buildQueryParams();
            const response = await apiClient.get(`/api/litrages/all-consommations/?${queryParams}`);
            setConsommations(response.data.results);
            setTotalCount(response.data.count);
            setTotalPages(response.data.total_pages);
            setStatsConsommations(response.data.stats || {});
        }
        catch (error) {
            console.error("Erreur lors du chargement des consommations :", error);
        }
        finally {
            setLoadingConsommations(false);
        }
    };
    // Charger les données quand les paramètres changent
    useEffect(() => {
        const fetchData = () => {
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
        // Debounce pour éviter trop de requêtes
        const timeoutId = setTimeout(fetchData, 300);
        return () => clearTimeout(timeoutId);
    }, [activeTab, page, pageSize, searchTerm, dateDebut, dateFin, moyenFilter, statutFilter, typeFilter, compteurFilter]);
    // Réinitialiser la page quand les filtres changent
    useEffect(() => {
        setPage(1);
    }, [searchTerm, dateDebut, dateFin, moyenFilter, statutFilter, typeFilter, compteurFilter]);
    const handleMenuOpen = (event, item, type) => {
        setAnchorEl(event.currentTarget);
        setSelectedItem(item);
        setItemType(type);
    };
    const handleMenuClose = () => setAnchorEl(null);
    const handleRowClick = (item, type) => {
        setSelectedItem(item);
        setItemType(type);
        setOpenDialog(true);
    };
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
    // Formater les montants
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
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
        resetFilters();
    };
    const resetFilters = () => {
        setSearchTerm("");
        setDateDebut("");
        setDateFin("");
        setMoyenFilter("");
        setStatutFilter("");
        setTypeFilter("");
        setCompteurFilter("");
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
    const TauxDisplay = () => {
        if (!statsConsommations.taux_utilises)
            return null;
        return (_jsx(Paper, { sx: {
                p: 1.5,
                mb: 2,
                bgcolor: 'background.default',
                border: 1,
                borderColor: 'divider'
            }, children: _jsxs(Box, { sx: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1
                }, children: [_jsx(Typography, { variant: "subtitle2", sx: { fontWeight: 600 }, children: "Taux utilis\u00E9s pour les calculs :" }), _jsxs(Box, { sx: {
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }, children: [_jsx(Chip, { size: "small", label: `Prix: ${formatCurrency(statsConsommations.taux_utilises.prix_par_litre)} FC/L`, color: "primary", variant: "outlined" }), _jsx(Chip, { size: "small", label: `Commission: ${statsConsommations.taux_utilises.taux_commission}%`, color: "secondary", variant: "outlined" })] })] }) }));
    };
    // Composant pour les détails d'un élément
    const DetailContent = () => {
        if (!selectedItem)
            return null;
        if (itemType === 'recharge' && isRecharge(selectedItem)) {
            return (_jsxs(Grid, { container: true, spacing: 2, children: [_jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Date" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: formatDate(selectedItem.Date) })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Utilisateur" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.Utilisateur })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "T\u00E9l\u00E9phone" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.Telephone })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Carte RFID" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem["Carte RFID"] || "Non utilisée" })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Litres" }), _jsxs(Typography, { variant: "body1", gutterBottom: true, children: [selectedItem.Litre.toFixed(1), " L"] })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Moyen" }), _jsx(Chip, { label: selectedItem.Moyen, color: "primary", size: "small" })] })] }));
        }
        if (itemType === 'paiement' && isPaiement(selectedItem)) {
            return (_jsxs(Grid, { container: true, spacing: 2, children: [_jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Date" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: formatDate(selectedItem.created_at) })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Utilisateur" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.utilisateur_nom || 'N/A' })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Email" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.utilisateur_email || 'N/A' })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "T\u00E9l\u00E9phone" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.telephone })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Carte RFID" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.rfid_uid || 'Aucune' })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Op\u00E9rateur" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.operateur })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Montant" }), _jsxs(Typography, { variant: "body1", gutterBottom: true, children: [formatCurrency(selectedItem.montant), " FC"] })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Litres cr\u00E9dit\u00E9s" }), _jsxs(Typography, { variant: "body1", gutterBottom: true, children: [selectedItem.litres_credite, " L"] })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Statut" }), _jsx(Chip, { label: getStatusText(selectedItem.statut), color: getStatusColor(selectedItem.statut), size: "small" })] }), _jsxs(Grid, { sx: { width: '100%' }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "ID Transaction" }), _jsx(Typography, { variant: "body1", gutterBottom: true, style: { wordBreak: 'break-all' }, children: selectedItem.id_transaction_ext })] })] }));
        }
        if (itemType === 'consommation' && isConsommation(selectedItem)) {
            return (_jsxs(Grid, { container: true, spacing: 2, children: [_jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "ID" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.id })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Date" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: formatDate(selectedItem.date) })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Compteur" }), _jsxs(Typography, { variant: "body1", gutterBottom: true, children: [selectedItem.compteur_nom, _jsx("br", {}), _jsx(Typography, { variant: "caption", color: "text.secondary", children: selectedItem.compteur_code_serie })] })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Litres" }), _jsxs(Typography, { variant: "body1", gutterBottom: true, children: [selectedItem.litres, " L"] })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Prix" }), _jsxs(Typography, { variant: "body1", gutterBottom: true, children: [formatCurrency(selectedItem.prix_total || 0), " FC"] })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Commission" }), _jsxs(Typography, { variant: "body1", gutterBottom: true, children: [formatCurrency(selectedItem.commission || 0), " FC"] })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Type" }), _jsx(Chip, { label: selectedItem.type, color: getTypeColor(selectedItem.type), size: "small" })] }), _jsx(Grid, { sx: { width: '100%' }, children: _jsx(Typography, { variant: "h6", gutterBottom: true, sx: { mt: 2 }, children: "Informations Utilisateur" }) }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Nom" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.utilisateur_nom || "Anonyme" })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Email" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.utilisateur_email || "Non disponible" })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "T\u00E9l\u00E9phone" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.utilisateur_telephone || "Non disponible" })] }), selectedItem.type === "RFID" ? (_jsxs(_Fragment, { children: [_jsx(Grid, { sx: { width: '100%' }, children: _jsx(Typography, { variant: "h6", gutterBottom: true, sx: { mt: 2 }, children: "Informations RFID" }) }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "UID RFID" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.rfid_uid || "Non disponible" })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "T\u00E9l\u00E9phone RFID" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.rfid_telephone || "Non disponible" })] })] })) : (_jsxs(_Fragment, { children: [_jsx(Grid, { sx: { width: '100%' }, children: _jsx(Typography, { variant: "h6", gutterBottom: true, sx: { mt: 2 }, children: "Informations Code d'Acc\u00E8s" }) }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Code" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.access_code || "Non disponible" })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Statut" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.access_code_status || "Non disponible" })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Litres demand\u00E9s" }), _jsxs(Typography, { variant: "body1", gutterBottom: true, children: [selectedItem.access_code_litres_demandes || 0, " L"] })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Cr\u00E9\u00E9 le" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.access_code_created_at ? formatDate(selectedItem.access_code_created_at) : "Non disponible" })] }), _jsxs(Grid, { sx: { width: { xs: '100%', md: '50%' } }, children: [_jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Expire le" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: selectedItem.access_code_expire_at ? formatDate(selectedItem.access_code_expire_at) : "Non disponible" })] })] }))] }));
        }
        return null;
    };
    return (_jsxs(DashboardContent, { children: [_jsxs(Box, { sx: { mb: 3, display: "flex", alignItems: "center" }, children: [_jsx(Typography, { variant: "h4", sx: { flexGrow: 1 }, children: "Journaux" }), _jsx(Button, { variant: "contained", color: "inherit", startIcon: _jsx(Iconify, { icon: "solar:restart-bold" }), onClick: refreshData, children: "Actualiser" })] }), _jsx(Card, { sx: { mb: 3, overflow: 'auto' }, children: _jsxs(Tabs, { value: activeTab, onChange: handleTabChange, variant: isMobile ? "scrollable" : "standard", scrollButtons: isMobile ? "auto" : false, allowScrollButtonsMobile: true, sx: {
                        minWidth: 'fit-content',
                        '& .MuiTab-root': {
                            minWidth: 'auto',
                            px: 2,
                            fontSize: isMobile ? '0.75rem' : '0.875rem'
                        }
                    }, children: [_jsx(Tab, { label: "Journal des Recharges" }), _jsx(Tab, { label: "Journal des Paiements" }), _jsx(Tab, { label: "Journal des Consommations" })] }) }), _jsx(Card, { sx: { p: 2, mb: 3 }, children: _jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 2 }, children: [_jsxs(Box, { sx: { display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }, children: [_jsx(TextField, { label: "Rechercher", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), size: "small", placeholder: "Nom, t\u00E9l\u00E9phone, RFID...", sx: { minWidth: isMobile ? '100%' : 250, flexGrow: 1 } }), _jsxs(Box, { sx: { display: "flex", gap: 1, alignItems: "center", flexWrap: 'wrap' }, children: [activeTab === 0 && (_jsxs(FormControl, { size: "small", sx: { minWidth: 120 }, children: [_jsx(InputLabel, { children: "Moyen" }), _jsxs(Select, { value: moyenFilter, label: "Moyen", onChange: (e) => setMoyenFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "Tous" }), _jsx(MenuItem, { value: "mobile", children: "Mobile" }), _jsx(MenuItem, { value: "rfid", children: "RFID" })] })] })), activeTab === 1 && (_jsxs(FormControl, { size: "small", sx: { minWidth: 120 }, children: [_jsx(InputLabel, { children: "Statut" }), _jsxs(Select, { value: statutFilter, label: "Statut", onChange: (e) => setStatutFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "Tous" }), _jsx(MenuItem, { value: "success", children: "R\u00E9ussi" }), _jsx(MenuItem, { value: "pending", children: "En attente" }), _jsx(MenuItem, { value: "failed", children: "\u00C9chou\u00E9" })] })] })), activeTab === 2 && (_jsxs(FormControl, { size: "small", sx: { minWidth: 140 }, children: [_jsx(InputLabel, { children: "Type" }), _jsxs(Select, { value: typeFilter, label: "Type", onChange: (e) => setTypeFilter(e.target.value), children: [_jsx(MenuItem, { value: "", children: "Tous" }), _jsx(MenuItem, { value: "RFID", children: "RFID" }), _jsx(MenuItem, { value: "Code d'acc\u00E8s", children: "Code d'Acc\u00E8s" })] })] })), _jsx(Button, { variant: "outlined", size: "small", startIcon: _jsx(Iconify, { icon: showAdvancedFilters ? "mingcute:close-line" : "ic:round-filter-list" }), onClick: () => setShowAdvancedFilters(!showAdvancedFilters), children: showAdvancedFilters ? "Masquer" : "Plus de filtres" }), _jsx(Button, { variant: "outlined", size: "small", onClick: resetFilters, startIcon: _jsx(Iconify, { icon: "solar:restart-bold" }), children: "R\u00E9initialiser" })] })] }), showAdvancedFilters && (_jsxs(Box, { sx: {
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                                alignItems: "center",
                                pt: 2,
                                borderTop: 1,
                                borderColor: 'divider'
                            }, children: [_jsx(TextField, { label: "Date de d\u00E9but", type: "date", value: dateDebut, onChange: (e) => setDateDebut(e.target.value), size: "small", InputLabelProps: { shrink: true }, sx: { minWidth: 150 } }), _jsx(TextField, { label: "Date de fin", type: "date", value: dateFin, onChange: (e) => setDateFin(e.target.value), size: "small", InputLabelProps: { shrink: true }, sx: { minWidth: 150 } }), activeTab === 2 && (_jsx(TextField, { label: "Compteur", value: compteurFilter, onChange: (e) => setCompteurFilter(e.target.value), size: "small", placeholder: "Nom ou code s\u00E9rie", sx: { minWidth: 150 } })), _jsxs(FormControl, { size: "small", sx: { minWidth: 100 }, children: [_jsx(InputLabel, { children: "Par page" }), _jsxs(Select, { value: pageSize, label: "Par page", onChange: (e) => setPageSize(Number(e.target.value)), children: [_jsx(MenuItem, { value: 10, children: "10" }), _jsx(MenuItem, { value: 20, children: "20" }), _jsx(MenuItem, { value: 50, children: "50" }), _jsx(MenuItem, { value: 100, children: "100" })] })] })] }))] }) }), activeTab === 2 && statsConsommations.taux_utilises && _jsx(TauxDisplay, {}), (activeTab === 1 || activeTab === 2) && (_jsx(Box, { sx: {
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
                }, children: activeTab === 1 ? (_jsxs(Slider, { ...sliderSettings, children: [_jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Montant Total", total: statsPaiements.montant_total || 0, color: "primary", suffix: " FC", isCurrency: true, icon: _jsx("img", { alt: "Revenue", src: "/assets/icons/glass/ic-glass-buy.svg" }), sx: { height: '100%' } }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Paiements R\u00E9ussis", total: statsPaiements.reussis || 0, color: "success", icon: _jsx("img", { alt: "RFID", src: "/assets/icons/glass/ic-glass-users.svg" }), sx: { height: '100%' } }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "En Attente", total: statsPaiements.en_attente || 0, color: "warning", icon: _jsx("img", { alt: "Water", src: "/assets/icons/glass/ic-glass-message.svg" }), sx: { height: '100%' } }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "\u00C9chou\u00E9s", total: statsPaiements.echecs || 0, color: "error", icon: _jsx("img", { alt: "Total", src: "/assets/icons/glass/ic-glass-bag.svg" }), sx: { height: '100%' } }) })] })) : (_jsxs(Slider, { ...sliderSettings, children: [_jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Total Consommations", total: statsConsommations.total_consommations || 0, color: "primary", icon: _jsx("img", { alt: "Total", src: "/assets/icons/glass/ic-glass-bag.svg" }), sx: { height: '100%' } }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Litres Total", total: statsConsommations.total_litres || 0, color: "success", suffix: " L", icon: _jsx("img", { alt: "Water", src: "/assets/icons/glass/ic-glass-message.svg" }), sx: { height: '100%' } }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "Prix Total", total: statsConsommations.total_prix || 0, color: "info", suffix: " FC", isCurrency: true, icon: _jsx("img", { alt: "Revenue", src: "/assets/icons/glass/ic-glass-buy.svg" }), sx: { height: '100%' } }) }), _jsx("div", { children: _jsx(AnalyticsWidgetSummary, { title: "B\u00E9n\u00E9fice Total", total: statsConsommations.benefice_total || 0, color: "warning", suffix: " FC", isCurrency: true, icon: _jsx("img", { alt: "Profit", src: "/assets/icons/glass/ic-glass-users.svg" }), sx: { height: '100%' } }) })] })) })), _jsx(Card, { children: _jsx("div", { className: "p-4 bg-white shadow-md rounded-md overflow-x-auto", children: ((activeTab === 0 && loadingRecharges) || (activeTab === 1 && loadingPaiements) || (activeTab === 2 && loadingConsommations)) ? (_jsx("div", { className: "flex justify-center items-center py-10", children: _jsx(CircularProgress, {}) })) : (_jsxs(_Fragment, { children: [activeTab === 0 ? (_jsxs("table", { className: "w-full border-collapse min-w-[800px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100 text-left text-sm", children: [_jsx("th", { className: "p-2 border-b", children: "Date" }), _jsx("th", { className: "p-2 border-b", children: "Utilisateur" }), _jsx("th", { className: "p-2 border-b", children: "T\u00E9l\u00E9phone" }), _jsx("th", { className: "p-2 border-b", children: "Carte RFID" }), _jsx("th", { className: "p-2 border-b", children: "Litres" }), _jsx("th", { className: "p-2 border-b", children: "Moyen" }), _jsx("th", { className: "p-2 border-b text-center", children: "Actions" })] }) }), _jsx("tbody", { children: recharges.length > 0 ? (recharges.map((item, index) => (_jsxs("tr", { className: "hover:bg-gray-50 cursor-pointer", onClick: () => handleRowClick(item, 'recharge'), children: [_jsx("td", { className: "p-2 border-b", children: formatDate(item.Date) }), _jsx("td", { className: "p-2 border-b", children: item.Utilisateur }), _jsx("td", { className: "p-2 border-b", children: item.Telephone }), _jsx("td", { className: "p-2 border-b", children: item["Carte RFID"] || "-" }), _jsxs("td", { className: "p-2 border-b", children: [item.Litre.toFixed(1), " L"] }), _jsx("td", { className: "p-2 border-b", children: _jsx("span", { className: "bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium", children: item.Moyen }) }), _jsx("td", { className: "p-2 border-b text-center", onClick: (e) => e.stopPropagation(), children: _jsx(IconButton, { onClick: (e) => handleMenuOpen(e, item, 'recharge'), children: _jsx(Iconify, { icon: "eva:more-vertical-fill" }) }) })] }, index)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center text-gray-500 py-6", children: "Aucune recharge trouv\u00E9e" }) })) })] })) : activeTab === 1 ? (_jsxs("table", { className: "w-full border-collapse min-w-[1100px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100 text-left text-sm", children: [_jsx("th", { className: "p-2 border-b", children: "Date" }), _jsx("th", { className: "p-2 border-b", children: "Utilisateur" }), _jsx("th", { className: "p-2 border-b", children: "T\u00E9l\u00E9phone" }), _jsx("th", { className: "p-2 border-b", children: "Carte RFID" }), _jsx("th", { className: "p-2 border-b", children: "Op\u00E9rateur" }), _jsx("th", { className: "p-2 border-b", children: "Montant" }), _jsx("th", { className: "p-2 border-b", children: "Litres" }), _jsx("th", { className: "p-2 border-b", children: "Statut" }), _jsx("th", { className: "p-2 border-b text-center", children: "Actions" })] }) }), _jsx("tbody", { children: paiements.length > 0 ? (paiements.map((item) => (_jsxs("tr", { className: "hover:bg-gray-50 cursor-pointer", onClick: () => handleRowClick(item, 'paiement'), children: [_jsx("td", { className: "p-2 border-b", children: formatDate(item.created_at) }), _jsxs("td", { className: "p-2 border-b", children: [item.utilisateur_nom || 'N/A', item.utilisateur_email && (_jsx("div", { className: "text-xs text-gray-500", children: item.utilisateur_email }))] }), _jsx("td", { className: "p-2 border-b", children: item.telephone }), _jsx("td", { className: "p-2 border-b", children: item.rfid_uid || 'Aucune' }), _jsx("td", { className: "p-2 border-b", children: item.operateur }), _jsxs("td", { className: "p-2 border-b", children: [item.montant, " FC"] }), _jsxs("td", { className: "p-2 border-b", children: [item.litres_credite, " L"] }), _jsx("td", { className: "p-2 border-b", children: _jsx(Chip, { label: getStatusText(item.statut), color: getStatusColor(item.statut), size: "small" }) }), _jsx("td", { className: "p-2 border-b text-center", onClick: (e) => e.stopPropagation(), children: _jsx(IconButton, { onClick: (e) => handleMenuOpen(e, item, 'paiement'), children: _jsx(Iconify, { icon: "eva:more-vertical-fill" }) }) })] }, item.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 9, className: "text-center text-gray-500 py-6", children: "Aucun paiement trouv\u00E9" }) })) })] })) : (_jsxs("table", { className: "w-full border-collapse min-w-[1200px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100 text-left text-sm", children: [_jsx("th", { className: "p-2 border-b", children: "Date" }), _jsx("th", { className: "p-2 border-b", children: "Compteur" }), _jsx("th", { className: "p-2 border-b", children: "Litres" }), _jsx("th", { className: "p-2 border-b", children: "Prix" }), _jsx("th", { className: "p-2 border-b", children: "Type" }), _jsx("th", { className: "p-2 border-b", children: "Utilisateur" }), _jsx("th", { className: "p-2 border-b text-center", children: "Actions" })] }) }), _jsx("tbody", { children: consommations.length > 0 ? (consommations.map((item) => (_jsxs("tr", { className: "hover:bg-gray-50 cursor-pointer", onClick: () => handleRowClick(item, 'consommation'), children: [_jsx("td", { className: "p-2 border-b", children: formatDate(item.date) }), _jsxs("td", { className: "p-2 border-b", children: [item.compteur_nom, _jsx("div", { className: "text-xs text-gray-500", children: item.compteur_code_serie })] }), _jsxs("td", { className: "p-2 border-b", children: [item.litres, " L"] }), _jsxs("td", { className: "p-2 border-b", children: [formatCurrency(item.prix_total || 0), " FC"] }), _jsx("td", { className: "p-2 border-b", children: _jsx(Chip, { label: item.type, color: getTypeColor(item.type), size: "small" }) }), _jsxs("td", { className: "p-2 border-b", children: [item.utilisateur_nom || "Anonyme", item.utilisateur_telephone && (_jsx("div", { className: "text-xs text-gray-500", children: item.utilisateur_telephone }))] }), _jsx("td", { className: "p-2 border-b text-center", onClick: (e) => e.stopPropagation(), children: _jsx(IconButton, { onClick: (e) => handleMenuOpen(e, item, 'consommation'), children: _jsx(Iconify, { icon: "eva:more-vertical-fill" }) }) })] }, item.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center text-gray-500 py-6", children: "Aucune consommation trouv\u00E9e" }) })) })] })), _jsxs(Box, { sx: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 2,
                                    flexWrap: "wrap",
                                    gap: 2,
                                }, children: [_jsx(Typography, { variant: "body2", children: `Affichage de ${recharges.length} sur ${totalCount} ${activeTab === 0 ? 'recharges' :
                                            activeTab === 1 ? 'paiements' :
                                                'consommations'}` }), _jsx(Pagination, { count: totalPages, page: page, onChange: (_, value) => setPage(value), color: "primary", showFirstButton: true, showLastButton: true })] })] })) }) }), _jsx(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, children: _jsx(MenuList, { children: _jsx(MenuItemMui, { onClick: () => {
                            setOpenDialog(true);
                            handleMenuClose();
                        }, children: "Voir les d\u00E9tails" }) }) }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), fullWidth: true, maxWidth: "md", PaperProps: {
                    sx: { borderRadius: 2 }
                }, children: [_jsx(DialogTitle, { sx: {
                            borderBottom: 1,
                            borderColor: 'divider',
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText'
                        }, children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(Iconify, { icon: itemType === 'recharge' ? "solar:restart-bold" :
                                        itemType === 'paiement' ? "solar:cart-3-bold" :
                                            "solar:shield-keyhole-bold-duotone" }), "D\u00E9tails ", itemType === 'recharge' ? 'de la recharge' : itemType === 'paiement' ? 'du paiement' : 'de la consommation'] }) }), _jsx(DialogContent, { sx: { p: 3, maxHeight: '70vh', overflow: 'auto' }, children: _jsx(DetailContent, {}) }), _jsx(DialogActions, { sx: { p: 2, borderTop: 1, borderColor: 'divider' }, children: _jsx(Button, { onClick: () => setOpenDialog(false), variant: "contained", startIcon: _jsx(Iconify, { icon: "mingcute:close-line" }), children: "Fermer" }) })] })] }));
}
