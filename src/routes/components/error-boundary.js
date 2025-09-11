import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouteError, isRouteErrorResponse } from 'react-router';
import GlobalStyles from '@mui/material/GlobalStyles';
// ----------------------------------------------------------------------
export function ErrorBoundary() {
    const error = useRouteError();
    return (_jsxs(_Fragment, { children: [inputGlobalStyles(), _jsx("div", { className: errorBoundaryClasses.root, children: _jsx("div", { className: errorBoundaryClasses.container, children: renderErrorMessage(error) }) })] }));
}
// ----------------------------------------------------------------------
function parseStackTrace(stack) {
    if (!stack)
        return { filePath: null, functionName: null };
    const filePathMatch = stack.match(/\/src\/[^?]+/);
    const functionNameMatch = stack.match(/at (\S+)/);
    return {
        filePath: filePathMatch ? filePathMatch[0] : null,
        functionName: functionNameMatch ? functionNameMatch[1] : null,
    };
}
function renderErrorMessage(error) {
    if (isRouteErrorResponse(error)) {
        return (_jsxs(_Fragment, { children: [_jsxs("h1", { className: errorBoundaryClasses.title, children: [error.status, ": ", error.statusText] }), _jsx("p", { className: errorBoundaryClasses.message, children: error.data })] }));
    }
    if (error instanceof Error) {
        const { filePath, functionName } = parseStackTrace(error.stack);
        return (_jsxs(_Fragment, { children: [_jsx("h1", { className: errorBoundaryClasses.title, children: "Unexpected Application Error!" }), _jsxs("p", { className: errorBoundaryClasses.message, children: [error.name, ": ", error.message] }), _jsx("pre", { className: errorBoundaryClasses.details, children: error.stack }), (filePath || functionName) && (_jsxs("p", { className: errorBoundaryClasses.filePath, children: [filePath, " (", functionName, ")"] }))] }));
    }
    return _jsx("h1", { className: errorBoundaryClasses.title, children: "Unknown Error" });
}
// ----------------------------------------------------------------------
const errorBoundaryClasses = {
    root: 'error-boundary-root',
    container: 'error-boundary-container',
    title: 'error-boundary-title',
    details: 'error-boundary-details',
    message: 'error-boundary-message',
    filePath: 'error-boundary-file-path',
};
const cssVars = {
    '--info-color': '#2dd9da',
    '--warning-color': '#e2aa53',
    '--error-color': '#ff5555',
    '--error-background': '#2a1e1e',
    '--details-background': '#111111',
    '--root-background': '#2c2c2e',
    '--container-background': '#1c1c1e',
    '--font-stack-monospace': '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
    '--font-stack-sans': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
};
const rootStyles = () => ({
    display: 'flex',
    flex: '1 1 auto',
    alignItems: 'center',
    padding: '10vh 15px 0',
    flexDirection: 'column',
    fontFamily: 'var(--font-stack-sans)',
});
const contentStyles = () => ({
    gap: 24,
    padding: 20,
    width: '100%',
    maxWidth: 960,
    display: 'flex',
    borderRadius: 8,
    flexDirection: 'column',
    backgroundColor: 'var(--container-background)',
});
const titleStyles = (theme) => ({
    margin: 0,
    lineHeight: 1.2,
    fontSize: theme.typography.pxToRem(20),
    fontWeight: theme.typography.fontWeightBold,
});
const messageStyles = (theme) => ({
    margin: 0,
    lineHeight: 1.5,
    padding: '12px 16px',
    whiteSpace: 'pre-wrap',
    color: 'var(--error-color)',
    fontSize: theme.typography.pxToRem(14),
    fontFamily: 'var(--font-stack-monospace)',
    backgroundColor: 'var(--error-background)',
    borderLeft: '2px solid var(--error-color)',
    fontWeight: theme.typography.fontWeightBold,
});
const detailsStyles = () => ({
    margin: 0,
    padding: 16,
    lineHeight: 1.5,
    overflow: 'auto',
    borderRadius: 'inherit',
    color: 'var(--warning-color)',
    backgroundColor: 'var(--details-background)',
});
const filePathStyles = () => ({
    marginTop: 0,
    color: 'var(--info-color)',
});
const inputGlobalStyles = () => (_jsx(GlobalStyles, { styles: (theme) => ({
        body: {
            ...cssVars,
            margin: 0,
            color: 'white',
            backgroundColor: 'var(--root-background)',
            [`& .${errorBoundaryClasses.root}`]: rootStyles(),
            [`& .${errorBoundaryClasses.container}`]: contentStyles(),
            [`& .${errorBoundaryClasses.title}`]: titleStyles(theme),
            [`& .${errorBoundaryClasses.message}`]: messageStyles(theme),
            [`& .${errorBoundaryClasses.filePath}`]: filePathStyles(),
            [`& .${errorBoundaryClasses.details}`]: detailsStyles(),
        },
    }) }));
