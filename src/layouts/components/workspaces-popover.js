import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import ButtonBase from '@mui/material/ButtonBase';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { Label } from '../../components/label';
import { Iconify } from '../../components/iconify';
export function WorkspacesPopover({ data = [], sx, ...other }) {
    const [workspace, setWorkspace] = useState(data[0]);
    const [openPopover, setOpenPopover] = useState(null);
    const handleOpenPopover = useCallback((event) => {
        setOpenPopover(event.currentTarget);
    }, []);
    const handleClosePopover = useCallback(() => {
        setOpenPopover(null);
    }, []);
    const handleChangeWorkspace = useCallback((newValue) => {
        setWorkspace(newValue);
        handleClosePopover();
    }, [handleClosePopover]);
    const renderAvatar = (alt, src) => (_jsx(Box, { component: "img", alt: alt, src: src, sx: { width: 24, height: 24, borderRadius: '50%' } }));
    const renderLabel = (plan) => (_jsx(Label, { color: plan === 'Free' ? 'default' : 'info', children: plan }));
    return (_jsxs(_Fragment, { children: [_jsxs(ButtonBase, { disableRipple: true, onClick: handleOpenPopover, sx: {
                    pl: 2,
                    py: 3,
                    gap: 1.5,
                    pr: 1.5,
                    width: 1,
                    borderRadius: 1.5,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                    ...sx,
                }, ...other, children: [renderAvatar(workspace?.name, workspace?.logo), _jsxs(Box, { sx: {
                            gap: 1,
                            flexGrow: 1,
                            display: 'flex',
                            alignItems: 'center',
                            typography: 'body2',
                            fontWeight: 'fontWeightSemiBold',
                        }, children: [workspace?.name, renderLabel(workspace?.plan)] }), _jsx(Iconify, { width: 16, icon: "carbon:chevron-sort", sx: { color: 'text.disabled' } })] }), _jsx(Popover, { open: !!openPopover, anchorEl: openPopover, onClose: handleClosePopover, children: _jsx(MenuList, { disablePadding: true, sx: {
                        p: 0.5,
                        gap: 0.5,
                        width: 260,
                        display: 'flex',
                        flexDirection: 'column',
                        [`& .${menuItemClasses.root}`]: {
                            p: 1.5,
                            gap: 1.5,
                            borderRadius: 0.75,
                            [`&.${menuItemClasses.selected}`]: {
                                bgcolor: 'action.selected',
                                fontWeight: 'fontWeightSemiBold',
                            },
                        },
                    }, children: data.map((option) => (_jsxs(MenuItem, { selected: option.id === workspace?.id, onClick: () => handleChangeWorkspace(option), children: [renderAvatar(option.name, option.logo), _jsx(Box, { component: "span", sx: { flexGrow: 1 }, children: option.name }), renderLabel(option.plan)] }, option.id))) }) })] }));
}
