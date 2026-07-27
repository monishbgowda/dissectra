import api from "./api";

export async function analyzeInspection(
    inspectionId
) {

    if (!inspectionId) {

        throw new Error(
            "Inspection ID is required."
        );

    }

    const response =
        await api.post(
            `/api/${inspectionId}/analyze`
        );

    return response.data;

}