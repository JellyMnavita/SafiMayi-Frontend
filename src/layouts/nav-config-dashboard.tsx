import { Label } from '../components/label';
import { SvgColor } from '../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

// Récupérer l'utilisateur depuis localStorage sans planter
const storedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
})();

const isAgent = storedUser?.role === 'agent';

// Exemple de configuration brute (garde ta configuration réelle ici)
const rawNavConfig = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Ventes',
    path: '/ventes',
    icon: icon('ic-vente'),
  },
  {
    title: 'Carte RFID',
    path: '/rfid',
    icon: icon('ic-cart'),
  },
  {
    title: 'Compteur',
    path: '/compteur',
    icon: icon('ic-counter'),
  },
  {
    title: 'Site Forage',
    path: '/siteforage',
    icon: icon('ic-location'),
  },
  {
    title: 'Utilisateurs',
    path: '/user',
    icon: icon('ic-user'),
  },
  {
    title: 'Journaux',
    path: '/journaux',
    icon: icon('ic-journaux'),
  },
  {
    title: 'Paramètres',
    path: '/parametres',
    icon: icon('ic-parametre'),
  },
];

// Chemins interdits pour le rôle "agent"
const forbiddenPathsForAgent = new Set([
  '/users',
  '/user',
  '/settings',
  '/parametres',
  '/parameters'
]);

// Filtrer sans dépendre d'une propriété `id` inexistante
export const navConfig = rawNavConfig.filter((item) => {
  if (isAgent && forbiddenPathsForAgent.has(item.path)) {
    return false;
  }
  return true;
});
