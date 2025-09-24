import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { Iconify } from '../../components/iconify';
export function ProductSort({ options, sortBy, onSort, sx, ...other }) {
    const [openPopover, setOpenPopover] = useState(null);
    const handleOpenPopover = useCallback((event) => {
        setOpenPopover(event.currentTarget);
    }, []);
    const handleClosePopover = useCallback(() => {
        setOpenPopover(null);
    }, []);
    return (_jsxs(_Fragment, { children: [_jsxs(Button, { disableRipple: true, color: "inherit", onClick: handleOpenPopover, endIcon: _jsx(Iconify, { icon: openPopover ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill' }), sx: sx, ...other, children: ["Sort By:\u00A0", _jsx(Typography, { component: "span", variant: "subtitle2", sx: { color: 'text.secondary' }, children: options.find((option) => option.value === sortBy)?.label })] }), _jsx(Popover, { open: !!openPopover, anchorEl: openPopover, onClose: handleClosePopover, anchorOrigin: { vertical: 'bottom', horizontal: 'right' }, transformOrigin: { vertical: 'top', horizontal: 'right' }, children: _jsx(MenuList, { disablePadding: true, sx: {
                        p: 0.5,
                        gap: 0.5,
                        width: 160,
                        display: 'flex',
                        flexDirection: 'column',
                        [`& .${menuItemClasses.root}`]: {
                            px: 1,
                            gap: 2,
                            borderRadius: 0.75,
                            [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
                        },
                    }, children: options.map((option) => (_jsx(MenuItem, { selected: option.value === sortBy, onClick: () => {
                            onSort(option.value);
                            handleClosePopover();
                        }, children: option.label }, option.value))) }) })] }));
}
