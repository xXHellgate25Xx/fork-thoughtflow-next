import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './app';
import "./global.css";
import { GlobalContextProvider } from './GlobalContextProvider';
import "./init";
import AuthWrapper from './layouts/auth/authWrapper';
import store from './libs/stores';
import "./shadcn-theme.css";

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
