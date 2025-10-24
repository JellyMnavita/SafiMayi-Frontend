import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { RouterLink } from '../../routes/components';
import { Logo } from '../../components/logo';
// ----------------------------------------------------------------------
export function ForbiddenView() {
    return (_jsxs(_Fragment, { children: [_jsx(Logo, { sx: { position: 'fixed', top: 20, left: 20 } }), _jsxs(Container, { sx: {
                    py: 10,
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }, children: [_jsx(Typography, { variant: "h3", sx: { mb: 2 }, children: "Acc\u00E8s refus\u00E9" }), _jsx(Typography, { sx: { color: 'text.secondary', maxWidth: 480, textAlign: 'center' }, children: "D\u00E9sol\u00E9, vous n'avez pas les autorisations n\u00E9cessaires pour acc\u00E9der \u00E0 cette page. Veuillez contacter votre administrateur si vous pensez qu'il s'agit d'une erreur." }), _jsx(Box, { component: "img", src: "/assets/illustrations/illustration-403.svg", sx: {
                            width: 320,
                            height: 'auto',
                            my: { xs: 5, sm: 10 },
                        } }), _jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsx(Button, { component: RouterLink, href: "/", size: "large", variant: "contained", color: "inherit", children: "Page d'accueil" }), _jsx(Button, { component: "a", href: "mailto:safimayi0@gmail.com", size: "large", variant: "outlined", color: "primary", children: "Contacter le support" })] })] })] }));
}
