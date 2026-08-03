import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useTheme } from "../../../theme/ThemeProvider";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../types/navigation";
import { getInspection } from "../../../storage/inspectionStorage";
import type { Inspection } from "../../../storage/inspectionTypes";


type AnalysisRouteProp = RouteProp<RootStackParamList, "Analysis">;

type AnalysisNavigationProp =
    NativeStackNavigationProp<
        RootStackParamList,
        "Analysis"
    >;

export default function AnalysisScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation<AnalysisNavigationProp>();
    const route = useRoute<AnalysisRouteProp>();

    const [inspection, setInspection] = useState<Inspection | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function loadInspection() {
            if (!route.params?.inspectionId) {
                setLoading(false);
                return;
            }

            try {
                const data = await getInspection(route.params.inspectionId);
                if (!cancelled) {
                    setInspection(data);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadInspection();

        return () => {
            cancelled = true;
        };
    }, [route.params?.inspectionId]);

    const analysis = route.params?.analysis ?? inspection?.analysis;

    const styles = StyleSheet.create({

        container: {
            marginTop: 25,
            flex: 1,

            backgroundColor: theme.colors.background,

        },

        content: {

            padding: theme.spacing.lg,
            paddingBottom: 50,

        },

        center: {

            flex: 1,

            justifyContent: "center",

            alignItems: "center",

            backgroundColor: theme.colors.background,

        },

        error: {

            color: theme.colors.error,

            fontSize: 18,

            fontWeight: "600",

        },

        backButton: {

            flexDirection: "row",

            alignItems: "center",

            alignSelf: "flex-start",

            paddingVertical: 8,

            paddingRight: 16,

            marginBottom: 16,

        },

        backText: {

            color: theme.colors.text,

            fontSize: 16,

            fontWeight: "600",

            marginLeft: 6,

        },

        title: {

            ...theme.typography.display,

            color: theme.colors.text,

            marginBottom: 6,

        },

        subtitle: {

            ...theme.typography.body1,

            color: theme.colors.textSecondary,

            marginBottom: theme.spacing.xl,

        },

        card: {

            backgroundColor: theme.colors.card,

            borderRadius: theme.radius.lg,

            borderWidth: 1,

            borderColor: theme.colors.border,

            padding: theme.spacing.lg,

            marginBottom: theme.spacing.xl,

            ...theme.shadows.md,

        },

        heading: {

            ...theme.typography.h2,

            color: theme.colors.text,

            marginBottom: theme.spacing.md,

        },

        infoRow: {

            flexDirection: "row",

            justifyContent: "space-between",

            alignItems: "center",

            paddingVertical: 8,

            borderBottomWidth: 1,

            borderBottomColor: theme.colors.divider,

        },

        label: {

            ...theme.typography.body1,

            color: theme.colors.textSecondary,

            fontWeight: "600",

            flex: 1,

        },

        value: {

            ...theme.typography.body1,

            color: theme.colors.text,

            flex: 1,

            textAlign: "right",

            fontWeight: "500",

        },

        detail: {

            ...theme.typography.body1,

            color: theme.colors.text,

            marginTop: theme.spacing.xs,

        },

        section: {

            ...theme.typography.h1,

            color: theme.colors.text,

            marginBottom: theme.spacing.lg,

        },

        componentCard: {

            backgroundColor: theme.colors.componentBackground,

            borderRadius: theme.radius.lg,

            borderWidth: 1,

            borderColor: theme.colors.componentBorder,

            padding: theme.spacing.lg,

            marginBottom: theme.spacing.lg,

            ...theme.shadows.sm,

        },

        componentName: {

            ...theme.typography.h2,

            color: theme.colors.primary,

            marginBottom: theme.spacing.md,

        },

        divider: {

            height: 1,

            backgroundColor: theme.colors.divider,

            marginVertical: theme.spacing.md,

        },

        badge: {

            alignSelf: "flex-start",

            backgroundColor: theme.colors.primary,

            borderRadius: theme.radius.pill,

            paddingHorizontal: 14,

            paddingVertical: 6,

            marginBottom: theme.spacing.md,

        },

        badgeText: {

            color: theme.colors.onPrimary,

            fontWeight: "700",

            fontSize: 12,

            letterSpacing: 0.5,

        },

        confidenceHigh: {

            color: theme.colors.confidenceHigh,

            fontWeight: "700",

        },

        confidenceMedium: {

            color: theme.colors.confidenceMedium,

            fontWeight: "700",

        },

        confidenceLow: {

            color: theme.colors.confidenceLow,

            fontWeight: "700",

        },

        replaceableYes: {

            color: theme.colors.replaceable,

            fontWeight: "700",

        },

        replaceableNo: {

            color: theme.colors.nonReplaceable,

            fontWeight: "700",

        },

        chip: {

            alignSelf: "flex-start",

            backgroundColor: theme.colors.chip,

            borderColor: theme.colors.chipBorder,

            borderWidth: 1,

            borderRadius: theme.radius.pill,

            paddingHorizontal: 12,

            paddingVertical: 5,

            marginBottom: theme.spacing.md,

        },

        chipText: {

            color: theme.colors.text,

            fontSize: 12,

            fontWeight: "600",

        },

        rowWrap: {

            flexDirection: "row",

            flexWrap: "wrap",

            gap: 8,

            marginBottom: theme.spacing.md,

        },

        confidenceBar: {

            marginTop: theme.spacing.sm,

            height: 8,

            borderRadius: theme.radius.pill,

            backgroundColor: theme.colors.surfaceVariant,

            overflow: "hidden",

        },

        confidenceFill: {

            height: "100%",

            borderRadius: theme.radius.pill,

            backgroundColor: theme.colors.success,

        },

    });

    if (loading) {
        return (
            <View style={styles.center}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-back" size={24} color={theme.colors.text} />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.error}>Loading...</Text>
            </View>
        );
    }

    if (!analysis) {

        return (

            <View style={styles.center}>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Icon name="arrow-back" size={24} color={theme.colors.text} />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>

                <Text style={styles.error}>
                    No analysis available.
                </Text>

            </View>

        );

    }

    return (

        <ScrollView
    style={styles.container}
    contentContainerStyle={styles.content}
>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
            >
                <Icon name="arrow-back" size={24} color={theme.colors.text} />
                <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>
                {analysis.product?.name}
            </Text>

            <View style={styles.card}>

                <Text style={styles.heading}>
                    Product Details
                </Text>

                <View style={styles.infoRow}>
    <Text style={styles.label}>Brand</Text>
    <Text style={styles.value}>
        {analysis.product.brand}
    </Text>
</View>

                <Text style={styles.detail}>Model : {analysis.product?.model}</Text>

                <Text style={styles.detail}>Category : {analysis.product?.category}</Text>

                <Text style={styles.detail}>
                    Confidence :
                    {" "}
                    {Math.round((analysis.product?.confidence ?? 0) * 100)}%
                </Text>

            </View>

            <Text style={styles.section}>
                Components
            </Text>

            {analysis.components?.map((component: any) => (

                <View
                    key={component.id}
                    style={styles.componentCard}
                >

                    <Text style={styles.componentName}>
                        {component.name}
                    </Text>

                    <Text style={styles.detail}>
                        Material :
                        {" "}
                        {component.material}
                    </Text>

                    <Text style={styles.detail}>
                        Category :
                        {" "}
                        {component.category}
                    </Text>

                    <Text style={styles.detail}>
                        Manufacturing :
                        {" "}
                        {component.manufacturingProcess}
                    </Text>

                    <Text style={styles.detail}>
                        Assembly :
                        {" "}
                        {component.assemblyMethod}
                    </Text>

                    <Text style={styles.detail}>
                        Replaceable :
                        {" "}
                        {component.replaceable ? "Yes" : "No"}
                    </Text>

                    <Text style={styles.detail}>
                        Confidence :
                        {" "}
                        {Math.round(component.confidence * 100)}%
                    </Text>

                </View>

            ))}

        </ScrollView>

    );
}
