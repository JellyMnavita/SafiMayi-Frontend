import { jsx as _jsx } from "react/jsx-runtime";
import { mergeClasses } from 'minimal-shared/utils';
import Box from '@mui/material/Box';
import { layoutClasses } from '../core/classes';
export function AuthContent({ sx, children, className, ...other }) {
    return (_jsx(Box, { className: mergeClasses([layoutClasses.content, className]), sx: [
            (theme) => ({
                py: 5,
                px: 3,
                width: 1,
                zIndex: 2,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                maxWidth: 'var(--layout-auth-content-width)',
                bgcolor: theme.vars.palette.background.default,
            }),
            ...(Array.isArray(sx) ? sx : [sx]),
        ], ...other, children: children }));
}
