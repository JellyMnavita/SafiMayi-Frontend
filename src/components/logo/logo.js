import { jsx as _jsx } from "react/jsx-runtime";
import { mergeClasses } from 'minimal-shared/utils';
import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';
import { RouterLink } from '../../routes/components';
import { logoClasses } from './classes';
export function Logo({ sx, disabled, className, href = '/', isSingle = true, ...other }) {
    const singleLogo = (_jsx("img", { src: "/logobleuSafimayi.png", alt: "" }));
    const fullLogo = (_jsx("img", { src: "/logobleuSafimayi.png", alt: "" }));
    return (_jsx(LogoRoot, { component: RouterLink, href: href, "aria-label": "Logo", underline: "none", className: mergeClasses([logoClasses.root, className]), sx: [
            {
                width: 150,
                ...(!isSingle && { width: 120 }),
                ...(disabled && { pointerEvents: 'none' }),
            },
            ...(Array.isArray(sx) ? sx : [sx]),
        ], ...other, children: isSingle ? singleLogo : fullLogo }));
}
// ----------------------------------------------------------------------
const LogoRoot = styled(Link)(() => ({
    flexShrink: 0,
    color: 'transparent',
    display: 'inline-flex',
    verticalAlign: 'middle',
}));
