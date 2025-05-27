import { Icon } from '@iconify/react';

import { CRMFeatureMetadata } from 'src/utils/crmFeatures';
import type { NavItem } from './dashboard/nav';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <Icon icon={name} width='100%' />
)

export const navData = (metadata: CRMFeatureMetadata): NavItem[] => [
  // {
  //   title: 'Home',
  //   path: '/',
  //   icon: icon('solar:home-bold-duotone'),
  // },
  {
    title: 'Content',
    path: '/idea',
    icon: icon('heroicons-solid:light-bulb'),
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
      metadata.isEnableAccount && {
        title: 'Accounts',
        path: '/crm/accounts',
        icon: icon('fluent:building-16-filled'),
      },
      {
        title: 'Contacts',
        path: '/crm/contacts',
        icon: icon('fluent:person-16-filled'),
      },
      // {
      //   title: 'Survey Config',
      //   path: '/crm/survey-config',
      //   icon: icon('mdi:form-textbox'),
      // },
    ].filter(Boolean) as NavItem[],
  },
  // {
  //   title: 'Analytics',
  //   path: '/analytics',
  //   icon: icon('hugeicons:analytics-up'),
  // }
];
