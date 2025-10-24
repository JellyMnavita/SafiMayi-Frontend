import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { SvgColor } from '../components/svg-color';
// ----------------------------------------------------------------------
const icon = (name) => _jsx(SvgColor, { src: `/assets/icons/navbar/${name}.svg` });
const readStoredUser = () => {
    try {
        const raw = localStorage.getItem('user');
        if (!raw)
            return null;
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
};
const buildRawNav = () => ([
    { title: 'Dashboard', path: '/dashboard', icon: icon('ic-analytics') },
    { title: 'Ventes', path: '/ventes', icon: icon('ic-vente') },
    { title: 'Carte RFID', path: '/rfid', icon: icon('ic-cart') },
    { title: 'Compteur', path: '/compteur', icon: icon('ic-counter') },
    { title: 'Site Forage', path: '/siteforage', icon: icon('ic-location') },
    { title: 'Utilisateurs', path: '/user', icon: icon('ic-user') },
    { title: 'Journaux', path: '/journaux', icon: icon('ic-journaux') },
    { title: 'Paramètres', path: '/parametres', icon: icon('ic-parametre') },
]);
const forbiddenPathsForAgent = new Set([
    '/users',
    '/user',
    '/settings',
    '/parametres',
    '/parameters'
]);
export const getNavConfig = (user = null) => {
    const isAgent = user?.role === 'agent';
    const raw = buildRawNav();
    return raw.filter((item) => {
        if (isAgent && forbiddenPathsForAgent.has(item.path))
            return false;
        return true;
    });
};
/**
 * Hook to get nav config and update when user changes.
 * Listens to localStorage 'storage' (cross-tab) and custom 'user-changed' (same tab).
 */
export const useNavConfig = () => {
    const [user, setUser] = useState(() => readStoredUser());
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'user')
                setUser(readStoredUser());
        };
        const onUserChanged = () => setUser(readStoredUser());
        window.addEventListener('storage', onStorage);
        window.addEventListener('user-changed', onUserChanged);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('user-changed', onUserChanged);
        };
    }, []);
    return getNavConfig(user);
};
