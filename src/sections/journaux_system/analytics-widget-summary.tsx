import type { CardProps } from '@mui/material/Card';
import type { PaletteColorKey } from '../../theme/core';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';

import { fNumber, fPercent, fShortenNumber } from '../../utils/format-number';
import { SvgColor } from '../../components/svg-color';

// ----------------------------------------------------------------------

type Props = CardProps & {
  title: string;
  total: number;
  color?: PaletteColorKey;
  icon: React.ReactNode;
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
};

export function AnalyticsWidgetSummary({
  sx,
  icon,
  title,
  total,
  color = 'primary',
  prefix = '',
  suffix = '',
  isCurrency = false,
  ...other
}: Props) {
  const theme = useTheme();
  
  // Formater la valeur avec préfixe et suffixe
  const formatValue = (value: number) => {
    let formattedValue = value.toString();
    
    // Ajouter des séparateurs de milliers si c'est une devise
    if (isCurrency && value >= 1000) {
      formattedValue = value.toLocaleString('fr-FR');
    }
    
    return `${prefix}${formattedValue}${suffix}`;
  };

  return (
    <Card
      sx={[
        () => ({
          p: 3,
          boxShadow: 'none',
          position: 'relative',
          color: `${color}.darker`,
          backgroundColor: 'common.white',
          backgroundImage: `linear-gradient(135deg, ${varAlpha(theme.vars.palette[color].lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette[color].lightChannel, 0.48)})`,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box sx={{ width: 48, height: 48, mb: 3 }}>{icon}</Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
      >
        <Box sx={{ flexGrow: 1, minWidth: 112 }}>
          <Box sx={{ mb: 1, typography: 'subtitle2' }}>{title}</Box>

          <Box sx={{ typography: 'h4' }}>{formatValue(total)}</Box>
        </Box>

      
      </Box>

      <SvgColor
        src="/assets/background/shape-square.svg"
        sx={{
          top: 0,
          left: -20,
          width: 240,
          zIndex: -1,
          height: 240,
          opacity: 0.24,
          position: 'absolute',
          color: `${color}.main`,
        }}
      />
    </Card>
  );
}