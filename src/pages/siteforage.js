import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { CONFIG } from '../config-global';
import { SiteForageView } from '../sections/siteforage/view';
// ----------------------------------------------------------------------
export default function SiteForagePage() {
    return (_jsxs(_Fragment, { children: [_jsx("title", { children: `Site Forage - ${CONFIG.appName}` }), _jsx(SiteForageView, {})] }));
}
