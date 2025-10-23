import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { RouterLink } from '../../routes/components';
import { Logo } from '../../components/logo';

// ----------------------------------------------------------------------

export function ForbiddenView() {
  return (
    <>
      <Logo sx={{ position: 'fixed', top: 20, left: 20 }} />

      <Container
        sx={{
          py: 10,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h3" sx={{ mb: 2 }}>
          Accès refusé
        </Typography>

        <Typography sx={{ color: 'text.secondary', maxWidth: 480, textAlign: 'center' }}>
          Désolé, vous n'avez pas les autorisations nécessaires pour accéder à cette page. 
          Veuillez contacter votre administrateur si vous pensez qu'il s'agit d'une erreur.
        </Typography>

        <Box
          component="img"
          src="/assets/illustrations/illustration-403.svg"
          sx={{
            width: 320,
            height: 'auto',
            my: { xs: 5, sm: 10 },
          }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button component={RouterLink} href="/" size="large" variant="contained" color="inherit">
            Page d'accueil
          </Button>
          <Button 
            component={RouterLink} 
            href="/contact" 
            size="large" 
            variant="outlined" 
            color="primary"
          >
            Contacter le support
          </Button>
        </Box>
      </Container>
    </>
  );
}