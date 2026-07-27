import type { StoredScan } from './dissectra';

import type {
  NavigatorScreenParams,
} from "@react-navigation/native";

export type RootTabParamList = {
   Scan: undefined;
    Home: undefined;
    History: undefined;
    Settings: undefined;
};


export type RootStackParamList = {
  MainTabs:
    NavigatorScreenParams<RootTabParamList>;

  Demo3D: undefined;

  InspectionDetails: {
    inspectionId: string;
  };
};
