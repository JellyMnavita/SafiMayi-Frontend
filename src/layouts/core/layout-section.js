import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { mergeClasses } from 'minimal-shared/utils';
import { styled } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import { layoutClasses } from './classes';
import { layoutSectionVars } from './css-vars';
export function LayoutSection({ sx, cssVars, children, footerSection, headerSection, sidebarSection, className, ...other }) {
    const inputGlobalStyles = (_jsx(GlobalStyles, { styles: (theme) => ({ body: { ...layoutSectionVars(theme), ...cssVars } }) }));
    return (_jsxs(_Fragment, { children: [inputGlobalStyles, _jsx(LayoutRoot, { id: "root__layout", className: mergeClasses([layoutClasses.root, className]), sx: sx, ...other, children: sidebarSection ? (_jsxs(_Fragment, { children: [sidebarSection, _jsxs(LayoutSidebarContainer, { className: layoutClasses.sidebarContainer, children: [headerSection, children, footerSection] })] })) : (_jsxs(_Fragment, { children: [headerSection, children, footerSection] })) })] }));
}
// ----------------------------------------------------------------------
const LayoutRoot = styled('div') ``;
const LayoutSidebarContainer = styled('div')(() => ({
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
}));
