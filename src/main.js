import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router';
import App from './App';
import { routesSection } from './routes/sections';
import { ErrorBoundary } from './routes/components';
// ----------------------------------------------------------------------
const router = createBrowserRouter([{ Component: () => (_jsxs(App, { children: [" ", _jsx(Outlet, {}), " "] })), errorElement: _jsx(ErrorBoundary, {}), children: routesSection, },]);
const root = createRoot(document.getElementById('root'));
root.render(_jsxs(StrictMode, { children: [" ", _jsx(RouterProvider, { router: router }), " "] }));
