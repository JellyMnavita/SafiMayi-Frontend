import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from '../layouts/auth';
import { DashboardLayout } from '../layouts/dashboard';

// ----------------------------------------------------------------------
// @ts-ignore 
export const DashboardPage = lazy(() => import('../pages/dashboard'));
// @ts-ignore 
export const BlogPage = lazy(() => import('../pages/blog'));
// @ts-ignore 
export const UserPage = lazy(() => import('../pages/user'));
// @ts-ignore 
export const SignInPage = lazy(() => import('../pages/sign-in'));
// @ts-ignore 
export const Login = lazy(() => import('../pages/Login'));
// @ts-ignore 
export const ProductsPage = lazy(() => import('../pages/products'));
// @ts-ignore 
export const Page404 = lazy(() => import('../pages/page-not-found'));

const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export const routesSection: RouteObject[] = [
  {
    element: (
      <DashboardLayout>
        <Suspense fallback={renderFallback()}>
          <Outlet />
        </Suspense>
      </DashboardLayout>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'user', element: <UserPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'blog', element: <BlogPage /> },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
