import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useState, useRef } from "react";
import apiClient from "../../../utils/api";
import {
  Box, Card, Button, Typography, TextField, Select, MenuItem, CircularProgress,
  IconButton, Menu, MenuList, MenuItem as MenuItemMui, Chip, Dialog, 
  DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { Iconify } from "../../../components/iconify";
import mapboxgl from "mapbox-gl";
import { MAPBOX_CONFIG, validateMapboxToken } from "../../../config/mapbox";

// Configuration Mapbox
mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

interface SiteForage {
  id: number;
  nom: string;
  localisation: string;
  type: string;
  taux: string;
  telephone: string;
  description: string;
  latitude: string;
  longitude: string;
  statut: string;
  date_creation: string;
}

export function SiteForageView() {
  const [sites, setSites] = useState<SiteForage[]>([]);
  const [filteredSites, setFilteredSites] = useState<SiteForage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Filtres
  const [searchNom, setSearchNom] = useState<string>("");
  const [searchLocalisation, setSearchLocalisation] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statutFilter, setStatutFilter] = useState<string>("");

  // Menu actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSite, setSelectedSite] = useState<SiteForage | null>(null);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"view" | "edit" | "create">("view");
  const [formData, setFormData] = useState<Partial<SiteForage>>({});

  // Initialisation de la carte - exécutée une seule fois
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      console.log("Initializing map...");
      console.log("Mapbox access token:", mapboxgl.accessToken ? "Set" : "Not set");
      
      // Vérifier la clé API
      if (!validateMapboxToken()) {
        setMapError("Clé API Mapbox invalide ou manquante");
        setMapLoaded(false);
        return;
      }
      
      try {
        // Vérifier que le conteneur existe et a une taille
        if (!mapContainer.current.offsetWidth || !mapContainer.current.offsetHeight) {
          console.warn("Map container has no size, delaying initialization");
          setTimeout(() => {
            if (mapContainer.current && !map.current) {
              initializeMap();
            }
          }, 100);
          return;
        }

        initializeMap();

      } catch (error) {
        console.error("Error initializing map:", error);
        setMapLoaded(false);
        setMapError("Erreur lors de l'initialisation de la carte");
      }

      return () => {
        if (map.current) {
          console.log("Cleaning up map");
          map.current.remove();
          map.current = null;
        }
      };
    }
  }, []); // Dépendances vides pour s'exécuter une seule fois

  const initializeMap = () => {
    if (!mapContainer.current || map.current) return;
    
    try {
      console.log("Creating mapbox map...");
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_CONFIG.defaultStyle,
        center: MAPBOX_CONFIG.defaultCenter,
        zoom: MAPBOX_CONFIG.defaultZoom,
        attributionControl: false // Désactiver l'attribution par défaut
      });

      // Ajouter un contrôle d'attribution personnalisé
      map.current.addControl(new mapboxgl.AttributionControl({
        compact: true
      }));

      map.current.on("load", () => {
        console.log("Map loaded successfully");
        setMapLoaded(true);
        setMapError(null);
      });

      map.current.on("error", (e) => {
        console.error("Map error:", e);
        console.error("Error details:", {
          error: e.error,
          type: e.type,
          target: e.target
        });
        setMapLoaded(false);
        setMapError(`Erreur de chargement: ${e.error?.message || 'Erreur inconnue'}`);
      });

      map.current.on("sourcedata", (e) => {
        if (e.isSourceLoaded) {
          console.log("Source loaded:", e.sourceId);
        }
      });

      map.current.on("style.load", () => {
        console.log("Map style loaded");
      });

      map.current.on("idle", () => {
        console.log("Map is idle");
      });

    } catch (error) {
      console.error("Error creating mapbox map:", error);
      setMapLoaded(false);
    }
  };

  // Ajout des marqueurs sur la carte
  useEffect(() => {
    if (map.current && mapLoaded && filteredSites.length > 0) {
      console.log("Adding markers for", filteredSites.length, "sites");

      // Supprimer les anciens marqueurs
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      filteredSites.forEach(site => {
        try {
          // Créer un élément HTML personnalisé pour le marqueur
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.backgroundColor = getStatusColor(site.statut);
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.borderRadius = '50%';
          el.style.cursor = 'pointer';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

          // Ajouter un événement click
          el.addEventListener('click', () => {
            setFormData(site);
            setDialogMode("view");
            setOpenDialog(true);
          });

          const lng = parseFloat(site.longitude);
          const lat = parseFloat(site.latitude);

          if (isNaN(lng) || isNaN(lat)) {
            console.warn("Invalid coordinates for site:", site.nom, site.longitude, site.latitude);
            return;
          }

          const marker = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .addTo(map.current!);

          markers.current.push(marker);
        } catch (error) {
          console.error("Error creating marker for site:", site.nom, error);
        }
      });

      // Ajuster la vue de la carte pour afficher tous les marqueurs
      if (filteredSites.length > 0) {
        try {
          const bounds = new mapboxgl.LngLatBounds();
          filteredSites.forEach(site => {
            const lng = parseFloat(site.longitude);
            const lat = parseFloat(site.latitude);
            if (!isNaN(lng) && !isNaN(lat)) {
              bounds.extend([lng, lat]);
            }
          });

          // Attendre un peu pour que la carte soit complètement chargée
          setTimeout(() => {
            if (map.current) {
              map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
            }
          }, 100);
        } catch (error) {
          console.error("Error fitting bounds:", error);
        }
      }
    }
  }, [mapLoaded, filteredSites]);

  // Charger les sites de forage
  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/siteforage/siteforages/");
      const data = response.data;
      setSites(data);
      setFilteredSites(data);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  // Filtrage des sites
  useEffect(() => {
    let filtered = [...sites];
    
    if (searchNom) {
      filtered = filtered.filter(site => 
        site.nom.toLowerCase().includes(searchNom.toLowerCase())
      );
    }
    
    if (searchLocalisation) {
      filtered = filtered.filter(site => 
        site.localisation.toLowerCase().includes(searchLocalisation.toLowerCase())
      );
    }
    
    if (typeFilter) {
      filtered = filtered.filter(site => site.type === typeFilter);
    }
    
    if (statutFilter) {
      filtered = filtered.filter(site => site.statut === statutFilter);
    }
    
    setFilteredSites(filtered);
  }, [searchNom, searchLocalisation, typeFilter, statutFilter, sites]);

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "actif": return "#4caf50";
      case "maintenance": return "#ff9800";
      case "inactif": return "#f44336";
      default: return "#9e9e9e";
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, site: SiteForage) => {
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
        await apiClient.put(
          `/api/siteforage/siteforages/${formData.id}/`,
          formData
        );
      } else if (dialogMode === "create") {
        await apiClient.post(
          "/api/siteforage/siteforages/",
          formData
        );
      }
      
      fetchSites();
      setOpenDialog(false);
    } catch (error) {
      console.error("Erreur sauvegarde :", error);
      alert("Erreur lors de la sauvegarde du site de forage");
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Titre et bouton d'ajout */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ flexGrow: 1, mb: { xs: 2, sm: 0 } }}>
          Sites de Forage
        </Typography>
      {/*   <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => {
            setFormData({});
            setDialogMode("create");
            setOpenDialog(true);
          }}
        >
          Nouveau Site
        </Button> */}
      </Box>

      {/* Filtres */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ 
          display: "flex", 
          gap: 2, 
          flexWrap: "wrap",
          '& > *': { minWidth: '120px', flexGrow: 1 }
        }}>
          <TextField
            label="Nom du site"
            value={searchNom}
            onChange={(e) => setSearchNom(e.target.value)}
            size="small"
          />
          <TextField
            label="Localisation"
            value={searchLocalisation}
            onChange={(e) => setSearchLocalisation(e.target.value)}
            size="small"
          />
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            displayEmpty
            size="small"
          >
            <MenuItem value="">Type (tous)</MenuItem>
            <MenuItem value="Solaire">Solaire</MenuItem>
            <MenuItem value="Electrique">Électrique</MenuItem>
            <MenuItem value="Hybride">Hybride</MenuItem>
            <MenuItem value="Manuel">Manuel</MenuItem>
          </Select>
          <Select
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            displayEmpty
            size="small"
          >
            <MenuItem value="">Statut (tous)</MenuItem>
            <MenuItem value="actif">Actif</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
            <MenuItem value="inactif">Inactif</MenuItem>
          </Select>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchNom("");
              setSearchLocalisation("");
              setTypeFilter("");
              setStatutFilter("");
            }}
          >
            Réinitialiser
          </Button>
        </Box>
      </Card>

      {/* Carte et liste */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 3, 
        height: '70vh' 
      }}>
        {/* Carte */}
        <Card sx={{ 
          flex: { xs: '1', md: '2' }, 
          position: 'relative',
          minHeight: { xs: '300px', md: 'auto' }
        }}>
          <div 
            ref={mapContainer} 
            style={{ width: "100%", height: "100%", minHeight: '300px' }} 
          />
          {!mapLoaded && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                zIndex: 10,
                p: 2,
              }}
            >
              {!mapError ? (
                <>
                  <CircularProgress size={40} />
                  <Typography variant="body2" sx={{ mt: 1, color: "text.secondary", textAlign: "center" }}>
                    Chargement de la carte...
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 1, color: "text.secondary", textAlign: "center", maxWidth: "300px" }}>
                    Si la carte ne se charge pas, vérifiez votre connexion Internet et les paramètres WebGL de votre navigateur.
                  </Typography>
                </>
              ) : (
                <>
                  <Iconify icon="eva:alert-triangle-outline" width={40} sx={{ color: "error.main" }} />
                  <Typography variant="body2" sx={{ mt: 1, color: "error.main", textAlign: "center" }}>
                    {mapError}
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 1, color: "text.secondary", textAlign: "center", maxWidth: "300px" }}>
                    Vérifiez votre connexion Internet et les paramètres de votre navigateur.
                  </Typography>
                </>
              )}
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ mt: 2 }}
                onClick={() => {
                  setMapError(null);
                  if (map.current) {
                    map.current.remove();
                    map.current = null;
                    setMapLoaded(false);
                    setTimeout(() => {
                      if (mapContainer.current) {
                        initializeMap();
                      }
                    }, 100);
                  }
                }}
              >
                Réessayer
              </Button>
            </Box>
          )}
        </Card>

        {/* Liste des sites */}
        <Card sx={{ 
          flex: { xs: '1', md: '1' }, 
          p: 2, 
          overflow: 'auto',
          maxHeight: '100%'
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {filteredSites.length} site(s) trouvé(s)
          </Typography>
          
          <Box sx={{ maxHeight: 'calc(100% - 50px)', overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : filteredSites.length > 0 ? (
              filteredSites.map((site) => (
                <Card key={site.id} sx={{ p: 2, mb: 1, cursor: 'pointer' }} 
                  onClick={() => {
                    setFormData(site);
                    setDialogMode("view");
                    setOpenDialog(true);
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="subtitle1">{site.nom}</Typography>
                    <IconButton onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, site);
                    }} size="small">
                      <Iconify icon="eva:more-vertical-fill" width={16} />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {site.localisation}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={site.type}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={site.statut}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(site.statut),
                        color: "white"
                      }}
                    />
                  </Box>
                </Card>
              ))
            ) : (
              <Typography sx={{ p: 2 }}>Aucun site de forage trouvé</Typography>
            )}
          </Box>
        </Card>
      </Box>

      {/* Menu contextuel */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuList>
          <MenuItemMui onClick={handleView}>
            <Iconify icon="solar:eye-bold" sx={{ mr: 1 }} />
            Voir détails
          </MenuItemMui>
          <MenuItemMui onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" sx={{ mr: 1 }} />
            Modifier
          </MenuItemMui>
        </MenuList>
      </Menu>

      {/* Dialog Détails/Édition */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogMode === "view" ? "Détails du site" : 
           dialogMode === "edit" ? "Modifier le site" : "Nouveau site de forage"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nom"
            value={formData.nom || ""}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            fullWidth
            disabled={dialogMode === "view"}
          />
          <TextField
            label="Localisation"
            value={formData.localisation || ""}
            onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
            fullWidth
            disabled={dialogMode === "view"}
          />
          <TextField
            label="Type"
            value={formData.type || ""}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            fullWidth
            disabled={dialogMode === "view"}
          />
          <TextField
            label="Taux"
            value={formData.taux || ""}
            onChange={(e) => setFormData({ ...formData, taux: e.target.value })}
            fullWidth
            disabled={dialogMode === "view"}
          />
          <TextField
            label="Téléphone"
            value={formData.telephone || ""}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            fullWidth
            disabled={dialogMode === "view"}
          />
          <TextField
            label="Description"
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
            disabled={dialogMode === "view"}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Latitude"
              value={formData.latitude || ""}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              fullWidth
              disabled={dialogMode === "view"}
            />
            <TextField
              label="Longitude"
              value={formData.longitude || ""}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              fullWidth
              disabled={dialogMode === "view"}
            />
          </Box>
          {dialogMode !== "view" && (
            <Select
              value={formData.statut || ""}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              displayEmpty
              fullWidth
            >
              <MenuItem value="actif">Actif</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
              <MenuItem value="inactif">Inactif</MenuItem>
            </Select>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {dialogMode === "view" ? "Fermer" : "Annuler"}
          </Button>
          {dialogMode !== "view" && (
            <Button variant="contained" onClick={handleSave}>
              Enregistrer
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}