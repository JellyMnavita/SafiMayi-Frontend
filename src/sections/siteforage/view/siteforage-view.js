import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useState, useRef } from "react";
import apiClient from "../../../utils/api";
import { Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress, IconButton, Menu, MenuList, MenuItem as MenuItemMui, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Iconify } from "../../../components/iconify";
import mapboxgl from "mapbox-gl";
import { MAPBOX_CONFIG, validateMapboxToken } from "../../../config/mapbox";
// Configuration Mapbox
mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;
export function SiteForageView() {
    const [sites, setSites] = useState([]);
    const [filteredSites, setFilteredSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markers = useRef([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(null);
    // Pagination / méta renvoyées par l'API
    const [totalCount, setTotalCount] = useState(0);
    const [pageSizeServer, setPageSizeServer] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    // Filtres
    const [searchNom, setSearchNom] = useState("");
    const [searchLocalisation, setSearchLocalisation] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statutFilter, setStatutFilter] = useState("");
    // Menu actions
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedSite, setSelectedSite] = useState(null);
    // Dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState("view");
    const [formData, setFormData] = useState({});
    const initializingMap = useRef(false);
    const mapMoveTimeout = useRef(null);
    // Initialisation de la carte
    useEffect(() => {
        if (mapContainer.current && !map.current && !initializingMap.current) {
            initializingMap.current = true;
            if (!validateMapboxToken()) {
                setMapError("Clé API Mapbox invalide ou manquante");
                setMapLoaded(false);
                initializingMap.current = false;
                return;
            }
            const initializeMap = () => {
                map.current = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: MAPBOX_CONFIG.defaultStyle,
                    center: MAPBOX_CONFIG.defaultCenter,
                    zoom: MAPBOX_CONFIG.defaultZoom,
                    attributionControl: false
                });
                map.current.addControl(new mapboxgl.AttributionControl({ compact: true }));
                map.current.on("load", () => {
                    setMapLoaded(true);
                    setMapError(null);
                    initializingMap.current = false;
                    fetchSitesInView(); // Charger les premiers sites visibles
                });
                // À chaque déplacement ou zoom, on recharge les sites visibles
                map.current.on("moveend", () => {
                    if (mapMoveTimeout.current)
                        clearTimeout(mapMoveTimeout.current);
                    mapMoveTimeout.current = setTimeout(fetchSitesInView, 400);
                });
                map.current.on("error", (e) => {
                    setMapLoaded(false);
                    setMapError(`Erreur de chargement: ${e.error?.message || 'Erreur inconnue'}`);
                });
            };
            initializeMap();
        }
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
                initializingMap.current = false;
            }
        };
    }, []);
    // Charger les sites visibles dans la zone affichée
    const fetchSitesInView = async () => {
        if (!map.current)
            return;
        const bounds = map.current.getBounds();
        if (!bounds)
            return;
        const minLat = bounds.getSouth();
        const maxLat = bounds.getNorth();
        const minLng = bounds.getWest();
        const maxLng = bounds.getEast();
        try {
            setLoading(true);
            // Charger de nouveaux sites visibles sur cette zone
            const response = await apiClient.get(`/api/siteforage/siteforages-pagination/`, {
                params: { min_lat: minLat, max_lat: maxLat, min_lng: minLng, max_lng: maxLng },
            });
            // Accepter plusieurs formes de réponse (array | { results: [...] } | { data: [...] })
            const raw = response.data;
            let items = [];
            // response peut être une simple liste ou un objet paginé
            if (Array.isArray(raw)) {
                items = raw;
            }
            else if (Array.isArray(raw.results)) {
                items = raw.results;
                // récupérer les métadonnées si présentes
                setTotalCount(raw.count || 0);
                setPageSizeServer(raw.page_size || pageSizeServer);
                setCurrentPage(raw.current_page || 1);
                setTotalPages(raw.total_pages || Math.ceil((raw.count || items.length) / pageSizeServer));
            }
            else if (Array.isArray(raw.data)) {
                items = raw.data;
            }
            else {
                console.warn('Unexpected response shape for siteforages:', raw);
                items = [];
            }
            const validatedData = items.map((site) => ({
                ...site,
                latitude: site.latitude || "0",
                longitude: site.longitude || "0",
            }));
            setSites(validatedData);
            setFilteredSites(validatedData);
        }
        catch (error) {
            console.error("Erreur lors du chargement des sites :", error);
        }
        finally {
            setLoading(false);
        }
    };
    // Gestion des marqueurs sur la carte
    useEffect(() => {
        if (map.current && mapLoaded && filteredSites.length > 0) {
            markers.current.forEach((marker) => marker.remove());
            markers.current = [];
            filteredSites.forEach((site) => {
                const lng = parseFloat(site.longitude);
                const lat = parseFloat(site.latitude);
                if (isNaN(lng) || isNaN(lat))
                    return;
                const el = document.createElement("div");
                el.className = "custom-marker";
                el.style.backgroundColor = getStatusColor(site.statut);
                el.style.width = "20px";
                el.style.height = "20px";
                el.style.borderRadius = "50%";
                el.style.cursor = "pointer";
                el.style.border = "2px solid white";
                el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
                el.addEventListener("click", () => {
                    setFormData(site);
                    setDialogMode("view");
                    setOpenDialog(true);
                });
                const marker = new mapboxgl.Marker(el).setLngLat([lng, lat]).addTo(map.current);
                markers.current.push(marker);
            });
        }
    }, [filteredSites, mapLoaded]);
    // Filtrage local (barre de recherche, etc.)
    useEffect(() => {
        let filtered = [...sites];
        if (searchNom)
            filtered = filtered.filter((s) => s.nom.toLowerCase().includes(searchNom.toLowerCase()));
        if (searchLocalisation)
            filtered = filtered.filter((s) => s.localisation.toLowerCase().includes(searchLocalisation.toLowerCase()));
        if (typeFilter)
            filtered = filtered.filter((s) => s.type === typeFilter);
        if (statutFilter)
            filtered = filtered.filter((s) => s.statut === statutFilter);
        setFilteredSites(filtered);
    }, [searchNom, searchLocalisation, typeFilter, statutFilter, sites]);
    const getStatusColor = (statut) => {
        switch (statut) {
            case "actif":
                return "#4caf50";
            case "maintenance":
                return "#ff9800";
            case "inactif":
                return "#f44336";
            default:
                return "#9e9e9e";
        }
    };
    const handleMenuOpen = (event, site) => {
        setAnchorEl(event.currentTarget);
        setSelectedSite(site);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedSite(null);
    };
    const handleEdit = () => {
        if (selectedSite) {
            setFormData(selectedSite);
            setDialogMode("edit");
            setOpenDialog(true);
        }
        handleMenuClose();
    };
    const handleView = () => {
        if (selectedSite) {
            setFormData(selectedSite);
            setDialogMode("view");
            setOpenDialog(true);
        }
        handleMenuClose();
    };
    const handleSave = async () => {
        try {
            if (dialogMode === "edit") {
                await apiClient.put(`/api/siteforage/siteforages/${formData.id}/`, formData);
            }
            else if (dialogMode === "create") {
                await apiClient.post("/api/siteforage/siteforages/", formData);
            }
            fetchSitesInView();
            setOpenDialog(false);
        }
        catch (error) {
            console.error("Erreur sauvegarde :", error);
            alert("Erreur lors de la sauvegarde du site de forage");
        }
    };
    return (_jsxs(Box, { sx: { width: "100%", p: 3 }, children: [_jsx(Box, { sx: { mb: 3, display: "flex", alignItems: "center", flexWrap: "wrap" }, children: _jsx(Typography, { variant: "h4", sx: { flexGrow: 1, mb: { xs: 2, sm: 0 } }, children: "Sites de Forage" }) }), _jsx(Card, { sx: { p: 2, mb: 3 }, children: _jsxs(Box, { sx: {
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                        "& > *": { minWidth: "120px", flexGrow: 1 },
                    }, children: [_jsx(TextField, { label: "Nom du site", value: searchNom, onChange: (e) => setSearchNom(e.target.value), size: "small" }), _jsx(TextField, { label: "Localisation", value: searchLocalisation, onChange: (e) => setSearchLocalisation(e.target.value), size: "small" }), _jsxs(Select, { value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), displayEmpty: true, size: "small", children: [_jsx(MenuItem, { value: "", children: "Type (tous)" }), _jsx(MenuItem, { value: "Solaire", children: "Solaire" }), _jsx(MenuItem, { value: "Electrique", children: "\u00C9lectrique" }), _jsx(MenuItem, { value: "Hybride", children: "Hybride" }), _jsx(MenuItem, { value: "Manuel", children: "Manuel" })] }), _jsxs(Select, { value: statutFilter, onChange: (e) => setStatutFilter(e.target.value), displayEmpty: true, size: "small", children: [_jsx(MenuItem, { value: "", children: "Statut (tous)" }), _jsx(MenuItem, { value: "actif", children: "Actif" }), _jsx(MenuItem, { value: "maintenance", children: "Maintenance" }), _jsx(MenuItem, { value: "inactif", children: "Inactif" })] }), _jsx(Button, { variant: "outlined", onClick: () => {
                                setSearchNom("");
                                setSearchLocalisation("");
                                setTypeFilter("");
                                setStatutFilter("");
                            }, children: "R\u00E9initialiser" })] }) }), _jsxs(Box, { sx: { display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, height: "calc(100vh - 200px)", minHeight: "500px" }, children: [_jsxs(Card, { sx: { flex: { xs: "1", md: "2" }, position: "relative", height: "100%" }, children: [_jsx("div", { ref: mapContainer, style: { width: "100%", height: "100%", minHeight: "300px" } }), !mapLoaded && (_jsxs(Box, { sx: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.95)" }, children: [_jsx(CircularProgress, {}), _jsx(Typography, { variant: "body2", sx: { mt: 1, ml: 2 }, children: "Chargement de la carte..." })] }))] }), _jsxs(Card, { sx: { flex: { xs: "1", md: "1" }, p: 2, overflow: "auto", height: "100%" }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 2 }, children: totalCount > 0 ? `${totalCount} site(s) trouvé(s)` : `${filteredSites.length} site(s) trouvé(s)` }), _jsx(Box, { sx: { flex: 1, overflow: "auto" }, children: loading ? (_jsx(Box, { sx: { display: "flex", justifyContent: "center", p: 3 }, children: _jsx(CircularProgress, {}) })) : filteredSites.length > 0 ? (filteredSites.map((site) => (_jsxs(Card, { sx: { p: 2, mb: 1, cursor: "pointer" }, onClick: () => { setFormData(site); setDialogMode("view"); setOpenDialog(true); }, children: [_jsxs(Box, { sx: { display: "flex", justifyContent: "space-between" }, children: [_jsx(Typography, { variant: "subtitle1", children: site.nom }), _jsx(IconButton, { onClick: (e) => { e.stopPropagation(); handleMenuOpen(e, site); }, size: "small", children: _jsx(Iconify, { icon: "eva:more-vertical-fill", width: 16 }) })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: site.localisation }), _jsxs(Box, { sx: { display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }, children: [_jsx(Chip, { label: site.type, size: "small", variant: "outlined" }), _jsx(Chip, { label: site.statut, size: "small", sx: { backgroundColor: getStatusColor(site.statut), color: "white" } })] })] }, site.id)))) : (_jsx(Typography, { sx: { p: 2 }, children: "Aucun site trouv\u00E9 dans cette zone" })) })] })] }), _jsx(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleMenuClose, children: _jsxs(MenuList, { children: [_jsxs(MenuItemMui, { onClick: handleView, children: [_jsx(Iconify, { icon: "solar:eye-bold", sx: { mr: 1 } }), " Voir d\u00E9tails"] }), _jsxs(MenuItemMui, { onClick: handleEdit, children: [_jsx(Iconify, { icon: "solar:pen-bold", sx: { mr: 1 } }), " Modifier"] })] }) }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), fullWidth: true, maxWidth: "sm", children: [_jsx(DialogTitle, { children: dialogMode === "view" ? "Détails du site" : dialogMode === "edit" ? "Modifier le site" : "Nouveau site de forage" }), _jsxs(DialogContent, { sx: { display: "flex", flexDirection: "column", gap: 2, mt: 1 }, children: [_jsx(TextField, { label: "Nom", value: formData.nom || "", onChange: (e) => setFormData({ ...formData, nom: e.target.value }), fullWidth: true, disabled: dialogMode === "view" }), _jsx(TextField, { label: "Localisation", value: formData.localisation || "", onChange: (e) => setFormData({ ...formData, localisation: e.target.value }), fullWidth: true, disabled: dialogMode === "view" }), _jsx(TextField, { label: "Type", value: formData.type || "", onChange: (e) => setFormData({ ...formData, type: e.target.value }), fullWidth: true, disabled: dialogMode === "view" }), _jsx(TextField, { label: "Taux", value: formData.taux || "", onChange: (e) => setFormData({ ...formData, taux: e.target.value }), fullWidth: true, disabled: dialogMode === "view" }), _jsx(TextField, { label: "T\u00E9l\u00E9phone", value: formData.telephone || "", onChange: (e) => setFormData({ ...formData, telephone: e.target.value }), fullWidth: true, disabled: dialogMode === "view" }), _jsx(TextField, { label: "Description", value: formData.description || "", onChange: (e) => setFormData({ ...formData, description: e.target.value }), multiline: true, rows: 3, fullWidth: true, disabled: dialogMode === "view" }), _jsxs(Box, { sx: { display: "flex", gap: 2 }, children: [_jsx(TextField, { label: "Latitude", value: formData.latitude || "", onChange: (e) => setFormData({ ...formData, latitude: e.target.value }), fullWidth: true, disabled: dialogMode === "view" }), _jsx(TextField, { label: "Longitude", value: formData.longitude || "", onChange: (e) => setFormData({ ...formData, longitude: e.target.value }), fullWidth: true, disabled: dialogMode === "view" })] }), dialogMode !== "view" && (_jsxs(Select, { value: formData.statut || "", onChange: (e) => setFormData({ ...formData, statut: e.target.value }), displayEmpty: true, fullWidth: true, children: [_jsx(MenuItem, { value: "actif", children: "Actif" }), _jsx(MenuItem, { value: "maintenance", children: "Maintenance" }), _jsx(MenuItem, { value: "inactif", children: "Inactif" })] }))] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpenDialog(false), children: dialogMode === "view" ? "Fermer" : "Annuler" }), dialogMode !== "view" && _jsx(Button, { variant: "contained", onClick: handleSave, children: "Enregistrer" })] })] })] }));
}
