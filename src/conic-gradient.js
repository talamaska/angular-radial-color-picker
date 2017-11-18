export default function ConicGradient(size) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.size = size;
    this.canvas.width = this.canvas.height = this.size;
    this.from = 0;
    this.stops = [
        { color: [255, 0, 0, 1], pos: 0 },
        { color: [255, 255, 0, 1], pos: 0.16666666666666666 },
        { color: [0, 255, 0, 1], pos: 0.33333333333333337 },
        { color: [0, 255, 255, 1], pos: 0.5 },
        { color: [0, 0, 255, 1], pos: 0.6666666666666666 },
        { color: [255, 0, 255, 1], pos: 0.8333333333333333 },
        { color: [255, 0, 0, 1], pos: 1 },
    ];
    this.paint();
}

ConicGradient.eps = 0.00001;
ConicGradient.deg = Math.PI / 180;

ConicGradient.prototype = {
    toString: function() {
        return 'url("' + this.dataURL + '")';
    },

    get dataURL() {
        // IE/Edge only render data-URI based background-image when the image data
        // is escaped.
        // Ref: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/7157459/#comment-3
        return 'data:image/svg+xml,' + encodeURIComponent(this.svg);
    },

    get svg() {
        return (
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="none">' +
            '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">' +
            '<image width="100" height="100%" xlink:href="' +
            this.png +
            '" /></svg></svg>'
        );
    },

    get png() {
        return this.canvas.toDataURL();
    },

    get r() {
        return Math.sqrt(2) * this.size / 2;
    },

    // Paint the conical gradient on the canvas
    // Algorithm inspired from http://jsdo.it/akm2/yr9B
    paint: function() {
        var c = this.context;

        var radius = this.r;
        var x = this.size / 2;

        var stopIndex = 0; // The index of the current color
        var stop = this.stops[stopIndex],
            prevStop;

        var diff, t;

        // Transform coordinate system so that angles start from the top left, like in CSS
        c.translate(this.size / 2, this.size / 2);
        c.rotate(-90 * ConicGradient.deg);
        c.rotate(this.from * ConicGradient.deg);
        c.translate(-this.size / 2, -this.size / 2);

        for (var i = 0; i < 360; ) {
            if (i / 360 + ConicGradient.eps >= stop.pos) {
                // Switch color stop
                do {
                    prevStop = stop;

                    stopIndex++;
                    stop = this.stops[stopIndex];
                } while (stop && stop != prevStop && stop.pos === prevStop.pos);

                if (!stop) {
                    break;
                }

                var sameColor = prevStop.color + '' === stop.color + '' && prevStop != stop;

                diff = prevStop.color.map(function(c, i) {
                    return stop.color[i] - c;
                });
            }

            t = (i / 360 - prevStop.pos) / (stop.pos - prevStop.pos);

            var interpolated = sameColor
                ? stop.color
                : diff.map(function(d, i) {
                      var ret = d * t + prevStop.color[i];

                      return i < 3 ? ret & 255 : ret;
                  });

            // Draw a series of arcs, 1deg each
            c.fillStyle = 'rgba(' + interpolated.join(',') + ')';
            c.beginPath();
            c.moveTo(x, x);

            var theta = sameColor ? 360 * (stop.pos - prevStop.pos) : 0.5;

            var beginArg = i * ConicGradient.deg;
            beginArg = Math.min(360 * ConicGradient.deg, beginArg);

            // .02: To prevent empty blank line and corresponding moire
            // only non-alpha colors are cared now
            var endArg = beginArg + theta * ConicGradient.deg;
            endArg = Math.min(360 * ConicGradient.deg, endArg + 0.02);

            c.arc(x, x, radius, beginArg, endArg);

            c.closePath();
            c.fill();

            i += theta;
        }
    },
};
