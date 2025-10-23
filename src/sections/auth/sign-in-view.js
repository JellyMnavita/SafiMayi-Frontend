import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { useRouter } from '../../routes/hooks';
import { Iconify } from '../../components/iconify';
// ----------------------------------------------------------------------
export function SignInView() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const handleSignIn = useCallback(() => {
        router.push('/');
    }, [router]);
    const renderForm = (_jsxs(Box, { sx: {
            display: 'flex',
            alignItems: 'flex-end',
            flexDirection: 'column',
        }, children: [_jsx(TextField, { fullWidth: true, name: "email", label: "Email address", defaultValue: "hello@gmail.com", sx: { mb: 3 }, slotProps: {
                    inputLabel: { shrink: true },
                } }), _jsx(Link, { variant: "body2", color: "inherit", sx: { mb: 1.5 }, children: "Forgot password?" }), _jsx(TextField, { fullWidth: true, name: "password", label: "Password", defaultValue: "@demo1234", type: showPassword ? 'text' : 'password', slotProps: {
                    inputLabel: { shrink: true },
                    input: {
                        endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(IconButton, { onClick: () => setShowPassword(!showPassword), edge: "end", children: _jsx(Iconify, { icon: showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold' }) }) })),
                    },
                }, sx: { mb: 3 } }), _jsx(Button, { fullWidth: true, size: "large", type: "submit", color: "inherit", variant: "contained", onClick: handleSignIn, children: "Sign in" })] }));
    return (_jsxs(_Fragment, { children: [_jsxs(Box, { sx: {
                    gap: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 5,
                }, children: [_jsx(Typography, { variant: "h5", children: "Sign in" }), _jsxs(Typography, { variant: "body2", sx: {
                            color: 'text.secondary',
                        }, children: ["Don\u2019t have an account?", _jsx(Link, { variant: "subtitle2", sx: { ml: 0.5 }, children: "Get started" })] })] }), renderForm, _jsx(Divider, { sx: { my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }, children: _jsx(Typography, { variant: "overline", sx: { color: 'text.secondary', fontWeight: 'fontWeightMedium' }, children: "OR" }) }), _jsxs(Box, { sx: {
                    gap: 1,
                    display: 'flex',
                    justifyContent: 'center',
                }, children: [_jsx(IconButton, { color: "inherit", children: _jsx(Iconify, { width: 22, icon: "socials:google" }) }), _jsx(IconButton, { color: "inherit", children: _jsx(Iconify, { width: 22, icon: "socials:github" }) }), _jsx(IconButton, { color: "inherit", children: _jsx(Iconify, { width: 22, icon: "socials:twitter" }) })] })] }));
}
