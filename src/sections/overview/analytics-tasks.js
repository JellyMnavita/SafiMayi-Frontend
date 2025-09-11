import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { usePopover } from 'minimal-shared/hooks';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { Iconify } from '../../components/iconify';
import { Scrollbar } from '../../components/scrollbar';
export function AnalyticsTasks({ title, subheader, list, sx, ...other }) {
    const [selected, setSelected] = useState(['2']);
    const handleClickComplete = (taskId) => {
        const tasksCompleted = selected.includes(taskId)
            ? selected.filter((value) => value !== taskId)
            : [...selected, taskId];
        setSelected(tasksCompleted);
    };
    return (_jsxs(Card, { sx: sx, ...other, children: [_jsx(CardHeader, { title: title, subheader: subheader, sx: { mb: 1 } }), _jsx(Scrollbar, { sx: { minHeight: 304 }, children: _jsx(Stack, { divider: _jsx(Divider, { sx: { borderStyle: 'dashed' } }), sx: { minWidth: 560 }, children: list.map((item) => (_jsx(TaskItem, { item: item, selected: selected.includes(item.id), onChange: () => handleClickComplete(item.id) }, item.id))) }) })] }));
}
function TaskItem({ item, selected, onChange, sx, ...other }) {
    const menuActions = usePopover();
    const handleMarkComplete = () => {
        menuActions.onClose();
        console.info('MARK COMPLETE', item.id);
    };
    const handleShare = () => {
        menuActions.onClose();
        console.info('SHARE', item.id);
    };
    const handleEdit = () => {
        menuActions.onClose();
        console.info('EDIT', item.id);
    };
    const handleDelete = () => {
        menuActions.onClose();
        console.info('DELETE', item.id);
    };
    return (_jsxs(_Fragment, { children: [_jsxs(Box, { sx: [
                    () => ({
                        pl: 2,
                        pr: 1,
                        py: 1.5,
                        display: 'flex',
                        ...(selected && {
                            color: 'text.disabled',
                            textDecoration: 'line-through',
                        }),
                    }),
                    ...(Array.isArray(sx) ? sx : [sx]),
                ], ...other, children: [_jsx(FormControlLabel, { label: item.name, control: _jsx(Checkbox, { disableRipple: true, checked: selected, onChange: onChange, slotProps: { input: { id: `${item.name}-checkbox` } } }), sx: { flexGrow: 1, m: 0 } }), _jsx(IconButton, { color: menuActions.open ? 'inherit' : 'default', onClick: menuActions.onOpen, children: _jsx(Iconify, { icon: "eva:more-vertical-fill" }) })] }), _jsx(Popover, { open: menuActions.open, anchorEl: menuActions.anchorEl, onClose: menuActions.onClose, anchorOrigin: { vertical: 'bottom', horizontal: 'right' }, transformOrigin: { vertical: 'top', horizontal: 'right' }, children: _jsxs(MenuList, { disablePadding: true, sx: {
                        p: 0.5,
                        gap: 0.5,
                        display: 'flex',
                        flexDirection: 'column',
                        [`& .${menuItemClasses.root}`]: {
                            pl: 1,
                            pr: 2,
                            gap: 2,
                            borderRadius: 0.75,
                            [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
                        },
                    }, children: [_jsxs(MenuItem, { onClick: handleMarkComplete, children: [_jsx(Iconify, { icon: "solar:check-circle-bold" }), "Mark complete"] }), _jsxs(MenuItem, { onClick: handleEdit, children: [_jsx(Iconify, { icon: "solar:pen-bold" }), "Edit"] }), _jsxs(MenuItem, { onClick: handleShare, children: [_jsx(Iconify, { icon: "solar:share-bold" }), "Share"] }), _jsx(Divider, { sx: { borderStyle: 'dashed' } }), _jsxs(MenuItem, { onClick: handleDelete, sx: { color: 'error.main' }, children: [_jsx(Iconify, { icon: "solar:trash-bin-trash-bold" }), "Delete"] })] }) })] }));
}
