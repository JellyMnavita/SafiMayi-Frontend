import { jsx as _jsx } from "react/jsx-runtime";
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import { RouterLink } from '../../routes/components';
import { Iconify } from '../../components/iconify';
export function CartIcon({ totalItems, sx, ...other }) {
    return (_jsx(Box, { component: RouterLink, href: "#", sx: [
            (theme) => ({
                right: 0,
                top: 112,
                zIndex: 999,
                display: 'flex',
                cursor: 'pointer',
                position: 'fixed',
                color: 'text.primary',
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 16,
                bgcolor: 'background.paper',
                padding: theme.spacing(1, 3, 1, 2),
                boxShadow: theme.vars.customShadows.dropdown,
                transition: theme.transitions.create(['opacity']),
                '&:hover': { opacity: 0.72 },
            }),
            ...(Array.isArray(sx) ? sx : [sx]),
        ], ...other, children: _jsx(Badge, { showZero: true, badgeContent: totalItems, color: "error", max: 99, children: _jsx(Iconify, { icon: "solar:cart-3-bold", width: 24 }) }) }));
}
