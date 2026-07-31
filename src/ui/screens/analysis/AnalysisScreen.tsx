import React from "react";
import { View, Text } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import type { RootStackParamList } from "../../../types/navigation";

export default function AnalysisScreen() {

    const route = useRoute();

    console.log("Route object:", route);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: "red",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text style={{ color: "white" }}>
                Analysis Screen
            </Text>
        </View>
    );
}

