import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import { visuallyHidden } from './utils';
export function UserTableHead({ order, onSort, orderBy, rowCount, headLabel, numSelected, onSelectAllRows, }) {
    return (_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { padding: "checkbox", children: _jsx(Checkbox, { indeterminate: numSelected > 0 && numSelected < rowCount, checked: rowCount > 0 && numSelected === rowCount, onChange: (event) => onSelectAllRows(event.target.checked) }) }), headLabel.map((headCell) => (_jsx(TableCell, { align: headCell.align || 'left', sortDirection: orderBy === headCell.id ? order : false, sx: { width: headCell.width, minWidth: headCell.minWidth }, children: _jsxs(TableSortLabel, { hideSortIcon: true, active: orderBy === headCell.id, direction: orderBy === headCell.id ? order : 'asc', onClick: () => onSort(headCell.id), children: [headCell.label, orderBy === headCell.id ? (_jsx(Box, { sx: { ...visuallyHidden }, children: order === 'desc' ? 'sorted descending' : 'sorted ascending' })) : null] }) }, headCell.id)))] }) }));
}
