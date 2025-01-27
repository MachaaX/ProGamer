/**
 * vehicle.js
 *
 * Defines:
 *   - Vehicle (base class)
 *   - RacingVehicle
 *   - TankVehicle
 *   - SteamVehicle
 *
 * Each vehicle class stores:
 *   - Terrain-specific acceleration/friction/turning formulas
 *   - A texture prefix (e.g. "car-", "tank-", "steam-")
 *   - Methods for computing velocity changes and selecting the correct sprite texture
 *
 * Example usage in your Phaser Scene:
 *   const vehicle = new RacingVehicle('sbremba');
 *   // Then, each frame, do:
 *   const movementData = vehicle.getMovementData(deltaMs, inputKeys, 'road');
 *   sprite.x += movementData.dx;
 *   sprite.y += movementData.dy;
 *   sprite.setTexture(movementData.texture);
 */

/** The base Vehicle class. */
class Vehicle {
    constructor() {
        this.name = '';
        this.velocity = 0; // linear velocity (px per "time unit"—your logic)
        this.angular = 0; // current angle in radians

        // Default terrain specifications. Children (RacingVehicle, TankVehicle, etc.)
        // can override or replace these in their constructors if desired.
        // Each terrain object has:
        //   - v_max: max forward speed
        //   - v_back_max: max reverse speed
        //   - a_max, a_back_max, a_break: acceleration values
        //   - dx(v, a, dt): how many px to move
        //   - dv(a, dt): how velocity changes
        //   - a_friction(dt, v): friction formula
        //   - ...
        this.terrain_specifications = {
            road: {
                v_max: 14,
                v_back_max: 2,
                a_max: 0.6,
                a_back_max: 1,
                a_break: 0.5,
                dx: function (v, a, dt) { return v * dt + a * dt * dt; },
                dv: function (a, dt) { return a * dt; },
                a: function (v) {
                    return this.a_max - Math.abs(this.a_max * v / this.v_max);
                },
                a_back: function (v) {
                    return this.a_back_max - Math.abs(this.a_back_max * v / this.v_back_max);
                },
                omega: function (v) { return Math.PI / (50 + 2 * Math.abs(v)); },
                dteta: function (dt, v) { return this.omega(v) * dt; },
                a_friction: function (dt, v) { return Math.abs(0.04 * v) * dt; },
                omega_friction: Math.PI / 160,
                teta_friction: function (dt) { return this.omega_friction * dt; }
            },
            dirt: {
                v_max: 2,
                v_back_max: 4,
                a_max: 0.5,
                a_back_max: 1,
                a_break: 0.1,
                dx: function (v, a, dt) { return v * dt + a * dt * dt; },
                dv: function (a, dt) { return a * dt; },
                a: function (v) {
                    return this.a_max - Math.abs(this.a_max * v / this.v_max);
                },
                a_back: function (v) {
                    return this.a_back_max - Math.abs(this.a_back_max * v / this.v_back_max);
                },
                omega: function (v) { return Math.PI / (40 + 4 * Math.abs(v)); },
                dteta: function (dt, v) { return this.omega(v) * dt; },
                a_friction: function (dt, v) { return Math.abs(0.01 * v) * dt; },
                omega_friction: Math.PI / 160,
                teta_friction: function (dt) { return this.omega_friction * dt; }
            },
            water: {
                v_max: 1,
                v_back_max: 1,
                a_max: 0.2,
                a_back_max: 0.2,
                a_break: 0.1,
                dx: function (v, a, dt) { return v * dt + a * dt * dt; },
                dv: function (a, dt) { return a * dt; },
                a: function (v) {
                    return this.a_max - Math.abs(this.a_max * v / this.v_max);
                },
                a_back: function (v) {
                    return this.a_back_max - Math.abs(this.a_back_max * v / this.v_back_max);
                },
                omega: function (v) { return Math.PI / (90 + 4 * Math.abs(v)); },
                dteta: function (dt, v) { return this.omega(v) * dt; },
                a_friction: function (dt, v) { return Math.abs(1 * v) * dt; },
                omega_friction: Math.PI / 160,
                teta_friction: function (dt) { return this.omega_friction * dt; }
            }
        };

        // Sprite texture prefix (e.g. "car-")
        this.texture_prefix = 'car-';

        // Used by getTexture to determine how big each "angle slice" is
        this.texture_midrange = Math.PI / 32;

        // Mapping from texture name (like 's', 'ssse', 'e', 'n', 'sooo', etc.)
        // to a central angle in radians. If the current angle is within +/- texture_midrange
        // of that angle, we pick that texture.
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

    /** Reset velocity/angle to zero. */
    reset() {
        this.velocity = 0;
        this.angular = 0;
    }

    /** Zero out just the linear velocity (but keep the angle). */
    resetVelocity() {
        this.velocity = 0;
    }

    /**
     * Compute how far the vehicle moves in x/y given the user input and terrain,
     * returning an object with { dx, dy, texture }.
     *
     * @param {number} deltat - Time elapsed in ms since last update
     * @param {object} keys   - { up: bool, down: bool, left: bool, right: bool }
     * @param {string} terrain - 'road', 'dirt', or 'water'
     */
    getMovementData(deltat, keys, terrain) {
        // Convert from ms to a "16ms step" style if you prefer to keep the old logic
        const dt = deltat / 16; // old code was for ~60fps, each step ~16ms

        // Turn (angular)
        if (keys.right && this.velocity !== 0) {
            this.angular -= this.terrain_specifications[terrain].dteta(dt, this.velocity);
        }
        if (keys.left && this.velocity !== 0) {
            this.angular += this.terrain_specifications[terrain].dteta(dt, this.velocity);
        }

        // Angular friction: if we aren't actively turning, gradually snap angle
        if (this.angular !== 0 && !keys.left && !keys.right) {
            // We try to nudge 'this.angular' to the nearest texture angle
            for (let d in this.textures) {
                const centerAngle = this.textures[d];
                const top_limit = centerAngle + this.texture_midrange;
                const bottom_limit = centerAngle - this.texture_midrange;

                // Because angles can wrap around 0/2π, handle the wrap logic:
                if (
                    (bottom_limit < 0 && (this.angular > 2 * Math.PI + bottom_limit || this.angular < top_limit)) ||
                    (this.angular >= bottom_limit && this.angular < top_limit)
                ) {
                    // If this.angular is just above centerAngle, nudge it downward
                    if (this.angular > centerAngle) {
                        const newAngle = this.angular - this.terrain_specifications[terrain].teta_friction(dt);
                        this.angular = newAngle > centerAngle ? newAngle : centerAngle;
                    }
                    // Otherwise nudge upward
                    else if (this.angular < centerAngle) {
                        const newAngle = this.angular + this.terrain_specifications[terrain].teta_friction(dt);
                        this.angular = newAngle < centerAngle ? newAngle : centerAngle;
                    }
                }
            }
        }

        // Normalize angle to [0, 2π)
        if (this.angular < 0) {
            this.angular += 2 * Math.PI;
        }
        if (this.angular >= 2 * Math.PI) {
            this.angular -= 2 * Math.PI;
        }

        // Compute acceleration based on keys and current velocity
        let acceleration = 0;

        // Forwards/backwards logic:
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

        // If neither up nor down pressed, apply friction
        if (!keys.up && !keys.down) {
            // Slowly reduce velocity to 0
            const friction = this.terrain_specifications[terrain].a_friction(dt, this.velocity);
            // friction is negative if velocity > 0, positive if velocity < 0
            acceleration = (this.velocity > 0) ? -friction : friction;
        }

        // dv = acceleration * dt
        const dv = this.terrain_specifications[terrain].dv(acceleration, dt);

        // distance traveled in this time slice
        const dx_val = this.terrain_specifications[terrain].dx(this.velocity, acceleration, dt);

        // If velocity is positive but dx < 0, that indicates contradictory motion. Zero it out:
        if (this.velocity > 0 && dx_val < 0) {
            // you could set dx_val = 0
        } else if (this.velocity < 0 && dx_val > 0) {
            // likewise
        }

        // Update velocity
        // If friction is the only factor, clamp velocity to 0 if we cross it
        if (!keys.up && !keys.down) {
            // friction step
            if (this.velocity > 0) {
                this.velocity = Math.max(0, this.velocity + dv);
            } else {
                this.velocity = Math.min(0, this.velocity + dv);
            }
        } else {
            // normal acceleration
            this.velocity += dv;
        }

        return {
            dx: dx_val * Math.sin(this.angular),
            dy: -dx_val * Math.cos(this.angular),  // Note: Original code might have used cos for y
            texture: this.getTexture()
        };
    }

    /**
     * Pick the current texture based on this.angular.
     */
    getTexture() {
        // Compare this.angular to each center angle in "this.textures"
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
        // Fallback:
        return this.texture_prefix + 's';
    }

    /**
     * Build an object describing which sprite images are needed for all angle frames,
     * so you can load them. For example:
     *   {
     *     images: {
     *       "car-s": "game/assets/images/vehicle/<vehicleName>/car-s.png",
     *       "car-se": ...,
     *       ...
     *     }
     *   }
     */
    getAssets() {
        const assets = { images: {} };
        for (let d in this.textures) {
            assets.images[this.texture_prefix + d] =
                'game/assets/images/vehicle/' + this.name + '/' + this.texture_prefix + d + '.png';
        }
        return assets;
    }
}

/** RacingVehicle subclass with higher speeds, etc. */
class RacingVehicle extends Vehicle {
    constructor(name) {
        super();
        this.name = name;
        this.texture_prefix = 'car-';

        // Example override of terrain specs for a "racing" style
        this.terrain_specifications = {
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
                v_max: 3,
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
    }

    getSpecifications() {
        // Just an example method showing some stats
        return {
            name: this.name,
            img: 'racing.png',
            velocity: { road: 80, dirt: 40, water: 20 },
            acceleration: { road: 70, dirt: 60, water: 20 },
            steering: { road: 70, dirt: 70, water: 20 }
        };
    }
}

/** TankVehicle subclass. */
class TankVehicle extends Vehicle {
    constructor(name) {
        super();
        this.name = name;
        this.texture_prefix = 'tank-';

        // Overridden specs for "tank" style
        this.terrain_specifications = {
            road: {
                v_max: 6,
                v_back_max: 2,
                a_max: 0.4,
                a_back_max: 0.4,
                a_break: 1,
                dx: function (v, a, dt) { return v * dt + a * dt * dt; },
                dv: function (a, dt) { return a * dt; },
                a: function (v) { return this.a_max - Math.abs(this.a_max * v / this.v_max); },
                a_back: function (v) { return this.a_back_max - Math.abs(this.a_back_max * v / this.v_back_max); },
                omega: function (v) { return Math.PI / (30 + 2 * Math.abs(v)); },
                dteta: function (dt, v) { return this.omega(v) * dt; },
                a_friction: function (dt, v) { return Math.abs(0.04 * v) * dt; },
                omega_friction: Math.PI / 160,
                teta_friction: function (dt) { return this.omega_friction * dt; }
            },
            dirt: {
                v_max: 9,
                v_back_max: 2,
                a_max: 0.8,
                a_back_max: 0.4,
                a_break: 1,
                dx: function (v, a, dt) { return v * dt + a * dt * dt; },
                dv: function (a, dt) { return a * dt; },
                a: function (v) { return this.a_max - Math.abs(this.a_max * v / this.v_max); },
                a_back: function (v) { return this.a_back_max - Math.abs(this.a_back_max * v / this.v_back_max); },
                omega: function (v) { return Math.PI / (30 + 2 * Math.abs(v)); },
                dteta: function (dt, v) { return this.omega(v) * dt; },
                a_friction: function (dt, v) { return Math.abs(0.04 * v) * dt; },
                omega_friction: Math.PI / 160,
                teta_friction: function (dt) { return this.omega_friction * dt; }
            },
            water: {
                v_max: 6,
                v_back_max: 2,
                a_max: 0.4,
                a_back_max: 0.4,
                a_break: 1,
                dx: function (v, a, dt) { return v * dt + a * dt * dt; },
                dv: function (a, dt) { return a * dt; },
                a: function (v) { return this.a_max - Math.abs(this.a_max * v / this.v_max); },
                a_back: function (v) { return this.a_back_max - Math.abs(this.a_back_max * v / this.v_back_max); },
                omega: function (v) { return Math.PI / (80 + 2 * Math.abs(v)); },
                dteta: function (dt, v) { return this.omega(v) * dt; },
                a_friction: function (dt, v) { return Math.abs(0.04 * v) * dt; },
                omega_friction: Math.PI / 160,
                teta_friction: function (dt) { return this.omega_friction * dt; }
            }
        };
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

/** SteamVehicle subclass. */
class SteamVehicle extends Vehicle {
    constructor(name) {
        super();
        this.name = name;
        this.texture_prefix = 'steam-';

        this.terrain_specifications = {
            road: {
                v_max: 40,
                v_back_max: 5,
                a_max: 0.1,
                a_back_max: 0.1,
                a_break: 0.1,
                dx: function (v, a, dt) { return v * dt + a * dt * dt; },
                dv: function (a, dt) { return a * dt; },
                a: function (v) { return this.a_max - Math.abs(this.a_max * v / this.v_max); },
                a_back: function (v) { return this.a_back_max - Math.abs(this.a_back_max * v / this.v_back_max); },
                omega: function (v) { return Math.PI / (90 + 1 * Math.abs(v)); },
                dteta: function (dt, v) { return this.omega(v) * dt; },
                a_friction: function (dt, v) { return Math.abs(0.01 * v) * dt; },
                omega_friction: Math.PI / 160,
                teta_friction: function (dt) { return this.omega_friction * dt; }
            },
            dirt: {
                v_max: 10,
                v_back_max: 5,
                a_max: 0.1,
                a_back_max: 0.1,
                a_break: 0.1,
                dx: function (v, a, dt) { return v * dt + a * dt * dt; },
                dv: function (a, dt) { return a * dt; },
                a: function (v) { return this.a_max - Math.abs(this.a_max * v / this.v_max); },
                a_back: function (v) { return this.a_back_max - Math.abs(this.a_back_max * v / this.v_back_max); },
                omega: function (v) { return Math.PI / (90 + 1 * Math.abs(v)); },
                dteta: function (dt, v) { return this.omega(v) * dt; },
                a_friction: function (dt, v) { return Math.abs(0.01 * v) * dt; },
                omega_friction: Math.PI / 160,
                teta_friction: function (dt) { return this.omega_friction * dt; }
            },
            water: {
                v_max: 10,
                v_back_max: 5,
                a_max: 0.1,
                a_back_max: 0.1,
                a_break: 0.1,
                dx: function (v, a, dt) { return v * dt + a * dt * dt; },
                dv: function (a, dt) { return a * dt; },
                a: function (v) { return this.a_max - Math.abs(this.a_max * v / this.v_max); },
                a_back: function (v) { return this.a_back_max - Math.abs(this.a_back_max * v / this.v_back_max); },
                omega: function (v) { return Math.PI / (90 + 1 * Math.abs(v)); },
                dteta: function (dt, v) { return this.omega(v) * dt; },
                a_friction: function (dt, v) { return Math.abs(0.01 * v) * dt; },
                omega_friction: Math.PI / 160,
                teta_friction: function (dt) { return this.omega_friction * dt; }
            }
        };
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

// If you're using ES modules, you can export them:
window.Vehicle = Vehicle;
window.RacingVehicle = RacingVehicle;
window.TankVehicle = TankVehicle;
window.SteamVehicle = SteamVehicle;
