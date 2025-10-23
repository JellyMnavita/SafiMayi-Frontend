import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { merge } from 'es-toolkit';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import { RouterLink } from '../../routes/components';
import { Logo } from '../../components/logo';
import { AuthContent } from './content';
import { MainSection } from '../core/main-section';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';
export function AuthLayout({ sx, cssVars, children, slotProps, layoutQuery = 'md', }) {
    const renderHeader = () => {
        const headerSlotProps = { container: { maxWidth: false } };
        const headerSlots = {
            topArea: (_jsx(Alert, { severity: "info", sx: { display: 'none', borderRadius: 0 }, children: "This is an info Alert." })),
            leftArea: (_jsx(_Fragment, { children: _jsx(Logo, {}) })),
            rightArea: (_jsx(Box, { sx: { display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }, children: _jsx(Link, { href: "#", component: RouterLink, color: "inherit", sx: { typography: 'subtitle2' }, children: "Need help?" }) })),
        };
        return (_jsx(HeaderSection, { disableElevation: true, layoutQuery: layoutQuery, ...slotProps?.header, slots: { ...headerSlots, ...slotProps?.header?.slots }, slotProps: merge(headerSlotProps, slotProps?.header?.slotProps ?? {}), sx: [
                { position: { [layoutQuery]: 'fixed' } },
                ...(Array.isArray(slotProps?.header?.sx)
                    ? (slotProps?.header?.sx ?? [])
                    : [slotProps?.header?.sx]),
            ] }));
    };
    const renderFooter = () => null;
    const renderMain = () => (_jsx(MainSection, { ...slotProps?.main, sx: [
            (theme) => ({
                alignItems: 'center',
                p: theme.spacing(3, 2, 10, 2),
                [theme.breakpoints.up(layoutQuery)]: {
                    justifyContent: 'center',
                    p: theme.spacing(10, 0, 10, 0),
                },
            }),
            ...(Array.isArray(slotProps?.main?.sx)
                ? (slotProps?.main?.sx ?? [])
                : [slotProps?.main?.sx]),
        ], children: _jsx(AuthContent, { ...slotProps?.content, children: children }) }));
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
         * @Footer
         *************************************** */
        footerSection: renderFooter(), 
        /** **************************************
         * @Styles
         *************************************** */
        cssVars: { '--layout-auth-content-width': '420px', ...cssVars }, children: renderMain() }));
}
// ----------------------------------------------------------------------
const backgroundStyles = () => ({
    zIndex: 1,
    opacity: 0.24,
    width: '100%',
    height: '100%',
    content: "''",
    position: 'absolute',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundImage: 'url(/assets/background/overlay.jpg)',
});
