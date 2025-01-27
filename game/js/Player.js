// player.js
class Player {
    constructor() {
        this.name = "Unknown";
        this.vehicle = null; // e.g. a Vehicle instance
    }

    setName(name) {
        this.name = name;
    }

    getName() {
        return this.name;
    }

    setVehicle(vehicle) {
        this.vehicle = vehicle;
    }

    getVehicle() {
        return this.vehicle;
    }
}
