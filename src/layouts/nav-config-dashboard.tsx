import { Label } from '../components/label';
import { SvgColor } from '../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode; 
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: icon('ic-analytics'),
  },
    {
    title: 'Créer carte RFID',
    path: '/createrfid',
    icon: icon('ic-cart'),
  },
  {
    title: 'Compteur',
    path: '/compteur',
    icon: <img width="50" height="50" src="https://img.icons8.com/ios/50/self-service-kiosk.png" alt="self-service-kiosk"/>
  },
  {
    title: 'User',
    path: '/user',
    icon: icon('ic-user'),
  },
  {
    title: 'Product',
    path: '/products',
    icon: icon('ic-cart'),
    info: (
      <Label color="error" variant="inverted">
        +3
      </Label>
    ),
  },
 
  
  {
    title: 'Not found',
    path: '/404',
    icon: icon('ic-disabled'),
  },
];
