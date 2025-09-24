import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';
import { Chart, useChart } from '../../components/chart';
export function AnalyticsWebsiteVisits({ title, subheader, chart, sx, ...other }) {
    const theme = useTheme();
    const chartColors = chart.colors ?? [
        hexAlpha(theme.palette.primary.dark, 0.8),
        hexAlpha(theme.palette.warning.main, 0.8),
    ];
    const chartOptions = useChart({
        colors: chartColors,
        stroke: { width: 2 }, // <-- retire colors ou mets une couleur réelle
        xaxis: { categories: chart.categories },
        legend: { show: true },
        tooltip: { y: { formatter: (value) => `${value} Litres` } },
        ...chart.options,
    });
    return (_jsxs(Card, { sx: sx, ...other, children: [_jsx(CardHeader, { title: title, subheader: subheader }), _jsx(Chart, { type: "line", series: chart.series, options: chartOptions, slotProps: { loading: { p: 2.5 } }, sx: {
                    pl: 1,
                    py: 2.5,
                    pr: 2.5,
                    height: 364,
                } })] }));
}
