import { jsx as _jsx } from "react/jsx-runtime";
import './global.css';
import { useEffect } from 'react';
import { usePathname } from './routes/hooks';
import { ThemeProvider } from './theme/theme-provider';
export default function App({ children }) {
    useScrollToTop();
    return (_jsx(ThemeProvider, { children: children }));
}
// ----------------------------------------------------------------------
function useScrollToTop() {
    const pathname = usePathname();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}
