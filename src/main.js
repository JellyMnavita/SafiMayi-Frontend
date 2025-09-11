import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
import { routesSection } from './routes/sections';
import { ErrorBoundary } from './routes/components';
// ----------------------------------------------------------------------
const router = createBrowserRouter([
    {
        Component: () => (_jsx(App, { children: _jsx(Outlet, {}) })),
        errorElement: _jsx(ErrorBoundary, {}),
        children: routesSection,
    },
], {
    basename: '/safi-front', // 🔥 important : ton app sera servie depuis /safi-front
});
const root = createRoot(document.getElementById('root'));
root.render(_jsx(StrictMode, { children: _jsx(RouterProvider, { router: router }) }));
