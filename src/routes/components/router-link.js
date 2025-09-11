import { jsx as _jsx } from "react/jsx-runtime";
import { Link } from 'react-router';
export function RouterLink({ href, ref, ...other }) {
    return _jsx(Link, { ref: ref, to: href, ...other });
}
