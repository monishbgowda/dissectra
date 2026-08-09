const Pipeline =
    require("./Pipeline");

const AnalyzeStage =
    require("../stages/AnalyzeStage");

const CreateInspectionStage =
    require("../stages/CreateInspectionStage");

const MatchComponentsStage =
    require("../stages/MatchComponentsStage");

const ReconstructionStage =
    require("../stages/ReconstructionStage");

const AssetPipelineStage =
    require("../stages/AssetPipelineStage");

const ComponentGraphStage =
    require("../stages/ComponentGraphStage");

const ExplodedViewStage =
    require("../stages/ExplodedViewStage");

const GenerateBOMStage =
    require("../stages/GenerateBOMStage");

const SaveInspectionStage =
    require("../stages/SaveInspectionStage");

const CleanupStage =
    require("../stages/CleanupStage");

const inspectionPipeline = new Pipeline([

    new AnalyzeStage(),

    new CreateInspectionStage(),

    new MatchComponentsStage(),

    new ReconstructionStage(),

    new AssetPipelineStage(),

    new ComponentGraphStage(),

    new ExplodedViewStage(),

    new GenerateBOMStage(),

    new SaveInspectionStage(),

    new CleanupStage()

]);

module.exports = inspectionPipeline;