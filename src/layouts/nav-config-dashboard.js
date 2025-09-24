import { jsx as _jsx } from "react/jsx-runtime";
import { SvgColor } from '../components/svg-color';
// ----------------------------------------------------------------------
const icon = (name) => _jsx(SvgColor, { src: `/assets/icons/navbar/${name}.svg` });
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
