import React from "react";
import {
    View,
    Text,
} from "react-native";

import {
    useRoute,
} from "@react-navigation/native";

export default function AnalysisScreen() {

    const route = useRoute();

    console.log("===== ANALYSIS SCREEN =====");
    console.log(route);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: "red",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text
                style={{
                    color: "white",
                    fontSize: 22,
                }}
            >
                Analysis Screen
            </Text>

            <Text
                style={{
                    color: "white",
                    marginTop: 20,
                }}
            >
                Route:
            </Text>

            <Text
                style={{
                    color: "yellow",
                    padding: 20,
                }}
            >
                {JSON.stringify(route.params, null, 2)}
            </Text>
        </View>
    );
}