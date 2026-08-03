const { runScanPipeline } = require("./scanPipeline");

(async () => {
    try {
        console.log("Starting pipeline...");

        const result = await runScanPipeline(
            "file:///path/to/test.jpg"
        );

        console.log(result);

    } catch (err) {
        console.error(err);
    }
})();
