function buildSearchQuery(component) {

    if (!component) {

        throw new Error(
            "buildSearchQuery: component is required."
        );

    }

    return {

        query:
            component.sketchfabQuery,

        categories: [

            "technology"

        ],

        animated: false,

        downloadable: true

    };

}

module.exports = {

    buildSearchQuery

};