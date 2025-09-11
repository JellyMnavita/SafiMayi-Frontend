import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import { useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import { usePathname } from '../../routes/hooks';
import { RouterLink } from '../../routes/components';
import { Logo } from '../../components/logo';
import { Scrollbar } from '../../components/scrollbar';
export function NavDesktop({ sx, data, slots, workspaces, layoutQuery, }) {
    const theme = useTheme();
    return (_jsx(Box, { sx: {
            pt: 2.5,
            px: 2.5,
            top: 0,
            left: 0,
            height: 1,
            display: 'none',
            position: 'fixed',
            flexDirection: 'column',
            zIndex: 'var(--layout-nav-zIndex)',
            width: 'var(--layout-nav-vertical-width)',
            borderRight: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
            [theme.breakpoints.up(layoutQuery)]: {
                display: 'flex',
            },
            ...sx,
        }, children: _jsx(NavContent, { data: data, slots: slots, workspaces: workspaces }) }));
}
// ----------------------------------------------------------------------
export function NavMobile({ sx, data, open, slots, onClose, workspaces, }) {
    const pathname = usePathname();
    useEffect(() => {
        if (open) {
            onClose();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);
    return (_jsx(Drawer, { open: open, onClose: onClose, sx: {
            [`& .${drawerClasses.paper}`]: {
                pt: 2.5,
                px: 2.5,
                overflow: 'unset',
                width: 'var(--layout-nav-mobile-width)',
                ...sx,
            },
        }, children: _jsx(NavContent, { data: data, slots: slots, workspaces: workspaces }) }));
}
// ----------------------------------------------------------------------
export function NavContent({ data, slots, workspaces, sx }) {
    const pathname = usePathname();
    return (_jsxs(_Fragment, { children: [_jsx(Logo, {}), slots?.topArea, _jsx(Scrollbar, { fillContent: true, sx: { my: 2 }, children: _jsx(Box, { component: "nav", sx: [
                        {
                            display: 'flex',
                            flex: '1 1 auto',
                            flexDirection: 'column',
                        },
                        ...(Array.isArray(sx) ? sx : [sx]),
                    ], children: _jsx(Box, { component: "ul", sx: {
                            gap: 0.5,
                            display: 'flex',
                            flexDirection: 'column',
                        }, children: data.map((item) => {
                            const isActived = item.path === pathname;
                            return (_jsx(ListItem, { disableGutters: true, disablePadding: true, children: _jsxs(ListItemButton, { disableGutters: true, component: RouterLink, href: item.path, sx: [
                                        (theme) => ({
                                            pl: 2,
                                            py: 1,
                                            gap: 2,
                                            pr: 1.5,
                                            borderRadius: 0.75,
                                            typography: 'body2',
                                            fontWeight: 'fontWeightMedium',
                                            color: theme.vars.palette.text.secondary,
                                            minHeight: 44,
                                            ...(isActived && {
                                                fontWeight: 'fontWeightSemiBold',
                                                color: theme.vars.palette.primary.main,
                                                bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                                                '&:hover': {
                                                    bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
                                                },
                                            }),
                                        }),
                                    ], children: [_jsx(Box, { component: "span", sx: { width: 24, height: 24 }, children: item.icon }), _jsx(Box, { component: "span", sx: { flexGrow: 1 }, children: item.title }), item.info && item.info] }) }, item.title));
                        }) }) }) }), slots?.bottomArea] }));
}
