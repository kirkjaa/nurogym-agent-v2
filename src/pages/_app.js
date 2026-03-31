import React from 'react';
import { Provider } from 'react-redux';
import store from '../lib/redux/store';
import { LocaleProvider } from '../lib/i18n/LocaleContext';
import { getClientConfig } from '../lib/config/clientConfig';
import '../styles/globals.css';

const clientConfig = getClientConfig();

const MyApp = ({ Component, pageProps }) => (
  <Provider store={store}>
    <LocaleProvider
      coachName={clientConfig.coachName}
      domain={clientConfig.domain}
      storageKeyPrefix={clientConfig.storageKeyPrefix}
    >
      <Component {...pageProps} />
    </LocaleProvider>
  </Provider>
);

export default MyApp;
