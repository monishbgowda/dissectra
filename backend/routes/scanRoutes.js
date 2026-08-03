const express = require("express");

const upload =
    require("../middleware/uploadMiddleware");

const inspectionController =
    require("../controllers/inspectionController");

const router =
    express.Router();

/*
|--------------------------------------------------------------------------
| Health
|--------------------------------------------------------------------------
*/

router.get(

    "/health",

    inspectionController.health,

);

/*
|--------------------------------------------------------------------------
| Upload
|--------------------------------------------------------------------------
*/

router.post(

    "/upload",

    upload.single("image"),

    inspectionController.upload,

);

/*
|--------------------------------------------------------------------------
| Analysis
|--------------------------------------------------------------------------
*/

router.post(

    "/:inspectionId/analyze",

    inspectionController.analyze,

);

/*
|--------------------------------------------------------------------------
| Inspection Model
|--------------------------------------------------------------------------
*/

router.post(

    "/:inspectionId/model",

    inspectionController.generateInspectionModel,

);

/*
|--------------------------------------------------------------------------
| Standalone Model Generation
|--------------------------------------------------------------------------
*/

router.post(

    "/generate-model",

    inspectionController.generateModelJob,

);

/*
|--------------------------------------------------------------------------
| Model Status
|--------------------------------------------------------------------------
*/

router.get(

    "/model-status/:jobId",

    inspectionController.modelStatus,

);

/*
|--------------------------------------------------------------------------
| History
|--------------------------------------------------------------------------
*/

router.get(

    "/history",

    inspectionController.history,

);

module.exports =
    router;