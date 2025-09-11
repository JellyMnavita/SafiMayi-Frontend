import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as ThemeVarsProvider } from '@mui/material/styles';
import { createTheme } from './create-theme';
export function ThemeProvider({ themeOverrides, children, ...other }) {
    const theme = createTheme({
        themeOverrides,
    });
    return (_jsxs(ThemeVarsProvider, { disableTransitionOnChange: true, theme: theme, ...other, children: [_jsx(CssBaseline, {}), children] }));
}
