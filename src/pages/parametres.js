import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { CONFIG } from '../config-global';
import { ParametresView } from '../sections/parametres/view';
// ----------------------------------------------------------------------
export default function Parametres() {
    return (_jsxs(_Fragment, { children: [_jsx("title", { children: `Paramètres - ${CONFIG.appName}` }), _jsx(ParametresView, {})] }));
}
