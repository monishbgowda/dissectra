const path = require("path");

const ROOT = process.cwd();

const env = process.env.NODE_ENV || "development";

module.exports = {

    env,

    isProduction:
        env === "production",

    port:
        Number(process.env.PORT) || 4000,

    uploadRoot:
        process.env.UPLOAD_ROOT ||
        path.join(ROOT, "storage"),

    fastApiUrl:
        process.env.FASTAPI_URL ||
        "http://127.0.0.1:8000",

    apiPublicUrl:
        process.env.API_PUBLIC_URL ||
        "",

    corsOrigin:
        process.env.CORS_ORIGIN ||
        "*",

    frontendUrl:
        process.env.FRONTEND_URL ||
        "*",

    geminiKey:
        process.env.GEMINI_API_KEY,

    geminiModel:
        process.env.GEMINI_MODEL ||
        "gemini-1.5-flash",

    maxUploadBytes:
        Number(
            process.env.MAX_UPLOAD_BYTES
        ) ||
        10 * 1024 * 1024,

    modelProvider:
        process.env.MODEL_PROVIDER ||
        "mock",

    demoTripoKey:
        process.env.TRIPO_API_KEY,

    demoMeshyKey:
        process.env.MESHY_API_KEY,

    demoModelUrl:
        process.env.DEMO_MODEL_URL ||
        "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",

    aiAnalysisProvider:
        process.env.AI_ANALYSIS_PROVIDER ||
        "mock",

    openAIKey:
        process.env.OPENAI_API_KEY,

    openAIBaseUrl:
        process.env.OPENAI_BASE_URL ||
        "https://api.openai.com/v1",

    openAIModel:
        process.env.OPENAI_MODEL ||
        "gpt-4o-mini",

    openRouterKey:
        process.env.OPENROUTER_API_KEY,

    openRouterBaseUrl:
        process.env.OPENROUTER_BASE_URL ||
        "https://openrouter.ai/api/v1",

    openRouterModel:
        process.env.OPENROUTER_MODEL ||
        "google/gemini-2.0-flash-exp:free",

    compatibleProviderName:
        process.env.COMPATIBLE_PROVIDER_NAME ||
        "compatible",

    compatibleAPIKey:
        process.env.COMPATIBLE_API_KEY,

    compatibleBaseUrl:
        process.env.COMPATIBLE_BASE_URL,

    compatibleModel:
        process.env.COMPATIBLE_MODEL,

};
