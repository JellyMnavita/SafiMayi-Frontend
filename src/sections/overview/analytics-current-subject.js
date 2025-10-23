import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import { Chart, useChart, ChartLegends } from '../../components/chart';
export function AnalyticsCurrentSubject({ title, subheader, chart, sx, ...other }) {
    const theme = useTheme();
    const chartColors = chart.colors ?? [
        theme.palette.primary.main,
        theme.palette.warning.main,
        theme.palette.info.main,
    ];
    const chartOptions = useChart({
        colors: chartColors,
        stroke: { width: 2 },
        fill: { opacity: 0.48 },
        xaxis: {
            categories: chart.categories,
            labels: { style: { colors: Array.from({ length: 6 }, () => theme.palette.text.secondary) } },
        },
        ...chart.options,
    });
    return (_jsxs(Card, { sx: sx, ...other, children: [_jsx(CardHeader, { title: title, subheader: subheader }), _jsx(Chart, { type: "radar", series: chart.series, options: chartOptions, slotProps: { loading: { py: 2.5 } }, sx: {
                    my: 1,
                    mx: 'auto',
                    width: 300,
                    height: 300,
                } }), _jsx(Divider, { sx: { borderStyle: 'dashed' } }), _jsx(ChartLegends, { labels: chart.series.map((item) => item.name), colors: chartOptions?.colors, sx: { p: 3, justifyContent: 'center' } })] }));
}
