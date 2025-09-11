import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { usePopover } from 'minimal-shared/hooks';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
export function LanguagePopover({ data = [], sx, ...other }) {
    const { open, anchorEl, onClose, onOpen } = usePopover();
    const [locale, setLocale] = useState(data[0].value);
    const handleChangeLang = useCallback((newLang) => {
        setLocale(newLang);
        onClose();
    }, [onClose]);
    const currentLang = data.find((lang) => lang.value === locale);
    const renderFlag = (label, icon) => (_jsx(Box, { component: "img", alt: label, src: icon, sx: { width: 26, height: 20, borderRadius: 0.5, objectFit: 'cover' } }));
    const renderMenuList = () => (_jsx(Popover, { open: open, anchorEl: anchorEl, onClose: onClose, anchorOrigin: { vertical: 'bottom', horizontal: 'right' }, transformOrigin: { vertical: 'top', horizontal: 'right' }, children: _jsx(MenuList, { sx: {
                p: 0.5,
                gap: 0.5,
                width: 160,
                minHeight: 72,
                display: 'flex',
                flexDirection: 'column',
                [`& .${menuItemClasses.root}`]: {
                    px: 1,
                    gap: 2,
                    borderRadius: 0.75,
                    [`&.${menuItemClasses.selected}`]: {
                        bgcolor: 'action.selected',
                        fontWeight: 'fontWeightSemiBold',
                    },
                },
            }, children: data?.map((option) => (_jsxs(MenuItem, { selected: option.value === currentLang?.value, onClick: () => handleChangeLang(option.value), children: [renderFlag(option.label, option.icon), option.label] }, option.value))) }) }));
    return (_jsxs(_Fragment, { children: [_jsx(IconButton, { "aria-label": "Languages button", onClick: onOpen, sx: [
                    (theme) => ({
                        p: 0,
                        width: 40,
                        height: 40,
                        ...(open && { bgcolor: theme.vars.palette.action.selected }),
                    }),
                    ...(Array.isArray(sx) ? sx : [sx]),
                ], ...other, children: renderFlag(currentLang?.label, currentLang?.icon) }), renderMenuList()] }));
}
