app.addDefinitions(() => {
    let g_componentUIs = {};

    app.components = app.components || {};
    app.components.addComponent = function(componentUISubclassFactory) {
        let ComponentUISubclass = componentUISubclassFactory();
        let uiInstance = new ComponentUISubclass();
        g_componentUIs[uiInstance.componentClass] = uiInstance;
    }

    app.components.getUIForComponent = function(componentClass) {
        return g_componentUIs[componentClass];
    }

    Object.defineProperty(app.components,"componentList", {
        get: function() {
            return g_componentUIs;
        }
    });

    class ComponentUI {

        constructor(componentClass,componentName,directiveName) {
            this._componentClass = componentClass;
            this._componentName = componentName;
            this._directiveName = directiveName;
        }

        get componentClass() { return this._componentClass; }
        get componentName() { return this._componentName; }
        get directiveName() { return this._directiveName; }
        get componentInstance() { return this._componentInstance; }

        set componentInstance(c) { this._componentInstance = c; }

        createInstance() {
            return null;
        }
    }

    app.components.ComponentUI = ComponentUI;
});

app.addSource(() => {
    let angularApp = angular.module(GLOBAL_APP_NAME);

    angularApp.directive("componentUi", ['$compile',function($compile) {
        /*
         * $scope.componentData = {
         *      identifier: component identifier, such as bg.scene.Camera
         *      ui: component UI instance for this component
         *      instance: component instance
         * }
         */
        return {
            restrict: "E",
            scope: {
                componentData:"="
            },
            link: function(scope,element) {
                let directive = scope.componentData.directiveName;
                let template = `<${ directive } component="componentData"></${ directive }>`;
                let linkFn = $compile(template);
                let content = linkFn(scope);
                element.append(content);
            },
            controller: ['$scope',function($scope) {
                
            }]
        }
    }])
});