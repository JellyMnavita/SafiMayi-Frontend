import { jsx as _jsx } from "react/jsx-runtime";
import { mergeClasses } from 'minimal-shared/utils';
import { styled } from '@mui/material/styles';
import { layoutClasses } from './classes';
export function MainSection({ children, className, sx, ...other }) {
    return (_jsx(MainRoot, { className: mergeClasses([layoutClasses.main, className]), sx: sx, ...other, children: children }));
}
// ----------------------------------------------------------------------
const MainRoot = styled('main')({
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
});
