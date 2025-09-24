import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { CONFIG } from '../config-global';
import { JournauxView } from '../sections/journaux_system/view';
// ----------------------------------------------------------------------
export default function JournauxPage() {
    return (_jsxs(_Fragment, { children: [_jsx("title", { children: `Journaux System- ${CONFIG.appName}` }), _jsx(JournauxView, {})] }));
}
