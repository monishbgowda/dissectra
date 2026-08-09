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

    MainTabs: NavigatorScreenParams<RootTabParamList>;

    InspectionDetails: {
        inspectionId: string;
    };

    Analysis: {
        inspectionId: string;
        analysis: any;
    };

    Demo3D: {
        inspectionId: string;
    };

};
