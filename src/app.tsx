import 'src/global.css';

import Fab from '@mui/material/Fab';

import { Router } from 'src/routes/sections';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import { ThemeProvider } from 'src/theme/theme-provider';

import { Iconify } from 'src/components/iconify';
import { useDispatch, useSelector } from 'react-redux';
import { increment } from './libs/service/example/exampleSlice';

// ----------------------------------------------------------------------

export default function App() {
  const value = useSelector((state: any) => state.example.value);
  const dispatch = useDispatch();
  useScrollToTop();


  console.log(value)
  const githubButton = (
    <Fab
      size="medium"
      aria-label="Github"
      onClick={() => {
        dispatch(increment());
      }}
      sx={{
        zIndex: 9,
        right: 20,
        bottom: 20,
        width: 44,
        height: 44,
        position: 'fixed',
        bgcolor: 'grey.800',
        color: 'common.white',
      }}
    >
      <Iconify width={24} icon="eva:github-fill" />
    </Fab>
  );

  return (
    <ThemeProvider>
      <Router />
      {/* {githubButton} */}
    </ThemeProvider>
  );
}
