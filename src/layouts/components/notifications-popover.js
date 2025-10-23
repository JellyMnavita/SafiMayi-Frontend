import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import { fToNow } from '../../utils/format-time';
import { Iconify } from '../../components/iconify';
import { Scrollbar } from '../../components/scrollbar';
export function NotificationsPopover({ data = [], sx, ...other }) {
    const [notifications, setNotifications] = useState(data);
    const totalUnRead = notifications.filter((item) => item.isUnRead === true).length - 2;
    const [openPopover, setOpenPopover] = useState(null);
    const handleOpenPopover = useCallback((event) => {
        setOpenPopover(event.currentTarget);
    }, []);
    const handleClosePopover = useCallback(() => {
        setOpenPopover(null);
    }, []);
    const handleMarkAllAsRead = useCallback(() => {
        const updatedNotifications = notifications.map((notification) => ({
            ...notification,
            isUnRead: false,
        }));
        setNotifications(updatedNotifications);
    }, [notifications]);
    return (_jsxs(_Fragment, { children: [_jsx(IconButton, { color: openPopover ? 'primary' : 'default', onClick: handleOpenPopover, sx: sx, ...other, children: _jsx(Badge, { badgeContent: totalUnRead, color: "error", children: _jsx(Iconify, { width: 24, icon: "solar:bell-bing-bold-duotone" }) }) }), _jsxs(Popover, { open: !!openPopover, anchorEl: openPopover, onClose: handleClosePopover, anchorOrigin: { vertical: 'bottom', horizontal: 'right' }, transformOrigin: { vertical: 'top', horizontal: 'right' }, slotProps: {
                    paper: {
                        sx: {
                            width: 360,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                        },
                    },
                }, children: [_jsxs(Box, { sx: {
                            py: 2,
                            pl: 2.5,
                            pr: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                        }, children: [_jsxs(Box, { sx: { flexGrow: 1 }, children: [_jsx(Typography, { variant: "subtitle1", children: "Notifications" }), _jsxs(Typography, { variant: "body2", sx: { color: 'text.secondary' }, children: ["You have ", totalUnRead, " unread messages"] })] }), totalUnRead > 0 && (_jsx(Tooltip, { title: " Mark all as read", children: _jsx(IconButton, { color: "primary", onClick: handleMarkAllAsRead, children: _jsx(Iconify, { icon: "eva:done-all-fill" }) }) }))] }), _jsx(Divider, { sx: { borderStyle: 'dashed' } }), _jsxs(Scrollbar, { fillContent: true, sx: { minHeight: 240, maxHeight: { xs: 360, sm: 'none' } }, children: [_jsx(List, { disablePadding: true, subheader: _jsx(ListSubheader, { disableSticky: true, sx: { py: 1, px: 2.5, typography: 'overline' }, children: "New" }), children: notifications.slice(0, 2).map((notification) => (_jsx(NotificationItem, { notification: notification }, notification.id))) }), _jsx(List, { disablePadding: true, subheader: _jsx(ListSubheader, { disableSticky: true, sx: { py: 1, px: 2.5, typography: 'overline' }, children: "Before that" }), children: notifications.slice(2, 5).map((notification) => (_jsx(NotificationItem, { notification: notification }, notification.id))) })] }), _jsx(Divider, { sx: { borderStyle: 'dashed' } }), _jsx(Box, { sx: { p: 1 }, children: _jsx(Button, { fullWidth: true, disableRipple: true, color: "inherit", children: "View all" }) })] })] }));
}
// ----------------------------------------------------------------------
function NotificationItem({ notification }) {
    const { avatarUrl, title } = renderContent(notification);
    return (_jsxs(ListItemButton, { sx: {
            py: 1.5,
            px: 2.5,
            mt: '1px',
            ...(notification.isUnRead && {
                bgcolor: 'action.selected',
            }),
        }, children: [_jsx(ListItemAvatar, { children: _jsx(Avatar, { sx: { bgcolor: 'background.neutral' }, children: avatarUrl }) }), _jsx(ListItemText, { primary: title, secondary: _jsxs(Typography, { variant: "caption", sx: {
                        mt: 0.5,
                        gap: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.disabled',
                    }, children: [_jsx(Iconify, { width: 14, icon: "solar:clock-circle-outline" }), fToNow(notification.postedAt)] }) })] }));
}
// ----------------------------------------------------------------------
function renderContent(notification) {
    const title = (_jsxs(Typography, { variant: "subtitle2", children: [notification.title, _jsxs(Typography, { component: "span", variant: "body2", sx: { color: 'text.secondary' }, children: ["\u00A0 ", notification.description] })] }));
    if (notification.type === 'order-placed') {
        return {
            avatarUrl: (_jsx("img", { alt: notification.title, src: "/assets/icons/notification/ic-notification-package.svg" })),
            title,
        };
    }
    if (notification.type === 'order-shipped') {
        return {
            avatarUrl: (_jsx("img", { alt: notification.title, src: "/assets/icons/notification/ic-notification-shipping.svg" })),
            title,
        };
    }
    if (notification.type === 'mail') {
        return {
            avatarUrl: (_jsx("img", { alt: notification.title, src: "/assets/icons/notification/ic-notification-mail.svg" })),
            title,
        };
    }
    if (notification.type === 'chat-message') {
        return {
            avatarUrl: (_jsx("img", { alt: notification.title, src: "/assets/icons/notification/ic-notification-chat.svg" })),
            title,
        };
    }
    return {
        avatarUrl: notification.avatarUrl ? (_jsx("img", { alt: notification.title, src: notification.avatarUrl })) : null,
        title,
    };
}
