/**
 * Modified version of Denis Radin's Propeller.
 *
 * @link https://github.com/PixelsCommander/Propeller
 */
export default function Propeller(element, options) {
    this.last = 0;
    this.active = false;
    this.element = element;
    this.update = this.update.bind(this);

    this.initAngleGetterSetter();
    this.initOptions(options);
    this.initHardwareAcceleration();
    this.bindHandlers();
    this.addListeners();
    this.update();
}

Propeller.prototype.initAngleGetterSetter = function () {
    Object.defineProperty(this, 'angle', {
        get: function () {
            return this.normalizeAngle(this._angle * Propeller.radToDegMulti);
        },
        set: function (value) {
            var rads = value * Propeller.degToRadMulti;

            this._angle = rads;
            this.virtualAngle = rads;
            this.updateCSS();
        }
    });
}

Propeller.prototype.normalizeAngle = function(angle) {
    var result = angle % 360;

    if (result < 0) {
        result = 360 + result;
    }

    return result;
}

Propeller.prototype.initOptions = function (options) {
    var defaults = {
        angle: 0,
        speed: 0,
        inertia: 0,
        minimalSpeed: 0.0087, // in rad, (1/2 degree)
        minimalAngleChange: 0.0087, // in rad, (1/2 degree)
    };

    options = options || defaults;

    this.onRotate = options.onRotate;
    this.onStop = options.onStop;
    this.onDragStop = options.onDragStop;
    this.onDragStart = options.onDragStart;

    this.angle = options.angle || defaults.angle;
    this.speed = (options.speed * Propeller.degToRadMulti) || defaults.speed;

    this.inertia = options.inertia || defaults.inertia;
    this.minimalSpeed = options.minimalSpeed || defaults.minimalSpeed;
    this.lastAppliedAngle = this.virtualAngle = this._angle = (options.angle * Propeller.degToRadMulti) || defaults.angle;
    this.minimalAngleChange = options.minimalAngleChange || defaults.minimalAngleChange;
}

Propeller.prototype.bindHandlers = function () {
    this.onRotationStart = this.onRotationStart.bind(this);
    this.onRotationStop = this.onRotationStop.bind(this);
    this.onRotated = this.onRotated.bind(this);
}

Propeller.prototype.addListeners = function () {
    this.listenersInstalled = true;

    this.element.addEventListener('touchstart', this.onRotationStart, { passive: true });
    this.element.addEventListener('touchmove', this.onRotated);
    this.element.addEventListener('touchend', this.onRotationStop, { passive: true });
    this.element.addEventListener('touchcancel', this.onRotationStop, { passive: true });

    this.element.addEventListener('mousedown', this.onRotationStart, { passive: true });
    this.element.addEventListener('mousemove', this.onRotated);
    this.element.addEventListener('mouseup', this.onRotationStop, { passive: true });
    this.element.addEventListener('mouseleave', this.onRotationStop);
}

Propeller.prototype.removeListeners = function () {
    this.listenersInstalled = false;

    this.element.removeEventListener('touchstart', this.onRotationStart);
    this.element.removeEventListener('touchmove', this.onRotated);
    this.element.removeEventListener('touchend', this.onRotationStop);
    this.element.removeEventListener('touchcancel', this.onRotationStop);

    this.element.removeEventListener('mousedown', this.onRotationStart);
    this.element.removeEventListener('mousemove', this.onRotated);
    this.element.removeEventListener('mouseup', this.onRotationStop);
    this.element.removeEventListener('mouseleave', this.onRotationStop);
}

Propeller.prototype.bind = function () {
    if (this.listenersInstalled !== true) {
        this.addListeners();
    }
}

Propeller.prototype.unbind = function () {
    if (this.listenersInstalled === true) {
        this.removeListeners();
        this.onRotationStop();
    }
}

Propeller.prototype.stop = function () {
    this.speed = 0;
    this.onRotationStop();
}

Propeller.prototype.onRotationStart = function (event) {
    this.initDrag();
    this.active = true;

    if (this.onDragStart !== undefined) {
        this.onDragStart(event);
    }
}

