import ReactDOM from 'react-dom/client';
import { Suspense, StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import App from './app';
import store from './libs/stores';
import { GlobalContextProvider } from './GlobalContextProvider';
import AuthWrapper from './layouts/auth/authWrapper';

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
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
  </StrictMode>
);
