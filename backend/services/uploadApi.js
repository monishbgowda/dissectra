import api from "./api";

export async function uploadInspectionImage(

    inspectionId,

    imagePath

) {

    if (!inspectionId) {

        throw new Error(
            "Inspection ID is required."
        );

    }

    if (!imagePath) {

        throw new Error(
            "Image path is required."
        );

    }

    const formData = new FormData();

    formData.append(

        "inspectionId",

        inspectionId

    );

formData.append(
    "image",
    {
        uri: imagePath,
        type: "image/jpeg",
        name: imagePath.split("/").pop() || "image.jpg",
    }
);

const response = await api.post(
    "/api/upload",
    formData
);

    return response.data;

}