Propeller.prototype.onRotationStop = function (event) {
    if (this.onDragStop !== undefined && this.active === true) {
        this.active = false;
        this.onDragStop();
    }

    this.active = false;
}

Propeller.prototype.onRotated = function (event) {
    event.preventDefault();

    if (this.active === true) {
        if (event.targetTouches !== undefined && event.targetTouches[0] !== undefined) {
            this.lastMouseEvent = {
                x: event.targetTouches[0].clientX,
                y: event.targetTouches[0].clientY,
            };
        } else {
            this.lastMouseEvent = {
                x: event.clientX,
                y: event.clientY,
            };
        }
    }
}

Propeller.prototype.update = function (now) {
    // Calculating angle on requestAnimationFrame only for optimisation purposes
    // 8ms is roughly 120fps
    if (!this.last || now - this.last >= 8) {
        this.last = now;

        if (this.lastMouseEvent !== undefined && this.active === true) {
            this.updateAngleToMouse(this.lastMouseEvent);
        }

        this._angle = this.virtualAngle;
        this.applySpeed();
        this.applyInertia();

        // Update rotation until the angle difference between prev and current angle is lower than the minimal angle change
        if (Math.abs(this.lastAppliedAngle - this._angle) >= this.minimalAngleChange) {
            this.updateCSS();

            if (this.onRotate !== undefined) {
                this.onRotate();
            }

            this.lastAppliedAngle = this._angle;
        }
    }

    window.requestAnimationFrame(this.update);
}

Propeller.prototype.applySpeed = function () {
    if (this.inertia > 0 && this.speed !== 0 && this.active === false) {
        this.virtualAngle += this.speed;
    }
}

Propeller.prototype.applyInertia = function () {
    if (this.inertia > 0) {
        if (Math.abs(this.speed) >= this.minimalSpeed) {
            this.speed = this.speed * this.inertia;

            // Execute onStop callback when speed is less than the given threshold
            if (this.onStop !== undefined && this.active === false && Math.abs(this.speed) < this.minimalSpeed) {
                this.onStop();
            }
        } else {
            // Stop rotation when rotation speed gets below a given threshold
            this.speed = 0;
        }
    }
}

Propeller.prototype.getAngleToMouse = function (newPoint) {
    var rect = this.element.getBoundingClientRect();
    var center = {
        x: rect.left + (rect.width / 2),
        y: rect.top + (rect.height / 2),
    };

    // atan2 gives values between -180 to 180 deg
    // offset the angle by 90 degrees so that it's 0 to 360 deg
    return Math.atan2(newPoint.y - center.y, newPoint.x - center.x) + Propeller.rightAngleInRadians;
}

Propeller.prototype.updateAngleToMouse = function (newPoint) {
    var newMouseAngle = this.getAngleToMouse(newPoint);

    if (this.lastMouseAngle === undefined) {
        this.lastElementAngle = this.virtualAngle;
        this.lastMouseAngle = newMouseAngle;
    }

    var oldAngle = this.virtualAngle;
    this.mouseDiff = newMouseAngle - this.lastMouseAngle;
    this.virtualAngle = this.lastElementAngle + this.mouseDiff;
    this.speed = this.differenceBetweenAngles(this.virtualAngle, oldAngle);
}

Propeller.prototype.differenceBetweenAngles = function (newAngle, oldAngle) {
    var delta = newAngle - oldAngle;
    var radians = Math.atan2(Math.sin(delta), Math.cos(delta));

    return Math.round(radians * 1000) / 1000;
}

Propeller.prototype.initDrag = function () {
    this.speed = 0;
    this.lastMouseAngle = undefined;
    this.lastElementAngle = undefined;
    this.lastMouseEvent = undefined;
}

Propeller.prototype.initHardwareAcceleration = function () {
    this.element.style.willChange = 'transform';
    this.updateCSS();
}

Propeller.prototype.updateCSS = function () {
    this.element.style.transform = 'rotate(' + this._angle + 'rad) ';
}

Propeller.radToDegMulti = 57.29577951308232; // 180 / Math.PI
Propeller.degToRadMulti = 0.017453292519943295; // Math.PI / 180
Propeller.rightAngleInRadians = 1.5707963267948966; // Math.PI / 2
