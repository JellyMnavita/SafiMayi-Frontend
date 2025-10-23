import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { varAlpha } from 'minimal-shared/utils';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { fShortenNumber } from '../../utils/format-number';
import { Iconify } from '../../components/iconify';
export function AnalyticsTrafficBySite({ title, subheader, list, sx, ...other }) {
    return (_jsxs(Card, { sx: sx, ...other, children: [_jsx(CardHeader, { title: title, subheader: subheader }), _jsx(Box, { sx: {
                    p: 3,
                    gap: 2,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                }, children: list.map((site) => (_jsxs(Box, { sx: (theme) => ({
                        py: 2.5,
                        display: 'flex',
                        borderRadius: 1.5,
                        textAlign: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
                    }), children: [site.value === 'twitter' && _jsx(Iconify, { width: 32, icon: "socials:twitter" }), site.value === 'facebook' && _jsx(Iconify, { width: 32, icon: "socials:facebook" }), site.value === 'google' && _jsx(Iconify, { width: 32, icon: "socials:google" }), site.value === 'linkedin' && _jsx(Iconify, { width: 32, icon: "socials:linkedin" }), _jsx(Typography, { variant: "h6", sx: { mt: 1 }, children: fShortenNumber(site.total) }), _jsx(Typography, { variant: "body2", sx: { color: 'text.secondary' }, children: site.label })] }, site.label))) })] }));
}
