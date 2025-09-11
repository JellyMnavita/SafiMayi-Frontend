import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { RouterLink } from '../../routes/components';
import { Logo } from '../../components/logo';
// ----------------------------------------------------------------------
export function NotFoundView() {
    return (_jsxs(_Fragment, { children: [_jsx(Logo, { sx: { position: 'fixed', top: 20, left: 20 } }), _jsxs(Container, { sx: {
                    py: 10,
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    justifyContent: 'center',
                }, children: [_jsx(Typography, { variant: "h3", sx: { mb: 2 }, children: "Sorry, page not found!" }), _jsx(Typography, { sx: { color: 'text.secondary', maxWidth: 480, textAlign: 'center' }, children: "Sorry, we couldn\u2019t find the page you\u2019re looking for. Perhaps you\u2019ve mistyped the URL? Be sure to check your spelling." }), _jsx(Box, { component: "img", src: "/assets/illustrations/illustration-404.svg", sx: {
                            width: 320,
                            height: 'auto',
                            my: { xs: 5, sm: 10 },
                        } }), _jsx(Button, { component: RouterLink, href: "/", size: "large", variant: "contained", color: "inherit", children: "Go to home" })] })] }));
}
