import { api } from "../../src/services/apiClient";
import logger from "../utils/logger";
export async function analyzeInspection(
    inspectionId
) {

    logger.info("================================");
    logger.info("Calling Analyze");
    logger.info("Inspection ID:", inspectionId);
    logger.info("================================");

    try {
logger.info("BASE URL:", api.defaults.baseURL);
logger.info("REQUEST:", `/${inspectionId}/analyze`);
        const response =
            await api.post(
                `/${inspectionId}/analyze`
            );

        logger.info("SUCCESS");
        logger.info(response.data);

        return response.data;

    }

    catch (error) {

        logger.info("========== ANALYZE FAILED ==========");

        logger.info("Message:");
        logger.info(error.message);

        logger.info("Code:");
        logger.info(error.code);

        logger.info("Status:");
        logger.info(error.response?.status);

        logger.info("Response:");
        logger.info(error.response?.data);

        logger.info("URL:");
        logger.info(error.config?.baseURL + error.config?.url);

        logger.info("====================================");

        throw error;

    }

}

module.exports = {

    analyzeInspection

};
