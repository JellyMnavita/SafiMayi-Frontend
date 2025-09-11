import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { Label } from '../../components/label';
import { Iconify } from '../../components/iconify';
export function UserTableRow({ row, selected, onSelectRow }) {
    const [openPopover, setOpenPopover] = useState(null);
    const handleOpenPopover = useCallback((event) => {
        setOpenPopover(event.currentTarget);
    }, []);
    const handleClosePopover = useCallback(() => {
        setOpenPopover(null);
    }, []);
    return (_jsxs(_Fragment, { children: [_jsxs(TableRow, { hover: true, tabIndex: -1, role: "checkbox", selected: selected, children: [_jsx(TableCell, { padding: "checkbox", children: _jsx(Checkbox, { disableRipple: true, checked: selected, onChange: onSelectRow }) }), _jsx(TableCell, { component: "th", scope: "row", children: _jsxs(Box, { sx: {
                                gap: 2,
                                display: 'flex',
                                alignItems: 'center',
                            }, children: [_jsx(Avatar, { alt: row.name, src: row.avatarUrl }), row.name] }) }), _jsx(TableCell, { children: row.company }), _jsx(TableCell, { children: row.role }), _jsx(TableCell, { align: "center", children: row.isVerified ? (_jsx(Iconify, { width: 22, icon: "solar:check-circle-bold", sx: { color: 'success.main' } })) : ('-') }), _jsx(TableCell, { children: _jsx(Label, { color: (row.status === 'banned' && 'error') || 'success', children: row.status }) }), _jsx(TableCell, { align: "right", children: _jsx(IconButton, { onClick: handleOpenPopover, children: _jsx(Iconify, { icon: "eva:more-vertical-fill" }) }) })] }), _jsx(Popover, { open: !!openPopover, anchorEl: openPopover, onClose: handleClosePopover, anchorOrigin: { vertical: 'top', horizontal: 'left' }, transformOrigin: { vertical: 'top', horizontal: 'right' }, children: _jsxs(MenuList, { disablePadding: true, sx: {
                        p: 0.5,
                        gap: 0.5,
                        width: 140,
                        display: 'flex',
                        flexDirection: 'column',
                        [`& .${menuItemClasses.root}`]: {
                            px: 1,
                            gap: 2,
                            borderRadius: 0.75,
                            [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
                        },
                    }, children: [_jsxs(MenuItem, { onClick: handleClosePopover, children: [_jsx(Iconify, { icon: "solar:pen-bold" }), "Edit"] }), _jsxs(MenuItem, { onClick: handleClosePopover, sx: { color: 'error.main' }, children: [_jsx(Iconify, { icon: "solar:trash-bin-trash-bold" }), "Delete"] })] }) })] }));
}
