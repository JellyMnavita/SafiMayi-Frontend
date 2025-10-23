import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { merge } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { NavMobile, NavDesktop } from './nav';
import { layoutClasses } from '../core/classes';
import { _account } from '../nav-config-account';
import { dashboardLayoutVars } from './css-vars';
import { navConfig } from '../nav-config-dashboard';
import { MainSection } from '../core/main-section';
import { _workspaces } from '../nav-config-workspace';
import { MenuButton } from '../components/menu-button';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { AccountPopover } from '../components/account-popover';
export function DashboardLayout({ sx, cssVars, children, slotProps, layoutQuery = 'lg', }) {
    const theme = useTheme();
    const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();
    const renderHeader = () => {
        const headerSlotProps = {
            container: {
                maxWidth: false,
            },
        };
        const headerSlots = {
            topArea: (_jsx(Alert, { severity: "info", sx: { display: 'none', borderRadius: 0 }, children: "This is an info Alert." })),
            leftArea: (_jsxs(_Fragment, { children: [_jsx(MenuButton, { onClick: onOpen, sx: { mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } } }), _jsx(NavMobile, { data: navConfig, open: open, onClose: onClose, workspaces: _workspaces })] })),
            rightArea: (_jsx(Box, { sx: { display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }, children: _jsx(AccountPopover, { data: _account }) })),
        };
        return (_jsx(HeaderSection, { disableElevation: true, layoutQuery: layoutQuery, ...slotProps?.header, slots: { ...headerSlots, ...slotProps?.header?.slots }, slotProps: merge(headerSlotProps, slotProps?.header?.slotProps ?? {}), sx: slotProps?.header?.sx }));
    };
    const renderFooter = () => null;
    const renderMain = () => _jsx(MainSection, { ...slotProps?.main, children: children });
    return (_jsx(LayoutSection
    /** **************************************
     * @Header
     *************************************** */
    , { 
        /** **************************************
         * @Header
         *************************************** */
        headerSection: renderHeader(), 
        /** **************************************
         * @Sidebar
         *************************************** */
        sidebarSection: _jsx(NavDesktop, { data: navConfig, layoutQuery: layoutQuery, workspaces: _workspaces }), 
        /** **************************************
         * @Footer
         *************************************** */
        footerSection: renderFooter(), 
        /** **************************************
         * @Styles
         *************************************** */
        cssVars: { ...dashboardLayoutVars(theme), ...cssVars }, sx: [
            {
                [`& .${layoutClasses.sidebarContainer}`]: {
                    [theme.breakpoints.up(layoutQuery)]: {
                        pl: 'var(--layout-nav-vertical-width)',
                        transition: theme.transitions.create(['padding-left'], {
                            easing: 'var(--layout-transition-easing)',
                            duration: 'var(--layout-transition-duration)',
                        }),
                    },
                },
            },
            ...(Array.isArray(sx) ? sx : [sx]),
        ], children: renderMain() }));
}
