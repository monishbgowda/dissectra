class ComponentGraph {

    constructor() {

        this.nodes = [];

        this.edges = [];

    }

    addNode(node) {

        if (!node) {

            return;

        }

        this.nodes.push(node);

    }

    connect(parent, child) {

        if (!parent || !child) {

            return;

        }

        this.edges.push({

            from: parent,

            to: child

        });

    }

}

module.exports = ComponentGraph;