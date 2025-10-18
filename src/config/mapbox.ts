// Configuration Mapbox
export const MAPBOX_CONFIG = {
  // Clé API Mapbox - Remplacez par votre clé publique
  accessToken: "pk.eyJ1IjoiamVsbHltYXdlamEiLCJhIjoiY2tnN2tocmxmMDg4azJxbjQzOG8zMmZ2dyJ9.rymg4wRDPfBEsGwWK4ZFKA",
  
  // Style par défaut de la carte
  defaultStyle: "mapbox://styles/mapbox/streets-v12",
  
  // Centre par défaut (Kinshasa, RD Congo)
  defaultCenter: [15.3319, -4.3289] as [number, number],
  
  // Zoom par défaut
  defaultZoom: 10,
  
  // Options de contrôle
  controls: {
    attribution: {
      compact: true
    },
    navigation: true,
    fullscreen: true
  }
};

// Fonction pour vérifier si la clé API est valide
export const validateMapboxToken = (): boolean => {
  if (!MAPBOX_CONFIG.accessToken) {
    console.error("Mapbox access token is not configured");
    return false;
  }
  
  if (!MAPBOX_CONFIG.accessToken.startsWith("pk.")) {
    console.error("Mapbox access token format is invalid");
    return false;
  }
  
  return true;
};
