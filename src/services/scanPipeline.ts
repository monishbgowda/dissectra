import {
    analyzeImage,
    generateModel,
    getModelStatus,
    uploadImage,
} from "./dissectraApi";

import {
} from "../storage/inspectionStorage";

import {
    copyToStorage,
    downloadModelToStorage,
    saveScan,
} from "../storage/localStorage";

import type {
    AnatomyAnalysis,
    ModelGenerationResponse,
    StoredScan,
} from "../types/dissectra";

function wait(ms: number) {
    return new Promise<void>((resolve) =>
        setTimeout(resolve, ms)
    );
}

async function pollModelStatus(jobId: string) {

    console.log("========== POLLING MODEL ==========");

    const maxAttempts = 12;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {

        console.log(
            `Polling attempt ${attempt + 1}/${maxAttempts}`
        );

        const status =
            await getModelStatus(jobId);

        console.log("Model Status:", status);

        if (
            status.status === "complete" ||
            status.status === "failed"
        ) {

            console.log(
                "Model generation finished."
            );

            return status;

        }

        await wait(
            2000 + attempt * 500
        );

    }

    throw new Error(
        "Model generation timed out."
    );

}

const OFFLINE_ANALYSIS: AnatomyAnalysis = {

    object:
        "Offline anatomy scan",

    description:
        "Saved locally. Connect to the network to analyze and generate the 3D model.",

    labels: [
        "offline",
        "cached",
    ],

    confidence: 0,

};

async function saveOfflineScan(
    id: string,
    imageUri: string,
    localImagePath?: string,
    analysis: AnatomyAnalysis =
        OFFLINE_ANALYSIS,
): Promise<StoredScan> {

    console.log(
        "Saving offline scan..."
    );

    const scan: StoredScan = {

        id,

        imageUri,

        localImagePath,

        analysis,

        createdAt:
            new Date().toISOString(),

        status: "offline",

    };

    await saveScan(scan);

    console.log(
        "Offline scan saved."
    );

    return scan;

}

export async function runScanPipeline(
    imageUri: string,
    inspectionId?: string,
): Promise<StoredScan> {

    console.log("");
    console.log(
        "========== SCAN PIPELINE START =========="
    );

    const id = inspectionId || String(Date.now());

    console.log("STEP 1");
    console.log("Copying image...");

    const localImagePath =
        await copyToStorage(
            imageUri,
            "images",
            `${id}.jpg`,
        ).catch((err) => {

            console.error(
                "Image copy failed:",
                err
            );

            return undefined;

        });

    console.log("STEP 2");
    console.log("Uploading image...");

    let upload;

    try {

        upload =
            await uploadImage(
                imageUri,
                `${id}.jpg`,
                id,
            );

        console.log(
            "Upload successful:"
        );

        console.log(upload);

    }

    catch (err) {
    console.error("UPLOAD FAILED");
    console.error(err);

    throw err;
}

    console.log("STEP 3");
    console.log("Running analysis...");

    let analysis: AnatomyAnalysis;

    try {

        analysis =
            await analyzeImage(
                id,
            );

        console.log(
            "Analysis complete."
        );

        console.log(analysis);

    }

    catch (err) {
    console.error("ANALYSIS FAILED");
    console.error(err);

    throw err;
}

    console.log("STEP 4");
    console.log("Generating model...");

    let model: ModelGenerationResponse;

    try {

        const initialModel =
            await generateModel(
                upload.uploadId,
            );

        console.log(
            "Initial model response:"
        );

        console.log(initialModel);

        model =
            initialModel.status === "queued" ||
            initialModel.status === "processing"

                ? await pollModelStatus(
                      initialModel.jobId,
                  )

                : initialModel;

        console.log(
            "Final model:"
        );

        console.log(model);

    }

    catch (err) {

    console.error("MODEL FAILED");

    console.error(err);

    throw err;

}

    console.log("STEP 5");
    console.log(
        "Downloading model..."
    );

    const localModelPath =
        model.modelUrl

            ? await downloadModelToStorage(

                  model.modelUrl,

                  `${id}.glb`,

              ).catch((err) => {

                  console.error(
                      "Download failed:"
                  );

                  console.error(err);

                  return undefined;

              })

            : undefined;

    console.log("STEP 6");
    console.log("Saving scan...");

    const scan: StoredScan = {

        id,

        imageUri,

        localImagePath,

        modelUri:
            localModelPath ||
            model.modelUrl,

        localModelPath,

        analysis,

        createdAt:
            new Date().toISOString(),

        status:
            model.status === "failed"

                ? "failed"

                : "complete",

    };

    await saveScan(scan);

    console.log(
        "Scan saved successfully."
    );

    console.log("STEP 7");
    console.log(
        "========== PIPELINE COMPLETE =========="
    );

    return scan;

}