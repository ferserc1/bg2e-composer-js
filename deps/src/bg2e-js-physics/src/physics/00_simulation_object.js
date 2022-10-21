(function() {

    bg.physics = bg.physics || {};

    class SimulationObject {
        constructor() {
            this._impl = null;
        }

        beginSimulation() { console.warning("Using simulation object without beginSimulation implementation"); }
        endSimulation() { console.warning("Using simulation object without endSimulation implementation"); }
        get isSimulationRunning() { return this._impl!=null; }
    }

    bg.physics.SimulationObject = SimulationObject;

})();