import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Iconify } from '../../components/iconify';
import { Scrollbar } from '../../components/scrollbar';
import { ColorPicker } from '../../components/color-utils';
export function ProductFilters({ filters, options, canReset, openFilter, onSetFilters, onOpenFilter, onCloseFilter, onResetFilter, }) {
    const renderGender = (_jsxs(Stack, { spacing: 1, children: [_jsx(Typography, { variant: "subtitle2", children: "Gender" }), _jsx(FormGroup, { children: options.genders.map((option) => (_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: filters.gender.includes(option.value), onChange: () => {
                            const checked = filters.gender.includes(option.value)
                                ? filters.gender.filter((value) => value !== option.value)
                                : [...filters.gender, option.value];
                            onSetFilters({ gender: checked });
                        } }), label: option.label }, option.value))) })] }));
    const renderCategory = (_jsxs(Stack, { spacing: 1, children: [_jsx(Typography, { variant: "subtitle2", children: "Category" }), _jsx(RadioGroup, { children: options.categories.map((option) => (_jsx(FormControlLabel, { value: option.value, control: _jsx(Radio, { checked: filters.category.includes(option.value), onChange: () => onSetFilters({ category: option.value }) }), label: option.label }, option.value))) })] }));
    const renderColors = (_jsxs(Stack, { spacing: 1, children: [_jsx(Typography, { variant: "subtitle2", children: "Colors" }), _jsx(ColorPicker, { options: options.colors, value: filters.colors, onChange: (colors) => onSetFilters({ colors: colors }), limit: 6 })] }));
    const renderPrice = (_jsxs(Stack, { spacing: 1, children: [_jsx(Typography, { variant: "subtitle2", children: "Price" }), _jsx(RadioGroup, { children: options.price.map((option) => (_jsx(FormControlLabel, { value: option.value, control: _jsx(Radio, { checked: filters.price.includes(option.value), onChange: () => onSetFilters({ price: option.value }) }), label: option.label }, option.value))) })] }));
    const renderRating = (_jsxs(Stack, { spacing: 1, children: [_jsx(Typography, { variant: "subtitle2", sx: { mb: 2 }, children: "Rating" }), options.ratings.map((option, index) => (_jsxs(Box, { onClick: () => onSetFilters({ rating: option }), sx: {
                    mb: 1,
                    gap: 1,
                    ml: -1,
                    p: 0.5,
                    display: 'flex',
                    borderRadius: 1,
                    cursor: 'pointer',
                    typography: 'body2',
                    alignItems: 'center',
                    '&:hover': { opacity: 0.48 },
                    ...(filters.rating === option && {
                        bgcolor: 'action.selected',
                    }),
                }, children: [_jsx(Rating, { readOnly: true, value: 4 - index }), " & Up"] }, option)))] }));
    return (_jsxs(_Fragment, { children: [_jsx(Button, { disableRipple: true, color: "inherit", endIcon: _jsx(Badge, { color: "error", variant: "dot", invisible: !canReset, children: _jsx(Iconify, { icon: "ic:round-filter-list" }) }), onClick: onOpenFilter, children: "Filters" }), _jsxs(Drawer, { anchor: "right", open: openFilter, onClose: onCloseFilter, slotProps: {
                    paper: {
                        sx: { width: 280, overflow: 'hidden' },
                    },
                }, children: [_jsxs(Box, { sx: {
                            py: 2,
                            pl: 2.5,
                            pr: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                        }, children: [_jsx(Typography, { variant: "h6", sx: { flexGrow: 1 }, children: "Filters" }), _jsx(IconButton, { onClick: onResetFilter, children: _jsx(Badge, { color: "error", variant: "dot", invisible: !canReset, children: _jsx(Iconify, { icon: "solar:restart-bold" }) }) }), _jsx(IconButton, { onClick: onCloseFilter, children: _jsx(Iconify, { icon: "mingcute:close-line" }) })] }), _jsx(Divider, {}), _jsx(Scrollbar, { children: _jsxs(Stack, { spacing: 3, sx: { p: 3 }, children: [renderGender, renderCategory, renderColors, renderPrice, renderRating] }) })] })] }));
}
