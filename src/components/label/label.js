import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { upperFirst } from 'es-toolkit';
import { mergeClasses } from 'minimal-shared/utils';
import { labelClasses } from './classes';
import { LabelRoot, LabelIcon } from './styles';
// ----------------------------------------------------------------------
export function Label({ sx, endIcon, children, startIcon, className, disabled, variant = 'soft', color = 'default', ...other }) {
    return (_jsxs(LabelRoot, { color: color, variant: variant, disabled: disabled, className: mergeClasses([labelClasses.root, className]), sx: sx, ...other, children: [startIcon && _jsx(LabelIcon, { className: labelClasses.icon, children: startIcon }), typeof children === 'string' ? upperFirst(children) : children, endIcon && _jsx(LabelIcon, { className: labelClasses.icon, children: endIcon })] }));
}
