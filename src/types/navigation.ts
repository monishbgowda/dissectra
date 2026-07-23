import type { StoredScan } from './dissectra';
export type RootTabParamList = {
  Scan: undefined;
  Home: { scan?: StoredScan } | undefined;
  History: undefined;
  Settings: undefined;
};
export type RootStackParamList = {
  MainTabs: undefined;
  Demo3D: undefined;
};
