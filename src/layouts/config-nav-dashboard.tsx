import { Icon } from '@iconify/react';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <Icon icon={name} width='100%'/>
)

export const navData = [
  {
    title: 'Home',
    path: '/',
    icon: icon('solar:home-bold-duotone'),
  },
  {
    title: 'Strategy',
    path: '/strategy',
    icon: icon('material-symbols:strategy')
  },
  {
    title: 'Analytics',
    path: '/analytics',
    icon: icon('hugeicons:analytics-up'),
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: icon('icon-park-twotone:setting'),
  }
];
