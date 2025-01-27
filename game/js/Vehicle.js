// vehicle.js

class Vehicle {
    constructor() {
        this.name = '';
        this.velocity = 0;
        this.angular = 0;

        // Default terrain specs (Phaser 2 style)
        this.terrain_specifications = {
            // ...
            // (Keep exactly as in your old code)
            road: {
                v_max: 14,
                v_back_max: 2,
                a_max: 0.6,
                a_back_max: 1,
                a_break: 0.5,
                dx: function (v, a, dt) { return v * dt + a * dt * dt; },
                dv: function (a, dt) { return a * dt; },
                a: function (v) { return this.a_max - Math.abs(this.a_max * v / this.v_max); },
                a_back: function (v) { return this.a_back_max - Math.abs(this.a_back_max * v / this.v_back_max); },
                omega: function (v) { return Math.PI / (50 + 2 * Math.abs(v)); },
                dteta: function (dt, v) { return this.omega(v) * dt; },
                a_friction: function (dt, v) { return Math.abs(0.04 * v) * dt; },
                omega_friction: Math.PI / 160,
                teta_friction: function (dt) { return this.omega_friction * dt; }
            },
            dirt: {
                // same as old code
                v_max: 2,
                v_back_max: 4,
                a_max: 0.5,
                a_back_max: 1,
                a_break: 0.1,
                dx: function (v, a, dt) { return v * dt + a * dt * dt; },
                dv: function (a, dt) { return a * dt; },
                a: function (v) { return this.a_max - Math.abs(this.a_max * v / this.v_max); },
                a_back: function (v) { return this.a_back_max - Math.abs(this.a_back_max * v / this.v_back_max); },
                omega: function (v) { return Math.PI / (40 + 4 * Math.abs(v)); },
                dteta: function (dt, v) { return this.omega(v) * dt; },
                a_friction: function (dt, v) { return Math.abs(0.01 * v) * dt; },
                omega_friction: Math.PI / 160,
                teta_friction: function (dt) { return this.omega_friction * dt; }
            },
            water: {
                // same as old code
                v_max: 1,
                v_back_max: 1,
                a_max: 0.2,
                a_back_max: 0.2,
                a_break: 0.1,
                dx: function (v, a, dt) { return v * dt + a * dt * dt; },
                dv: function (a, dt) { return a * dt; },
                a: function (v) { return this.a_max - Math.abs(this.a_max * v / this.v_max); },
                a_back: function (v) { return this.a_back_max - Math.abs(this.a_back_max * v / this.v_back_max); },
                omega: function (v) { return Math.PI / (90 + 4 * Math.abs(v)); },
                dteta: function (dt, v) { return this.omega(v) * dt; },
                a_friction: function (dt, v) { return Math.abs(1 * v) * dt; },
                omega_friction: Math.PI / 160,
                teta_friction: function (dt) { return this.omega_friction * dt; }
            }
        };

        this.texture_prefix = 'car-';
        this.texture_midrange = Math.PI / 32;
        this.textures = {
            s: 0,
            sssse: Math.PI / 16,
            ssse: 2 * Math.PI / 16,
            sse: 3 * Math.PI / 16,
            se: 4 * Math.PI / 16,
            see: 5 * Math.PI / 16,
            seee: 6 * Math.PI / 16,
            seeee: 7 * Math.PI / 16,
            e: Math.PI / 2,
            neeee: 9 * Math.PI / 16,
            neee: 10 * Math.PI / 16,
            nee: 11 * Math.PI / 16,
            ne: 12 * Math.PI / 16,
            nne: 13 * Math.PI / 16,
            nnne: 14 * Math.PI / 16,
            nnnne: 15 * Math.PI / 16,
            n: Math.PI,
            nnnno: 17 * Math.PI / 16,
            nnno: 18 * Math.PI / 16,
            nno: 19 * Math.PI / 16,
            no: 20 * Math.PI / 16,
            noo: 21 * Math.PI / 16,
            nooo: 22 * Math.PI / 16,
            noooo: 23 * Math.PI / 16,
            o: 3 * Math.PI / 2,
            soooo: 25 * Math.PI / 16,
            sooo: 26 * Math.PI / 16,
            soo: 27 * Math.PI / 16,
            so: 28 * Math.PI / 16,
            sso: 29 * Math.PI / 16,
            ssso: 30 * Math.PI / 16,
            sssso: 31 * Math.PI / 16
        };
    }

    reset() {
        this.velocity = 0;
        this.angular = 0;
    }

    resetVelocity() {
        this.velocity = 0;
    }

