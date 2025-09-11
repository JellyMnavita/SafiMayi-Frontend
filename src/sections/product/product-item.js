import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fCurrency } from '../../utils/format-number';
import { Label } from '../../components/label';
import { ColorPreview } from '../../components/color-utils';
export function ProductItem({ product }) {
    const renderStatus = (_jsx(Label, { variant: "inverted", color: (product.status === 'sale' && 'error') || 'info', sx: {
            zIndex: 9,
            top: 16,
            right: 16,
            position: 'absolute',
            textTransform: 'uppercase',
        }, children: product.status }));
    const renderImg = (_jsx(Box, { component: "img", alt: product.name, src: product.coverUrl, sx: {
            top: 0,
            width: 1,
            height: 1,
            objectFit: 'cover',
            position: 'absolute',
        } }));
    const renderPrice = (_jsxs(Typography, { variant: "subtitle1", children: [_jsx(Typography, { component: "span", variant: "body1", sx: {
                    color: 'text.disabled',
                    textDecoration: 'line-through',
                }, children: product.priceSale && fCurrency(product.priceSale) }), "\u00A0", fCurrency(product.price)] }));
    return (_jsxs(Card, { children: [_jsxs(Box, { sx: { pt: '100%', position: 'relative' }, children: [product.status && renderStatus, renderImg] }), _jsxs(Stack, { spacing: 2, sx: { p: 3 }, children: [_jsx(Link, { color: "inherit", underline: "hover", variant: "subtitle2", noWrap: true, children: product.name }), _jsxs(Box, { sx: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }, children: [_jsx(ColorPreview, { colors: product.colors }), renderPrice] })] })] }));
}
