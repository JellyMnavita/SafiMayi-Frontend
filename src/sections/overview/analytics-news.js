import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import ListItemText from '@mui/material/ListItemText';
import { fToNow } from '../../utils/format-time';
import { Iconify } from '../../components/iconify';
import { Scrollbar } from '../../components/scrollbar';
export function AnalyticsNews({ title, subheader, list, sx, ...other }) {
    return (_jsxs(Card, { sx: sx, ...other, children: [_jsx(CardHeader, { title: title, subheader: subheader, sx: { mb: 1 } }), _jsx(Scrollbar, { sx: { minHeight: 405 }, children: _jsx(Box, { sx: { minWidth: 640 }, children: list.map((item) => (_jsx(Item, { item: item }, item.id))) }) }), _jsx(Box, { sx: { p: 2, textAlign: 'right' }, children: _jsx(Button, { size: "small", color: "inherit", endIcon: _jsx(Iconify, { icon: "eva:arrow-ios-forward-fill", width: 18, sx: { ml: -0.5 } }), children: "View all" }) })] }));
}
function Item({ item, sx, ...other }) {
    return (_jsxs(Box, { sx: [
            (theme) => ({
                py: 2,
                px: 3,
                gap: 2,
                display: 'flex',
                alignItems: 'center',
                borderBottom: `dashed 1px ${theme.vars.palette.divider}`,
            }),
            ...(Array.isArray(sx) ? sx : [sx]),
        ], ...other, children: [_jsx(Avatar, { variant: "rounded", alt: item.title, src: item.coverUrl, sx: { width: 48, height: 48, flexShrink: 0 } }), _jsx(ListItemText, { primary: _jsx(Link, { color: "inherit", children: item.title }), secondary: item.description, slotProps: {
                    primary: { noWrap: true },
                    secondary: {
                        noWrap: true,
                        sx: { mt: 0.5 },
                    },
                } }), _jsx(Box, { sx: { flexShrink: 0, typography: 'caption', color: 'text.disabled' }, children: fToNow(item.postedAt) })] }));
}
