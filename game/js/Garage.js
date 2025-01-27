// garage.js

class Garage {
    static getVehicles() {
        return [
            new RacingVehicle('sbremba'),
            new TankVehicle('tesoterro'),
            new SteamVehicle('pilu')
        ];
    }
}

window.Garage = Garage;
