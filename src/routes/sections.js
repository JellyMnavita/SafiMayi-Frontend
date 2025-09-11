import { jsx as _jsx } from "react/jsx-runtime";
import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';
import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { AuthLayout } from '../layouts/auth';
import { DashboardLayout } from '../layouts/dashboard';
// ----------------------------------------------------------------------
export const DashboardPage = lazy(() => import('../pages').then(m => ({ default: m.DashboardPage })));
export const BlogPage = lazy(() => import('../pages').then(m => ({ default: m.BlogPage })));
export const UserPage = lazy(() => import('../pages').then(m => ({ default: m.UserPage })));
export const SignInPage = lazy(() => import('../pages').then(m => ({ default: m.SignInPage })));
export const Login = lazy(() => import('../pages').then(m => ({ default: m.Login })));
export const ProductsPage = lazy(() => import('../pages').then(m => ({ default: m.ProductsPage })));
export const Page404 = lazy(() => import('../pages').then(m => ({ default: m.Page404 })));
export const CreateRfidPage = lazy(() => import('../pages').then(m => ({ default: m.CreateRfidPage })));
export const CompteurPage = lazy(() => import('../pages').then(m => ({ default: m.CompteurPage })));
export const RfidPage = lazy(() => import('../pages').then(m => ({ default: m.RfidPage })));
export const VenteView = lazy(() => import('../pages').then(m => ({ default: m.VenteView })));
const renderFallback = () => (_jsx(Box, { sx: {
        display: 'flex',
        flex: '1 1 auto',
        alignItems: 'center',
        justifyContent: 'center',
    }, children: _jsx(LinearProgress, { sx: {
            width: 1,
            maxWidth: 320,
            bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
            [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
        } }) }));
export const routesSection = [
    {
        element: (_jsx(DashboardLayout, { children: _jsx(Suspense, { fallback: renderFallback(), children: _jsx(Outlet, {}) }) })),
        children: [
            { path: 'dashboard', element: _jsx(DashboardPage, {}) },
            { path: 'createrfid', element: _jsx(CreateRfidPage, {}) },
            { path: 'ventes', element: _jsx(VenteView, {}) },
            { path: 'compteur', element: _jsx(CompteurPage, {}) },
            { path: 'user', element: _jsx(UserPage, {}) },
            { path: 'products', element: _jsx(ProductsPage, {}) },
            { path: 'blog', element: _jsx(BlogPage, {}) },
            { path: 'rfid', element: _jsx(RfidPage, {}) },
        ],
    },
    {
        path: '/',
        element: (_jsx(Login, {})),
    },
    {
        path: 'sign-in',
        element: (_jsx(AuthLayout, { children: _jsx(SignInPage, {}) })),
    },
    {
        path: '404',
        element: _jsx(Page404, {}),
    },
    { path: '*', element: _jsx(Page404, {}) },
];
