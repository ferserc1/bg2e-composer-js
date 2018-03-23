
app.addDefinitions(() => {
    app.library = app.library || {};

    // Generate the "parent" attribute in the node
    // children, if the node is a group
    function buildParents(node) {
        if (node.children) {
            node.children.forEach((child) => {
                child.parent = node;
                buildParents(child);
            });
        }
    }

    // Clear the node "parent" attribute in the node children
    // if the node is a group.
    // Call this function before serialize the data using
    // JSON.stringify to prevent circular references
    function clearParents(node) {
        if (node.children) {
            node.children.forEach((child) => {
                delete child.parent;
                clearParents(child);
            });
        }
    }

    function initializeLibrary() {
        this._data = {
            id:"$root$",
            name:"root",
            type:"group",
            children:[
                {
                    type:"group",
                    id:"materials_group",
                    name:"Materials",
                    icon:"",
                    children:[
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        },
                        {
                            type:"material",
                            id:"mat1",
                            name:"Material 1",
                            icon:"",
                            materialModifier: {
                                "diffuseR": 0.9,
                                "diffuseG": 0.9,
                                "diffuseB": 0.9,
                                "diffuseA": 1,
                                "specularR": 1,
                                "specularG": 1,
                                "specularB": 1,
                                "specularA": 1,
                                "shininess": 0,
                                "lightEmission": 0,
                                "texture": "AAL40BK.jpg",
                                "textureOffsetX": 0,
                                "textureOffsetY": 0,
                                "textureScaleX": 1,
                                "textureScaleY": 1,
                                "normalMap": "00 Normal Map.jpg",
                                "normalMapOffsetX": 0,
                                "normalMapOffsetY": 0,
                                "normalMapScaleX": 16,
                                "normalMapScaleY": 16,
                                "alphaCutoff": 0.5,
                                "shininessMask": "",
                                "shininessMaskChannel": 0,
                                "invertShininessMask": 0
                            },
                            metadata: {}
                        }
                    ],
                    metadata:{}
                },
                {
                    type:"group",
                    id:"models",
                    name:"Models group",
                    icon:"",
                    children:[
                        {
                            type: "model",
                            id: "FAARLA00000",
                            name: "Módulo A",
                            icon: "FA_ARIANNE_LOVE_FAARLA00000.jpg",
                            file: "ARIANNE_L_A/ARIANNE_L_A.vwglb",
                            metadata: {
                                dock: "left,right",
                                group: "T3:T3,T4"
                            },
                            folderName: "ARIANNE_L_A"
						}
                    ],
                    metadata:{}
                },
                {
                    type:"group",
                    id:"subgroups",
                    name:"Subgroups",
                    icon:"",
                    children:[
                        {
                            type: "gropu",
                            id: "sg1",
                            name: "subgroup 1",
                            metadata: {},
                            children: [
                                {
                                    type: "gropu",
                                    id: "sg2",
                                    name: "subgroup 2",
                                    metadata: {},
                                    children: [
                                        {
                                            type: "gropu",
                                            id: "sg3",
                                            name: "subgroup 3",
                                            metadata: {},
                                            children: [
                                                {
                                                    type: "gropu",
                                                    id: "sg4",
                                                    name: "subgroup 4",
                                                    metadata: {},
                                                    children: [
                                                        
                                                    ]
                                                }
                                            ]
                                        }        
                                    ]
                                }        
                            ]
						}
                    ],
                    metadata:{}
                }
            ]
        };
        this._currentNode = this._data;
        buildParents(this._data);
    }

    class Library {
        constructor() {
            this._filePath = "";
            initializeLibrary.apply(this);
        }

        get filePath() { return this._filePath; }

        get root() { return this._data; }

        get currentNode() { return this._currentNode; }
        set currentNode(node) {
            if (this.contains(node)) {
                this._currentNode = node;
            }
        }

        get navigator() {
            let result = [];

            function addNavigatorItem(item) {
                if (item.parent) {
                    addNavigatorItem(item.parent);
                }
                result.push(item);
            }

            addNavigatorItem(this.currentNode);

            return result;
        }

        // TODO: manipulation functions: add, delete and sort nodes

        contains(node,parent=null) {
            let result = false;
            if (node==this._data) {
                result = true;
            }
            else if (!parent) {
                result = this.contains(node,this.root);
            }
            else if (parent.children && parent.children.indexOf(node)!=-1) {
                result = true;
            }
            else if (parent.children) {
                parent.children.some((child) => {
                    result = this.contains(node,child);
                    return result;
                });
            }
            return result;
        }

        clear() {
            initializeLibrary.apply(this);
        }

        deserialize(libraryData) {
            if (typeof(libraryData)=="string") {
                libraryData = JSON.parse(libraryData);
            }
            if (libraryData.type!="vwgl::library" || Array.isArray(libraryData.root)) {
                throw new Error("Malformed library");
            }
            this._data.children = libraryData.root;
            this._currentNode = this._data;
            buildParents(this._data);
        }

        serialize(tabulate = false) {
            clearParents(this._data);
            let result = tabulate ? JSON.stringify(this._data,"","\t") : JSON.stringify(this._data);
            buildParents(this._data);
            return result;
        }
    }

    app.library.Library = Library;
});