import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Card from '@mui/material/Card';
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import { fDateTime } from '../../utils/format-time';
export function AnalyticsOrderTimeline({ title, subheader, list, sx, ...other }) {
    return (_jsxs(Card, { sx: sx, ...other, children: [_jsx(CardHeader, { title: title, subheader: subheader }), _jsx(Timeline, { sx: { m: 0, p: 3, [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 } }, children: list.map((item, index) => (_jsx(Item, { item: item, lastItem: index === list.length - 1 }, item.id))) })] }));
}
function Item({ item, lastItem, ...other }) {
    return (_jsxs(TimelineItem, { ...other, children: [_jsxs(TimelineSeparator, { children: [_jsx(TimelineDot, { color: (item.type === 'order1' && 'primary') ||
                            (item.type === 'order2' && 'success') ||
                            (item.type === 'order3' && 'info') ||
                            (item.type === 'order4' && 'warning') ||
                            'error' }), lastItem ? null : _jsx(TimelineConnector, {})] }), _jsxs(TimelineContent, { children: [_jsx(Typography, { variant: "subtitle2", children: item.title }), _jsx(Typography, { variant: "caption", sx: { color: 'text.disabled' }, children: fDateTime(item.time) })] })] }));
}
