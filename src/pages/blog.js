import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { _posts } from '../_mock';
import { CONFIG } from '../config-global';
import { BlogView } from '../sections/blog/view';
// ----------------------------------------------------------------------
export default function Page() {
    return (_jsxs(_Fragment, { children: [_jsx("title", { children: `Blog - ${CONFIG.appName}` }), _jsx(BlogView, { posts: _posts })] }));
}
