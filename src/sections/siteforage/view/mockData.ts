// mockData.ts

// Définir l'interface SiteForage
export interface SiteForage {
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

export const mockSitesForage: SiteForage[] = [
  {
    "id": 4,
    "nom": "Forage Masina",
    "localisation": "Masina, Boulevard Lumumba",
    "type": "Solaire",
    "taux": "50.00",
    "telephone": "+243810000001",
    "description": "Forage équipé de panneaux solaires pour alimenter la communauté locale.",
    "latitude": "-4.358200",
    "longitude": "15.348900",
    "statut": "actif",
    "date_creation": "2025-08-28T12:27:20.298233Z"
  },
  {
    "id": 5,
    "nom": "Forage Limete Industriel",
    "localisation": "Limete, Zone Industrielle",
    "type": "Electrique",
    "taux": "45.00",
    "telephone": "+243810000002",
    "description": "Forage électrique destiné aux usines et ménages environnants.",
    "latitude": "-4.338100",
    "longitude": "15.320500",
    "statut": "actif",
    "date_creation": "2025-08-28T12:27:20.447777Z"
  },
  {
    "id": 6,
    "nom": "Forage Ndjili Cité",
    "localisation": "Ndjili, Quartier Cité",
    "type": "Hybride",
    "taux": "40.00",
    "telephone": "+243810000003",
    "description": "Forage hybride (solaire et électrique) pour un service continu.",
    "latitude": "-4.389100",
    "longitude": "15.373200",
    "statut": "actif",
    "date_creation": "2025-08-28T12:27:20.597911Z"
  },
  {
    "id": 7,
    "nom": "Forage Bandalungwa",
    "localisation": "Bandalungwa, Avenue Kasa-Vubu",
    "type": "Electrique",
    "taux": "55.00",
    "telephone": "+243810000004",
    "description": "Forage électrique en plein centre urbain de Bandalungwa.",
    "latitude": "-4.335700",
    "longitude": "15.277200",
    "statut": "actif",
    "date_creation": "2025-08-28T12:27:20.746922Z"
  },
  {
    "id": 8,
    "nom": "Forage Kintambo Magasin",
    "localisation": "Kintambo, Magasin Central",
    "type": "Manuel",
    "taux": "30.00",
    "telephone": "+243810000005",
    "description": "Forage manuel pour les besoins des habitants de Kintambo.",
    "latitude": "-4.324400",
    "longitude": "15.283600",
    "statut": "maintenance",
    "date_creation": "2025-08-28T12:27:20.895724Z"
  },
  {
    "id": 9,
    "nom": "Forage Ngaba",
    "localisation": "Ngaba, Marché Municipal",
    "type": "Solaire",
    "taux": "48.00",
    "telephone": "+243810000006",
    "description": "Forage solaire accessible 24h/24.",
    "latitude": "-4.364700",
    "longitude": "15.305000",
    "statut": "actif",
    "date_creation": "2025-08-28T12:27:21.044523Z"
  },
  {
    "id": 10,
    "nom": "Forage Lemba Terminus",
    "localisation": "Lemba, Terminus",
    "type": "Electrique",
    "taux": "52.00",
    "telephone": "+243810000007",
    "description": "Forage électrique à haute capacité.",
    "latitude": "-4.396300",
    "longitude": "15.313900",
    "statut": "actif",
    "date_creation": "2025-08-28T12:27:21.193395Z"
  },
  {
    "id": 11,
    "nom": "Forage Mont Ngafula",
    "localisation": "Mont Ngafula, Cité Verte",
    "type": "Hybride",
    "taux": "60.00",
    "telephone": "+243810000008",
    "description": "Forage hybride pour zones résidentielles.",
    "latitude": "-4.470200",
    "longitude": "15.269800",
    "statut": "actif",
    "date_creation": "2025-08-28T12:27:21.342607Z"
  },
  {
    "id": 12,
    "nom": "Forage Selembao",
    "localisation": "Selembao, Avenue de la Révolution",
    "type": "Manuel",
    "taux": "35.00",
    "telephone": "+243810000009",
    "description": "Forage manuel communautaire.",
    "latitude": "-4.404100",
    "longitude": "15.257300",
    "statut": "inactif",
    "date_creation": "2025-08-28T12:27:21.492146Z"
  },
  {
    "id": 13,
    "nom": "Forage Kasa-Vubu",
    "localisation": "Kasa-Vubu, Rond-point Victoire",
    "type": "Electrique",
    "taux": "55.00",
    "telephone": "+243810000010",
    "description": "Forage électrique au centre de la commune.",
    "latitude": "-4.331900",
    "longitude": "15.298800",
    "statut": "actif",
    "date_creation": "2025-08-28T12:27:21.641145Z"
  },
  {
    "id": 14,
    "nom": "Forage Kalamu",
    "localisation": "Kalamu, Stade Tata Raphaël",
    "type": "Solaire",
    "taux": "50.00",
    "telephone": "+243810000011",
    "description": "Forage solaire utilisé par le quartier sportif.",
    "latitude": "-4.327000",
    "longitude": "15.305900",
    "statut": "actif",
    "date_creation": "2025-08-28T12:27:21.790828Z"
  },
  {
    "id": 15,
    "nom": "Forage Ngiri-Ngiri",
    "localisation": "Ngiri-Ngiri, Avenue Kikwit",
    "type": "Electrique",
    "taux": "47.00",
    "telephone": "+243810000012",
    "description": "Forage moderne avec pompage électrique.",
    "latitude": "-4.350200",
    "longitude": "15.286400",
    "statut": "actif",
    "date_creation": "2025-08-28T12:27:21.939727Z"
  },
  {
    "id": 16,
    "nom": "Forage Masolo",
    "localisation": "Masolo, périphérie Est",
    "type": "Hybride",
    "taux": "42.00",
    "telephone": "+243810000013",
    "description": "Forage hybride pour desservir plusieurs quartiers.",
    "latitude": "-4.411500",
    "longitude": "15.332200",
    "statut": "maintenance",
    "date_creation": "2025-08-28T12:27:22.088903Z"
  },
  {
    "id": 17,
    "nom": "Forage Kimbanseke",
    "localisation": "Kimbanseke, Marché central",
    "type": "Electrique",
    "taux": "53.00",
    "telephone": "+243810000014",
    "description": "Forage de grande capacité électrique.",
    "latitude": "-4.445600",
    "longitude": "15.378400",
    "statut": "actif",
    "date_creation": "2025-08-28T12:27:22.237808Z"
  },
  {
    "id": 18,
    "nom": "Forage Masanga Mbila",
    "localisation": "Masanga Mbila, quartier périphérique",
    "type": "Solaire",
    "taux": "38.00",
    "telephone": "+243810000015",
    "description": "Forage solaire en zone semi-rurale.",
    "latitude": "-4.460000",
    "longitude": "15.350000",
    "statut": "actif",
    "date_creation": "2025-08-28T12:27:22.386597Z"
  },
  {
    "id": 19,
    "nom": "Forage UPN",
    "localisation": "Ngaliema, Université Pédagogique Nationale",
    "type": "Electrique",
    "taux": "49.00",
    "telephone": "+243810000016",
    "description": "Forage pour étudiants et habitants environnants.",
    "latitude": "-4.393400",
    "longitude": "15.247200",
    "statut": "actif",
    "date_creation": "2025-08-28T12:27:22.535623Z"
  },
  {
    "id": 20,
    "nom": "Forage Delvaux",
    "localisation": "Ngaliema, Quartier Delvaux",
    "type": "Hybride",
    "taux": "51.00",
    "telephone": "+243810000017",
    "description": "Forage hybride de proximité.",
    "latitude": "-4.390800",
    "longitude": "15.255600",
    "statut": "actif",
    "date_creation": "2025-08-28T12:27:22.684518Z"
  }
];