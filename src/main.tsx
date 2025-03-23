import "./global.css";
import "./shadcn-theme.css";

import { Suspense } from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import "./init";
import App from './app';
import store from './libs/stores';
import AuthWrapper from './layouts/auth/authWrapper';
import { GlobalContextProvider } from './GlobalContextProvider';

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(

  <HelmetProvider>
    <BrowserRouter>
      <Suspense>
        <Provider store={store}>
          <GlobalContextProvider>
            <AuthWrapper>
              <App />
            </AuthWrapper>
          </GlobalContextProvider>
        </Provider>
      </Suspense>
    </BrowserRouter>
  </HelmetProvider>
);
