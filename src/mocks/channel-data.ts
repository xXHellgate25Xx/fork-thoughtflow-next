import { ChannelData } from 'src/libs/service/channel/channel';

export const MOCK_CHANNELS: ChannelData[] = [
  {
    id: 'channel-1',
    name: 'Company Blog',
    type: 'Blog',
    url: 'blog.example.com',
    is_active: true,
    n_draft: 3,
    n_published: 12,
    views: 1284,
    created_at: new Date('2023-01-15').toISOString(),
    updated_at: new Date('2023-07-28').toISOString(),
    pillar_id: 'pillar-1'
  },
  {
    id: 'channel-2',
    name: 'Marketing Newsletter',
    type: 'Email',
    url: 'newsletter.example.com',
    is_active: true,
    n_draft: 1,
    n_published: 24,
    views: 3650,
    created_at: new Date('2023-02-22').toISOString(),
    updated_at: new Date('2023-08-05').toISOString(),
    pillar_id: 'pillar-1'
  },
  {
    id: 'channel-3',
    name: 'Product Documentation',
    type: 'Docs',
    url: 'docs.example.com',
    is_active: true,
    n_draft: 8,
    n_published: 46,
    views: 5729,
    created_at: new Date('2023-03-10').toISOString(),
    updated_at: new Date('2023-08-12').toISOString(),
    pillar_id: 'pillar-2'
  },
  {
    id: 'channel-4',
    name: 'Developer Portal',
    type: 'Website',
    url: 'developers.example.com',
    is_active: false,
    n_draft: 5,
    n_published: 18,
    views: 2140,
    created_at: new Date('2023-04-05').toISOString(),
    updated_at: new Date('2023-06-30').toISOString(),
    pillar_id: 'pillar-2'
  },
  {
    id: 'channel-5',
    name: 'Social Media',
    type: 'Social',
    url: 'social.example.com',
    is_active: true,
    n_draft: 7,
    n_published: 35,
    views: 8920,
    created_at: new Date('2023-05-18').toISOString(),
    updated_at: new Date('2023-08-15').toISOString(),
    pillar_id: 'pillar-3'
  },
  {
    id: 'channel-6',
    name: 'Support Center',
    type: 'Help',
    url: 'help.example.com',
    is_active: true,
    n_draft: 12,
    n_published: 68,
    views: 4325,
    created_at: new Date('2023-01-30').toISOString(),
    updated_at: new Date('2023-08-10').toISOString(),
    pillar_id: 'pillar-3'
  },
  {
    id: 'channel-7',
    name: 'Customer Stories',
    type: 'Blog',
    url: 'stories.example.com',
    is_active: true,
    n_draft: 9,
    n_published: 28,
    views: 3870,
    created_at: new Date('2023-03-25').toISOString(),
    updated_at: new Date('2023-07-22').toISOString(),
    pillar_id: 'pillar-1'
  },
  {
    id: 'channel-8',
    name: 'Training Videos',
    type: 'Video',
    url: 'training.example.com',
    is_active: false,
    n_draft: 4,
    n_published: 16,
    views: 2580,
    created_at: new Date('2023-02-12').toISOString(),
    updated_at: new Date('2023-05-30').toISOString(),
    pillar_id: 'pillar-2'
  }
]; 