import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
export function TableNoData({ searchQuery, ...other }) {
    return (_jsx(TableRow, { ...other, children: _jsx(TableCell, { align: "center", colSpan: 7, children: _jsxs(Box, { sx: { py: 15, textAlign: 'center' }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 1 }, children: "Not found" }), _jsxs(Typography, { variant: "body2", children: ["No results found for \u00A0", _jsxs("strong", { children: ["\"", searchQuery, "\""] }), ".", _jsx("br", {}), " Try checking for typos or using complete words."] })] }) }) }));
}
