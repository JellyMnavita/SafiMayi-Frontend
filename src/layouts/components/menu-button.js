import { jsx as _jsx } from "react/jsx-runtime";
import IconButton from '@mui/material/IconButton';
import { Iconify } from '../../components/iconify';
// ----------------------------------------------------------------------
export function MenuButton({ sx, ...other }) {
    return (_jsx(IconButton, { sx: sx, ...other, children: _jsx(Iconify, { icon: "custom:menu-duotone", width: 24 }) }));
}
