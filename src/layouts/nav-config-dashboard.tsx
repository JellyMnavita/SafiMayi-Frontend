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

export const navData = [
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
    title: 'Compteur',
    path: '/compteur',
    icon: icon('ic-counter'),
  },
  {
    title: 'Carte RFID',
    path: '/rfid',
    icon: icon('ic-cart'),
  },
  {
    title: 'Utilisateurs',
    path: '/user',
    icon: icon('ic-user'),
  },
  {
    title: 'Journaux Système',
    path: '/journaux',
    icon: icon('ic-journaux'),
  }
  /*   {
    title: 'Logout',
    path: '/',
    icon: icon('ic-logout'),
  }, */
  /*   {
      title: 'Not found',
      path: '/404',
      icon: icon('ic-disabled'),
    }, */
];
