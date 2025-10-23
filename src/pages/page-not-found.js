import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { CONFIG } from '../config-global';
import { ForbiddenView } from '../sections/error';
// ----------------------------------------------------------------------
export default function Page() {
    return (_jsxs(_Fragment, { children: [_jsx("title", { children: `403 Forbidden - ${CONFIG.appName}` }), _jsx(ForbiddenView, {})] }));
}
