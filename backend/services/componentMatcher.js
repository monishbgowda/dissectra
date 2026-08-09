const COMPONENT_LIBRARY = {

    scroll_wheel: {
        aliases: [
            "scroll wheel",
            "mouse wheel",
            "wheel"
        ],
        category: "Input",
        sketchfabQuery: "computer mouse scroll wheel",
        meshTag: "scroll_wheel"
    },

    left_button: {
        aliases: [
            "left button",
            "primary click button",
            "primary click buttons",
            "left click"
        ],
        category: "Input",
        sketchfabQuery: "computer mouse button",
        meshTag: "left_button"
    },

    right_button: {
        aliases: [
            "right button",
            "secondary click button",
            "right click"
        ],
        category: "Input",
        sketchfabQuery: "computer mouse button",
        meshTag: "right_button"
    },

    dpi_button: {
        aliases: [
            "dpi button",
            "dpi adjustment button",
            "dpi switch"
        ],
        category: "Input",
        sketchfabQuery: "mouse dpi button",
        meshTag: "dpi_button"
    },

    side_buttons: {
        aliases: [
            "side buttons",
            "thumb buttons",
            "auxiliary buttons"
        ],
        category: "Input",
        sketchfabQuery: "mouse side buttons",
        meshTag: "side_buttons"
    },

    upper_shell: {
        aliases: [
            "upper shell",
            "top shell",
            "housing"
        ],
        category: "Body",
        sketchfabQuery: "mouse shell",
        meshTag: "upper_shell"
    },

    lower_shell: {
        aliases: [
            "lower shell",
            "lower chassis",
            "base"
        ],
        category: "Body",
        sketchfabQuery: "mouse base",
        meshTag: "lower_shell"
    },

    usb_cable: {
        aliases: [
            "usb cable",
            "wired usb cable",
            "cable"
        ],
        category: "Electrical",
        sketchfabQuery: "usb cable",
        meshTag: "usb_cable"
    }

};

function normalize(text) {

    return String(text)
        .toLowerCase()
        .trim();

}

function findComponent(name) {

    const value = normalize(name);

    for (const [id, component] of Object.entries(COMPONENT_LIBRARY)) {

        if (
            component.aliases.some(
                alias => normalize(alias) === value
            )
        ) {

            return {

                id,

                ...component

            };

        }

    }

    return null;

}

async function matchComponents(inspection) {

    if (
        !inspection ||
        !Array.isArray(inspection.components)
    ) {

        return inspection;

    }

    inspection.components =
        inspection.components.map(component => {

            const match =
                findComponent(component.name);

            if (!match) {

                return {

                    ...component,

                    matched: false

                };

            }

            return {

                ...component,

                matched: true,

                componentId: match.id,

                category: match.category,

                sketchfabQuery:
                    match.sketchfabQuery,

                meshTag:
                    match.meshTag

            };

        });

    return inspection;

}

module.exports = {

    matchComponents

};