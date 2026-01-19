import React, { createContext, useContext, PropsWithChildren } from 'react';
import { AFFILIATE_TAG, SHARE_MESSAGE } from '../constants';

export interface AppConfig {
  affiliateTag: string;
  shareMessage: string;
  productShareMessage: string;
  headerTitle: string;
  headerSubtitle: string;
  footerText: string;
  footerDisclaimer: string;
}

export const defaultConfig: AppConfig = {
  affiliateTag: AFFILIATE_TAG,
  shareMessage: SHARE_MESSAGE,
  productShareMessage: "Hey, check out this awesome product!",
  headerTitle: "Offers Hub!",
  headerSubtitle: "Dashboard",
  footerText: "© 2026 Offers Hub",
  footerDisclaimer: "Offers Hub! is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in."
};

const ConfigContext = createContext<AppConfig>(defaultConfig);

export const useConfig = () => useContext(ConfigContext);

interface ConfigProviderProps {
  value: AppConfig;
}

export const ConfigProvider: React.FC<PropsWithChildren<ConfigProviderProps>> = ({ children, value }) => (
  <ConfigContext.Provider value={value}>
    {children}
  </ConfigContext.Provider>
);
