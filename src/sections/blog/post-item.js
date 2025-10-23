import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { varAlpha } from 'minimal-shared/utils';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { fDate } from '../../utils/format-time';
import { fShortenNumber } from '../../utils/format-number';
import { Iconify } from '../../components/iconify';
import { SvgColor } from '../../components/svg-color';
export function PostItem({ sx, post, latestPost, latestPostLarge, ...other }) {
    const renderAvatar = (_jsx(Avatar, { alt: post.author.name, src: post.author.avatarUrl, sx: {
            left: 24,
            zIndex: 9,
            bottom: -24,
            position: 'absolute',
            ...((latestPostLarge || latestPost) && {
                top: 24,
            }),
        } }));
    const renderTitle = (_jsx(Link, { color: "inherit", variant: "subtitle2", underline: "hover", sx: {
            height: 44,
            overflow: 'hidden',
            WebkitLineClamp: 2,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            ...(latestPostLarge && { typography: 'h5', height: 60 }),
            ...((latestPostLarge || latestPost) && {
                color: 'common.white',
            }),
        }, children: post.title }));
    const renderInfo = (_jsx(Box, { sx: {
            mt: 3,
            gap: 1.5,
            display: 'flex',
            flexWrap: 'wrap',
            color: 'text.disabled',
            justifyContent: 'flex-end',
        }, children: [
            { number: post.totalComments, icon: 'solar:chat-round-dots-bold' },
            { number: post.totalViews, icon: 'solar:eye-bold' },
            { number: post.totalShares, icon: 'solar:share-bold' },
        ].map((info, _index) => (_jsxs(Box, { sx: {
                display: 'flex',
                ...((latestPostLarge || latestPost) && {
                    opacity: 0.64,
                    color: 'common.white',
                }),
            }, children: [_jsx(Iconify, { width: 16, icon: info.icon, sx: { mr: 0.5 } }), _jsx(Typography, { variant: "caption", children: fShortenNumber(info.number) })] }, _index))) }));
    const renderCover = (_jsx(Box, { component: "img", alt: post.title, src: post.coverUrl, sx: {
            top: 0,
            width: 1,
            height: 1,
            objectFit: 'cover',
            position: 'absolute',
        } }));
    const renderDate = (_jsx(Typography, { variant: "caption", component: "div", sx: {
            mb: 1,
            color: 'text.disabled',
            ...((latestPostLarge || latestPost) && {
                opacity: 0.48,
                color: 'common.white',
            }),
        }, children: fDate(post.postedAt) }));
    const renderShape = (_jsx(SvgColor, { src: "/assets/icons/shape-avatar.svg", sx: {
            left: 0,
            width: 88,
            zIndex: 9,
            height: 36,
            bottom: -16,
            position: 'absolute',
            color: 'background.paper',
            ...((latestPostLarge || latestPost) && { display: 'none' }),
        } }));
    return (_jsxs(Card, { sx: sx, ...other, children: [_jsxs(Box, { sx: (theme) => ({
                    position: 'relative',
                    pt: 'calc(100% * 3 / 4)',
                    ...((latestPostLarge || latestPost) && {
                        pt: 'calc(100% * 4 / 3)',
                        '&:after': {
                            top: 0,
                            content: "''",
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            bgcolor: varAlpha(theme.palette.grey['900Channel'], 0.72),
                        },
                    }),
                    ...(latestPostLarge && {
                        pt: {
                            xs: 'calc(100% * 4 / 3)',
                            sm: 'calc(100% * 3 / 4.66)',
                        },
                    }),
                }), children: [renderShape, renderAvatar, renderCover] }), _jsxs(Box, { sx: (theme) => ({
                    p: theme.spacing(6, 3, 3, 3),
                    ...((latestPostLarge || latestPost) && {
                        width: 1,
                        bottom: 0,
                        position: 'absolute',
                    }),
                }), children: [renderDate, renderTitle, renderInfo] })] }));
}
