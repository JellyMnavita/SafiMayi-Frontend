import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { Iconify } from '../../components/iconify';
export function UserTableToolbar({ numSelected, filterName, onFilterName }) {
    return (_jsxs(Toolbar, { sx: {
            height: 96,
            display: 'flex',
            justifyContent: 'space-between',
            p: (theme) => theme.spacing(0, 1, 0, 3),
            ...(numSelected > 0 && {
                color: 'primary.main',
                bgcolor: 'primary.lighter',
            }),
        }, children: [numSelected > 0 ? (_jsxs(Typography, { component: "div", variant: "subtitle1", children: [numSelected, " selected"] })) : (_jsx(OutlinedInput, { fullWidth: true, value: filterName, onChange: onFilterName, placeholder: "Search user...", startAdornment: _jsx(InputAdornment, { position: "start", children: _jsx(Iconify, { width: 20, icon: "eva:search-fill", sx: { color: 'text.disabled' } }) }), sx: { maxWidth: 320 } })), numSelected > 0 ? (_jsx(Tooltip, { title: "Delete", children: _jsx(IconButton, { children: _jsx(Iconify, { icon: "solar:trash-bin-trash-bold" }) }) })) : (_jsx(Tooltip, { title: "Filter list", children: _jsx(IconButton, { children: _jsx(Iconify, { icon: "ic:round-filter-list" }) }) }))] }));
}
