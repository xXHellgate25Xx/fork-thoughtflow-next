import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Pagination from '@mui/material/Pagination';

import { _posts } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import Editor from 'src/components/editor/Editor';

import { PostItem } from '../post-item';
import { PostSort } from '../post-sort';
import { PostSearch } from '../post-search';

// ----------------------------------------------------------------------

export function BlogView() {
  const [sortBy, setSortBy] = useState('latest');

  const handleSort = useCallback((newSort: string) => {
    setSortBy(newSort);
  }, []);

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={5}>
       <Editor/>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <PostSearch posts={_posts} />
        <PostSort
          sortBy={sortBy}
          onSort={handleSort}
          options={[
            { value: 'latest', label: 'Latest' },
            { value: 'popular', label: 'Popular' },
            { value: 'oldest', label: 'Oldest' },
          ]}
        />
      </Box>

      <Grid container spacing={3}>
        {_posts.map((post, index) => {
          const latestPostLarge = index === 0;
          const latestPost = index === 1 || index === 2;

          return (
            <Grid key={post.id} xs={12} sm={latestPostLarge ? 12 : 6} md={latestPostLarge ? 6 : 3}>
              <PostItem post={post} latestPost={latestPost} latestPostLarge={latestPostLarge} />
            </Grid>
          );
        })}
      </Grid>

      <Pagination count={10} color="primary" sx={{ mt: 8, mx: 'auto' }} />
    </DashboardContent>
  );
}
