// garage.js

class Garage {
    /**
     * Returns a list of available vehicles.
     */
    static getVehicles() {
        return [
            new RacingVehicle('sbremba'),
            new TankVehicle('tesoterro'),
            new SteamVehicle('pilu')
        ];
    }
}

// Expose as global if desired
window.Garage = Garage;
