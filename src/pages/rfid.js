import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { CONFIG } from '../config-global';
import { RFIDView } from '../sections/rfid/view';
// ----------------------------------------------------------------------
export default function RfidPage() {
    return (_jsxs(_Fragment, { children: [_jsx("title", { children: `Rfid - ${CONFIG.appName}` }), _jsx(RFIDView, {})] }));
}
