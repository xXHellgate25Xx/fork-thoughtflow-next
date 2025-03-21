import { Icon } from '@iconify/react';
import { NavItem } from './dashboard/nav';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <Icon icon={name} width='100%' />
)

export const navData: NavItem[] = [
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
    title: 'CRM',
    path: '/crm',
    icon: icon('fluent:people-team-16-filled'),
    children: [
      {
        title: 'Opportunities',
        path: '/crm/opportunities',
        icon: icon('fluent:arrow-trending-16-filled'),
      },
      {
        title: 'Contacts',
        path: '/crm/contacts',
        icon: icon('fluent:person-16-filled'),
      },
      {
        title: 'Leads',
        path: '/crm/leads',
        icon: icon('fluent:people-16-filled'),
      },
      {
        title: 'Deals',
        path: '/crm/deals',
        icon: icon('fluent:money-16-filled'),
      },
    ],
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
