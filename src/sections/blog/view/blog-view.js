import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import { DashboardContent } from '../../../layouts/dashboard';
import { Iconify } from '../../../components/iconify';
import { PostItem } from '../post-item';
import { PostSort } from '../post-sort';
import { PostSearch } from '../post-search';
export function BlogView({ posts }) {
    const [sortBy, setSortBy] = useState('latest');
    const handleSort = useCallback((newSort) => {
        setSortBy(newSort);
    }, []);
    return (_jsxs(DashboardContent, { children: [_jsxs(Box, { sx: {
                    mb: 5,
                    display: 'flex',
                    alignItems: 'center',
                }, children: [_jsx(Typography, { variant: "h4", sx: { flexGrow: 1 }, children: "Blog" }), _jsx(Button, { variant: "contained", color: "inherit", startIcon: _jsx(Iconify, { icon: "mingcute:add-line" }), children: "New post" })] }), _jsxs(Box, { sx: {
                    mb: 5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }, children: [_jsx(PostSearch, { posts: posts }), _jsx(PostSort, { sortBy: sortBy, onSort: handleSort, options: [
                            { value: 'latest', label: 'Latest' },
                            { value: 'popular', label: 'Popular' },
                            { value: 'oldest', label: 'Oldest' },
                        ] })] }), _jsx(Grid, { container: true, spacing: 3, children: posts.map((post, index) => {
                    const latestPostLarge = index === 0;
                    const latestPost = index === 1 || index === 2;
                    return (_jsx(Grid, { size: {
                            xs: 12,
                            sm: latestPostLarge ? 12 : 6,
                            md: latestPostLarge ? 6 : 3,
                        }, children: _jsx(PostItem, { post: post, latestPost: latestPost, latestPostLarge: latestPostLarge }) }, post.id));
                }) }), _jsx(Pagination, { count: 10, color: "primary", sx: { mt: 8, mx: 'auto' } })] }));
}
