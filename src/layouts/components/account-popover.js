import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { useRouter, usePathname } from '../../routes/hooks';
import { _myAccount } from '../../_mock';
export function AccountPopover({ data = [], sx, ...other }) {
    const router = useRouter();
    const pathname = usePathname();
    const [openPopover, setOpenPopover] = useState(null);
    const handleOpenPopover = useCallback((event) => {
        setOpenPopover(event.currentTarget);
    }, []);
    const handleClosePopover = useCallback(() => {
        setOpenPopover(null);
    }, []);
    const handleClickItem = useCallback((path) => {
        handleClosePopover();
        router.push(path);
    }, [handleClosePopover, router]);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return (_jsxs(_Fragment, { children: [_jsx(IconButton, { onClick: handleOpenPopover, sx: {
                    p: '2px',
                    width: 40,
                    height: 40,
                    background: (theme) => `conic-gradient(${theme.vars.palette.primary.light}, ${theme.vars.palette.warning.light}, ${theme.vars.palette.primary.light})`,
                    ...sx,
                }, ...other, children: _jsx(Avatar, { src: _myAccount.photoURL, alt: _myAccount.displayName, sx: { width: 1, height: 1 }, children: _myAccount.displayName.charAt(0).toUpperCase() }) }), _jsxs(Popover, { open: !!openPopover, anchorEl: openPopover, onClose: handleClosePopover, anchorOrigin: { vertical: 'bottom', horizontal: 'right' }, transformOrigin: { vertical: 'top', horizontal: 'right' }, slotProps: {
                    paper: {
                        sx: { width: 200 },
                    },
                }, children: [_jsxs(Box, { sx: { p: 2, pb: 1.5 }, children: [_jsx(Typography, { variant: "subtitle2", noWrap: true, children: user.nom || user.username || '' }), _jsx(Typography, { variant: "body2", sx: { color: 'text.secondary' }, noWrap: true, children: user.email || '' })] }), _jsx(Divider, { sx: { borderStyle: 'dashed' } }), _jsx(MenuList, { disablePadding: true, sx: {
                            p: 1,
                            gap: 0.5,
                            display: 'flex',
                            flexDirection: 'column',
                            [`& .${menuItemClasses.root}`]: {
                                px: 1,
                                gap: 2,
                                borderRadius: 0.75,
                                color: 'text.secondary',
                                '&:hover': { color: 'text.primary' },
                                [`&.${menuItemClasses.selected}`]: {
                                    color: 'text.primary',
                                    bgcolor: 'action.selected',
                                    fontWeight: 'fontWeightSemiBold',
                                },
                            },
                        }, children: data.map((option) => (_jsxs(MenuItem, { selected: option.href === pathname, onClick: () => handleClickItem(option.href), children: [option.icon, option.label] }, option.label))) }), _jsx(Divider, { sx: { borderStyle: 'dashed' } }), _jsx(Box, { sx: { p: 1 }, children: _jsx(Button, { fullWidth: true, color: "error", href: "/", size: "medium", variant: "text", children: "Logout" }) })] })] }));
}
