import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { varAlpha } from 'minimal-shared/utils';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import { SvgColor } from '../../components/svg-color';
export function AnalyticsWidgetSummary({ sx, icon, title, total, color = 'primary', ...other }) {
    const theme = useTheme();
    return (_jsxs(Card, { sx: [
            () => ({
                p: 3,
                boxShadow: 'none',
                position: 'relative',
                color: `${color}.darker`,
                backgroundColor: 'common.white',
                backgroundImage: `linear-gradient(135deg, ${varAlpha(theme.vars.palette[color].lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette[color].lightChannel, 0.48)})`,
            }),
            ...(Array.isArray(sx) ? sx : [sx]),
        ], ...other, children: [_jsx(Box, { sx: { width: 48, height: 48, mb: 3 }, children: icon }), _jsx(Box, { sx: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                }, children: _jsxs(Box, { sx: { flexGrow: 1, minWidth: 112 }, children: [_jsx(Box, { sx: { mb: 1, typography: 'subtitle2' }, children: title }), _jsx(Box, { sx: { typography: 'h4' }, children: total })] }) }), _jsx(SvgColor, { src: "/assets/background/shape-square.svg", sx: {
                    top: 0,
                    left: -20,
                    width: 240,
                    zIndex: -1,
                    height: 240,
                    opacity: 0.24,
                    position: 'absolute',
                    color: `${color}.main`,
                } })] }));
}
