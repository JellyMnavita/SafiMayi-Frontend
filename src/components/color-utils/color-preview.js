import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { varAlpha, mergeClasses } from 'minimal-shared/utils';
import { styled } from '@mui/material/styles';
import { colorPreviewClasses } from './classes';
export function ColorPreview({ sx, colors, className, slotProps, gap = 6, limit = 3, size = 16, ...other }) {
    const colorsRange = colors.slice(0, limit);
    const remainingColorCount = colors.length - limit;
    return (_jsxs(ColorPreviewRoot, { className: mergeClasses([colorPreviewClasses.root, className]), sx: sx, ...other, children: [colorsRange.map((color, index) => (_jsx(ItemRoot, { className: colorPreviewClasses.item, ...slotProps?.item, sx: [
                    {
                        '--item-color': color,
                        '--item-size': `${size}px`,
                        '--item-gap': `${-gap}px`,
                    },
                    ...(Array.isArray(slotProps?.item?.sx)
                        ? (slotProps.item?.sx ?? [])
                        : [slotProps?.item?.sx]),
                ] }, color + index))), colors.length > limit && (_jsx(ItemLabel, { className: colorPreviewClasses.label, ...slotProps?.label, children: `+${remainingColorCount}` }))] }));
}
// ----------------------------------------------------------------------
const ColorPreviewRoot = styled('ul')(() => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
}));
const ItemRoot = styled('li')(({ theme }) => ({
    borderRadius: '50%',
    width: 'var(--item-size)',
    height: 'var(--item-size)',
    marginLeft: 'var(--item-gap)',
    backgroundColor: 'var(--item-color)',
    border: `solid 2px ${theme.vars.palette.background.paper}`,
    boxShadow: `inset -1px 1px 2px ${varAlpha(theme.vars.palette.common.blackChannel, 0.24)}`,
}));
const ItemLabel = styled('li')(({ theme }) => ({
    ...theme.typography.subtitle2,
}));
