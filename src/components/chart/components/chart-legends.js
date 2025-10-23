import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { mergeClasses } from 'minimal-shared/utils';
import { styled } from '@mui/material/styles';
import { chartClasses } from '../classes';
export function ChartLegends({ sx, className, slotProps, icons = [], values = [], labels = [], colors = [], sublabels = [], ...other }) {
    return (_jsx(ListRoot, { className: mergeClasses([chartClasses.legends.root, className]), sx: sx, ...other, children: labels.map((series, index) => (_jsxs(ItemWrap, { className: chartClasses.legends.item.wrap, sx: [
                {
                    '--icon-color': colors[index],
                    ...slotProps?.wrapper,
                },
                ...(Array.isArray(slotProps?.wrapper?.sx)
                    ? (slotProps?.wrapper?.sx ?? [])
                    : [slotProps?.wrapper?.sx]),
            ], children: [_jsxs(ItemRoot, { className: chartClasses.legends.item.root, ...slotProps?.root, children: [icons.length ? (_jsx(ItemIcon, { className: chartClasses.legends.item.icon, ...slotProps?.icon, children: icons[index] })) : (_jsx(ItemDot, { className: chartClasses.legends.item.dot, ...slotProps?.dot })), _jsxs(ItemLabel, { className: chartClasses.legends.item.label, ...slotProps?.label, children: [series, !!sublabels.length && _jsxs(_Fragment, { children: [" ", ` (${sublabels[index]})`] })] })] }), values && (_jsx(ItemValue, { className: chartClasses.legends.item.value, ...slotProps?.value, children: values[index] }))] }, series))) }));
}
// ----------------------------------------------------------------------
const ListRoot = styled('ul')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
}));
const ItemWrap = styled('li')(() => ({
    display: 'inline-flex',
    flexDirection: 'column',
}));
const ItemRoot = styled('div')(({ theme }) => ({
    gap: 6,
    alignItems: 'center',
    display: 'inline-flex',
    justifyContent: 'flex-start',
    fontSize: theme.typography.pxToRem(13),
    fontWeight: theme.typography.fontWeightMedium,
}));
const ItemIcon = styled('span')({
    display: 'inline-flex',
    color: 'var(--icon-color)',
    /**
     * As ':first-child' for ssr
     * https://github.com/emotion-js/emotion/issues/1105#issuecomment-1126025608
     */
    '& > :first-of-type:not(style):not(:first-of-type ~ *), & > style + *': { width: 20, height: 20 },
});
const ItemDot = styled('span')({
    width: 12,
    height: 12,
    flexShrink: 0,
    display: 'flex',
    borderRadius: '50%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--icon-color)',
    backgroundColor: 'currentColor',
});
const ItemLabel = styled('span')({ flexShrink: 0 });
const ItemValue = styled('span')(({ theme }) => ({
    ...theme.typography.h6,
    marginTop: theme.spacing(1),
}));
