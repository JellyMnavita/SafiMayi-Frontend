import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { CONFIG } from '../config-global';
import { VenteView } from '../sections/vente/view';
// ----------------------------------------------------------------------
export default function VentePage() {
    return (_jsxs(_Fragment, { children: [_jsx("title", { children: `Vente - ${CONFIG.appName}` }), _jsx(VenteView, {})] }));
}