    /**
     * dt is expected to be ~1 per 16 ms.
     */
    getMovementData(dt, keys, terrain) {
        // turning
        if (keys.right && this.velocity !== 0) {
            this.angular -= this.terrain_specifications[terrain].dteta(dt, this.velocity);
        }
        if (keys.left && this.velocity !== 0) {
            this.angular += this.terrain_specifications[terrain].dteta(dt, this.velocity);
        }

        // angular friction
        if (this.angular !== 0 && !keys.left && !keys.right) {
            for (let d in this.textures) {
                const centerAngle = this.textures[d];
                const top_limit = centerAngle + this.texture_midrange;
                const bottom_limit = centerAngle - this.texture_midrange;
                if (
                    (bottom_limit < 0 && (this.angular > 2 * Math.PI + bottom_limit || this.angular < top_limit)) ||
                    (this.angular >= bottom_limit && this.angular < top_limit)
                ) {
                    if (this.angular > centerAngle) {
                        const newAngle = this.angular - this.terrain_specifications[terrain].teta_friction(dt);
                        this.angular = (newAngle > centerAngle) ? newAngle : centerAngle;
                    } else if (this.angular < centerAngle) {
                        const newAngle = this.angular + this.terrain_specifications[terrain].teta_friction(dt);
                        this.angular = (newAngle < centerAngle) ? newAngle : centerAngle;
                    }
                }
            }
        }

        // normalize angle
        if (this.angular < 0) {
            this.angular += 2 * Math.PI;
        } else if (this.angular >= 2 * Math.PI) {
            this.angular -= 2 * Math.PI;
        }

        // acceleration
        let acceleration = 0;
        if (this.velocity > 0 || (this.velocity === 0 && keys.up)) {
            if (keys.up) {
                acceleration = this.terrain_specifications[terrain].a(this.velocity);
            }
            if (keys.down) {
                acceleration = -this.terrain_specifications[terrain].a_break;
            }
        } else if (this.velocity < 0 || (this.velocity === 0 && keys.down)) {
            if (keys.down) {
                acceleration = -this.terrain_specifications[terrain].a_back(this.velocity);
            }
            if (keys.up) {
                acceleration = this.terrain_specifications[terrain].a(0);
            }
        }

        // friction if no up/down pressed
        if (!keys.up && !keys.down) {
            const friction = this.terrain_specifications[terrain].a_friction(dt, this.velocity);
            acceleration = (this.velocity > 0) ? -friction : friction;
        }

        // dv, dx
        const dv = this.terrain_specifications[terrain].dv(acceleration, dt);
        const dx_val = this.terrain_specifications[terrain].dx(this.velocity, acceleration, dt);

        // update velocity
        if (!keys.up && !keys.down) {
            // friction
            if (this.velocity > 0) {
                this.velocity = Math.max(0, this.velocity + dv);
            } else {
                this.velocity = Math.min(0, this.velocity + dv);
            }
        } else {
            this.velocity += dv;
        }

        return {
            dx: dx_val * Math.sin(this.angular),
            dy: -dx_val * Math.cos(this.angular), // old code used cos for Y
            texture: this.getTexture()
        };
    }

    getTexture() {
        for (let d in this.textures) {
            const centerAngle = this.textures[d];
            const top_limit = centerAngle + this.texture_midrange;
            const bottom_limit = centerAngle - this.texture_midrange;
            if (
                (bottom_limit < 0 && (this.angular > 2 * Math.PI + bottom_limit || this.angular < top_limit)) ||
                (this.angular >= bottom_limit && this.angular < top_limit)
            ) {
                return this.texture_prefix + d;
            }
        }
        // fallback
        return this.texture_prefix + 's';
    }

    // For loading images
    getAssets() {
        const assets = { images: {} };
        for (let d in this.textures) {
            assets.images[this.texture_prefix + d] =
                `game/assets/images/vehicle/${this.name}/${this.texture_prefix}${d}.png`;
        }
        return assets;
    }
}

// Specialized:
class RacingVehicle extends Vehicle {
    constructor(name) {
        super();
        this.name = name;
        this.texture_prefix = 'car-';
        // override terrain specs if needed
        // ...
    }
    getSpecifications() {
        return {
            name: this.name,
            img: 'racing.png',
            velocity: { road: 80, dirt: 40, water: 20 },
            acceleration: { road: 70, dirt: 60, water: 20 },
            steering: { road: 70, dirt: 70, water: 20 }
        };
    }
}

class TankVehicle extends Vehicle {
    constructor(name) {
        super();
        this.name = name;
        this.texture_prefix = 'tank-';
        // override specs if needed
        // ...
    }
    getSpecifications() {
        return {
            name: this.name,
            img: 'tank.png',
            velocity: { road: 60, dirt: 70, water: 60 },
            acceleration: { road: 60, dirt: 80, water: 60 },
            steering: { road: 80, dirt: 80, water: 30 }
        };
    }
}

class SteamVehicle extends Vehicle {
    constructor(name) {
        super();
        this.name = name;
        this.texture_prefix = 'steam-';
        // override specs if needed
        // ...
    }
    getSpecifications() {
        return {
            name: this.name,
            img: 'steam.png',
            velocity: { road: 95, dirt: 75, water: 75 },
            acceleration: { road: 20, dirt: 20, water: 20 },
            steering: { road: 10, dirt: 10, water: 10 }
        };
    }
}

window.Vehicle = Vehicle;
window.RacingVehicle = RacingVehicle;
window.TankVehicle = TankVehicle;
window.SteamVehicle = SteamVehicle;
