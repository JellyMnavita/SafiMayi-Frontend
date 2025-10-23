import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { CONFIG } from '../config-global';
import { CompteurView } from '../sections/compteur/view';
// ----------------------------------------------------------------------
export default function CompteurPage() {
    return (_jsxs(_Fragment, { children: [_jsx("title", { children: `Compteur - ${CONFIG.appName}` }), _jsx(CompteurView, {})] }));
}
