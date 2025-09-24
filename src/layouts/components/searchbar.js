import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import Input from '@mui/material/Input';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { Iconify } from '../../components/iconify';
// ----------------------------------------------------------------------
export function Searchbar({ sx, ...other }) {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const handleOpen = useCallback(() => {
        setOpen((prev) => !prev);
    }, []);
    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);
    return (_jsx(ClickAwayListener, { onClickAway: handleClose, children: _jsxs("div", { children: [!open && (_jsx(IconButton, { onClick: handleOpen, children: _jsx(Iconify, { icon: "eva:search-fill" }) })), _jsx(Slide, { direction: "down", in: open, mountOnEnter: true, unmountOnExit: true, children: _jsxs(Box, { sx: {
                            top: 0,
                            left: 0,
                            zIndex: 99,
                            width: '100%',
                            display: 'flex',
                            position: 'absolute',
                            alignItems: 'center',
                            px: { xs: 3, md: 5 },
                            boxShadow: theme.vars.customShadows.z8,
                            height: {
                                xs: 'var(--layout-header-mobile-height)',
                                md: 'var(--layout-header-desktop-height)',
                            },
                            backdropFilter: `blur(6px)`,
                            WebkitBackdropFilter: `blur(6px)`,
                            backgroundColor: varAlpha(theme.vars.palette.background.defaultChannel, 0.8),
                            ...sx,
                        }, ...other, children: [_jsx(Input, { autoFocus: true, fullWidth: true, disableUnderline: true, placeholder: "Search\u2026", startAdornment: _jsx(InputAdornment, { position: "start", children: _jsx(Iconify, { width: 20, icon: "eva:search-fill", sx: { color: 'text.disabled' } }) }), sx: { fontWeight: 'fontWeightBold' } }), _jsx(Button, { variant: "contained", onClick: handleClose, children: "Search" })] }) })] }) }));
}
