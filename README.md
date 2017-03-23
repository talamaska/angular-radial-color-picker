# Angular Radial Color Picker

## Material design(ish) color picker with some animations sprinkled on top.

The color picker has been developed treating the mobile devices as first class citizens:
* Supports touch devices
* Responsive size
* Blazing fast GPU accelerated animations

The only dependency of Angular Radial Color Picker is [Propeller](https://github.com/PixelsCommander/Propeller) for rotating the knob.

## Quick Links:

* [Demos](#user-content-demos)
* [Install](#user-content-install)
* [API](#user-content-api)
* [Events](#user-content-events)
* [Styling/sizing](#user-content-stylingsizing)
* [Contribute](#user-content-contributing)

## <a name="demos">Demos</a>
Color Picker in a modal window - [GitHub Pages](https://talamaska.github.io/angular-radial-color-picker)

Barebones example - [Codepen](http://codepen.io/rkunev/pen/evYaBO)

## <a name="install">Install</a>

### NPM
Color Picker on [npm](https://www.npmjs.com/package/angular-radial-color-picker)
```bash
npm install angular-radial-color-picker
```

And in your html:

```html
<head>
    <!-- Include the css -->
    <link href="path/to/angular-radial-color-picker/dist/css/color-picker.min.css" rel="stylesheet">
</head>
<body>
    <!-- The actual color picker component -->
    <color-picker ng-model="$ctrl.initialColor" on-select="$ctrl.onSelect(color)"></color-picker>

    <!-- Angular Radial Color Picker Dependencies -->
    <script src="path/to/propeller.min.js"></script>
    <script src="path/to/angular/angular.min.js"></script>

    <!-- Include the package -->
    <script src="path/to/angular-radial-color-picker/dist/js/color-picker.min.js"></script>
</body>
```

Once you have all the necessary assets installed, add `color.picker.core` as a dependency for your app:
```javascript
angular.module('myApp', ['color.picker.core']);
```

[Back To Top](#user-content-quick-links)

## <a name="api">API</a>
`<color-picker></color-picker>` component has 2 attributes:

- `ng-model` Object for initializing/changing the color of the picker (optional). Properties:

| Name  | Type   | Default | Description |
|-------|--------|---------|------------------------------|
| red   | number | 255     | An integer between 0 and 255 |
| green | number | 0       | An integer between 0 and 255 |
| blue  | number | 0       | An integer between 0 and 255 |

- `on-select` callback which gets triggered when a color is selected (optional, see [Events](#user-content-events)). The passed function is invoked with one argument which is an object with the following properties:

| Name  | Type   | Description                  |
|-------|--------|------------------------------|
| hex   | string | A hexidecimal string         |
| rgba  | object | RGBA color model             |
| hsla  | object | HSLA color model             |

- RGBA Color model:

| Name  | Type   | Default | Description |
|-------|--------|---------|-------------|
| red   | number | 255     | An integer between 0 and 255 |
| green | number | 0       | An integer between 0 and 255 |
| blue  | number | 0       | An integer between 0 and 255 |
| alpha | number | 1       | Transparency. A number between 0 and 1 |

- HSLA Color model:

| Name       | Type   | Default | Description |
|------------|--------|---------|-------------|
| hue        | number | 0       | A number between 0 and 359 |
| saturation | number | 100     | A number between 0 and 100 |
| luminosity | number | 50      | A number between 0 and 100 |
| alpha      | number | 1       | A number between 0 and 1 |

[Back To Top](#user-content-quick-links)

## <a name="events">Events</a>

For maximum flexibility the component utilizes the pub/sub pattern. For easier communication a set of events are provided that can even programatically open or close the picker without interacting with the UI. All events are published/subscribed at the `$rootScope` so that sibling components can subscribe to them too. All events carry the current (selected) color in the event data payload.

* `color-picker.show` - Fires when the color picker is about to show and **before** any animation is started.
* `color-picker.shown` - Fires when the color picker is shown and has finished animating.
* `color-picker.selected` - Fires when a color is selected via the middle selector. Event is fired right before `hide`.
* `color-picker.hide` - Fires when the color picker is about to hide and **before** any animation is started.
* `color-picker.hidden` - Fires when the color picker is hidden and has finished animating.

Example:
```javascript
// Listening for something interesting to happen:
$rootScope.$on('color-picker.selected', function(ev, color) {
    // a) using HSLA color model
    vm.selectedColor = 'hsla(' + color.hsla.hue + ', ' + color.hsla.saturation + '%, ' + color.hsla.luminosity + '%, ' + color.hsla.alpha + ')';

    // b) using RGB color model
    vm.selectedColor = 'rgb(' + color.rgb.red + ', ' + color.rgb.green + ', ' + color.rgb.blue + ')';

    // c) plain old hex
    vm.selectedColor = '#' + color.hex;
});

// The good'n'tested "poke-it-with-a-stick" method:
$rootScope.$broadcast('color-picker.open');
```

[Back To Top](#user-content-quick-links)

## <a name="styling">Styling/sizing</a>

The color picker has a default width/height of 280px, but can also be sized via CSS. For example:
```css
color-picker {
    width: 350px;
    height: 350px;
}
```

[Back To Top](#user-content-quick-links)

## Contributing
TBD

[Back To Top](#user-content-quick-links)
