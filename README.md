## Angular Radial Color Picker

<p align="center"><img width="250" src="./screenshots/thumbnail.png" alt="screenshot"></p>

<p align="center"><a href="https://www.npmjs.com/package/angular-radial-color-picker"> <img src="https://img.shields.io/npm/dt/angular-radial-color-picker.svg" alt="Downloads"> </a> <a href="https://www.npmjs.com/package/angular-radial-color-picker"> <img src="https://img.shields.io/npm/v/angular-radial-color-picker.svg" alt="Version"> </a> <a href="https://www.npmjs.com/package/angular-radial-color-picker"> <img src="https://img.shields.io/npm/l/angular-radial-color-picker.svg" alt="License"> </a></p>

## Introduction

Great UX starts with two basic principles - ease of use and simplicity. Selecting a color should be as easy as moving a slider, clicking a checkbox or pressing a key just like other basic form elements behave.

This is a flexible and elegant material design color picker. Developed with mobile devices and keyboard usage in mind. Key features:
* Small size - 5.4 KB gzipped (JS and CSS combined)
* Supports touch devices
* Responsive size
* Optimized animations
* Supports CommonJS and ES Modules
* Ease of use
    * Double click anywhere to move the knob to a color
    * <kbd>Tab</kbd> to focus the picker
    * <kbd>Up</kbd> or <kbd>Right</kbd> arrow key to increase hue. Hold <kbd>Ctrl</kbd> to go quicker
    * <kbd>Bottom</kbd> or <kbd>Left</kbd> arrow key decrease hue. Hold <kbd>Ctrl</kbd> to go quicker
    * <kbd>Enter</kbd> to select a color and close the picker or to open it
    * Mouse <kbd>ScrollUp</kbd> to increase and <kbd>ScrollDown</kbd> to decrease hue (Opt-in)

## Quick Links

* [Demos](#user-content-demos)
* [Usage](#user-content-usage)
* [Options](#user-content-options)
* [Events](#user-content-events)
* [Styling/sizing](#user-content-stylingsizing)
* [FAQ](#user-content-questions)
* [Contribute](#user-content-contributing)

## <a name="demos">Demos</a>
* Color Picker in a modal window - [GitHub Pages](https://talamaska.github.io/angular-radial-color-picker)
* Barebones example - [Codepen](http://codepen.io/rkunev/pen/evYaBO)

## <a name="usage">Usage</a>

#### With Module Build System
Color Picker on [npm](https://www.npmjs.com/package/angular-radial-color-picker)
```bash
npm install -S angular-radial-color-picker
```

And in your app:

```javascript
import angular from 'angular';
import colorPicker from 'angular-radial-color-picker';
import 'angular-radial-color-picker/dist/css/color-picker.scss';

angular.module('app', [colorPicker]);
```

Depending on your build tool of choice you have to setup the appropriate Webpack loaders or Rollup plugins. The color picker was tested with the latest versions of [sass-loader](https://github.com/webpack-contrib/sass-loader) and [rollup-plugin-postcss](https://github.com/egoist/rollup-plugin-postcss).

#### UMD version

You can also use the minified sources directly:

```html
<head>
    <link href="https://unpkg.com/angular-radial-color-picker@latest/dist/css/color-picker.min.css" rel="stylesheet">
</head>
<body ng-app="app">
    <color-picker></color-picker>

    <script src="https://unpkg.com/angular@1.6.6/angular.min.js"></script>
    <script src="https://unpkg.com/angular-radial-color-picker@latest/dist/color-picker.umd.min.js"></script>
    <script>
        angular.module('app', ['color.picker.core']);
    </script>
</body>
```

[Back To Top](#user-content-quick-links)

## <a name="options">Options</a>
`<color-picker>` component has several attributes, all of which are optional. [See the example](http://codepen.io/rkunev/pen/evYaBO) which uses all options.

| Options       | Type   | Default/Description |
|------------|--------|---------|
| `color`    | Object | Object for initializing/changing the color of the picker. Defaults to red: <br> `{hue: 0, saturation: 100, luminosity: 50, alpha: 1}`. |
| `on-select` | Function | Callback which is triggered when a color is selected. |
| `on-color-change` | Function | A function to invoke when color is changed (i.e. on rotation). |
| `mouse-scroll` | Boolean | Use wheel (scroll) event to rotate. Defaults to false. |
| `scroll-sensitivity` | Number | Amount of degrees to rotate the picker with keyboard and/or wheel. <br> Defaults to 2 degrees. |

[Back To Top](#user-content-quick-links)

## <a name="events">Events</a>

For maximum flexibility the component utilizes the pub/sub pattern. For easier communication a set of events are provided that can even programmatically open or close the picker without interacting with the UI. All events carry the current (selected) color in the event data payload.

| Name       | Description |
|------------|-------------|
| `color-picker.show` | Fires when the color picker is about to show and **before** any animation is started. |
| `color-picker.shown` | Fires when the color picker is shown and has finished animating. |
| `color-picker.selected` | Fires when a color is selected via the middle selector. Event is fired right before `hide`. |
| `color-picker.hide` | Fires when the color picker is about to hide and **before** any animation is started. |
| `color-picker.hidden` | Fires when the color picker is hidden and has finished animating. |
| `color-picker.open` | Programatically opens the color picker if it's not already opened. |
| `color-picker.close` | Programatically closes the color picker if it's not already closed. |

Example:
```javascript
// Assign the selected color to the ViewModel and log it to the console
$scope.$on('color-picker.selected', function(ev, color) {
    vm.selectedColor = 'hsla(' + color.hue + ', ' + color.saturation + '%, ' + color.luminosity + '%, ' + color.alpha + ')';
    console.log('Selected color:', color);
});

// The good'n'tested "poke-it-with-a-stick" method:
$scope.$emit('color-picker.open');
```

[Back To Top](#user-content-quick-links)

## <a name="styling">Styling/Sizing</a>

The color picker has a default width/height of 280px, but can also be sized via CSS. For example:
```css
color-picker {
    width: 350px;
    height: 350px;
}
```

If you want a percentage based size you can use this neat little [trick](https://css-tricks.com/aspect-ratio-boxes/) with 1:1 aspect ratio box of 40% width of the parent element:
```css
color-picker {
    height: 0;
    width: 40%;
    padding-bottom: 40%;
}
```

[Back To Top](#user-content-quick-links)

## <a name="questions">First Asked Questions</a>

<details>
    <summary>Color picker uses <code>hsla()</code>. How can I use other formats like <code>rgba()</code> or HEX?</summary>
    <p>There's a service you can use - <code>ColorPickerService</code>. It has <code>rgbToHsl()</code> which can be used to map a color to the <code>hsla()</code> type that the color picker expects. There's also <code>hslToHex()</code>, <code>hslToRgb()</code> and <code>rgbToHex()</code> which can be used to convert the output of the color picker to other formats.</p>
</details>

<details>
    <summary>How to select other shades of the solid colors?</summary>
    <p>We suggest to add a custom slider for saturation and luminosity or use <code>&lt;input type="range"&gt;</code>.</p>
</details>

<details>
    <summary>How can I change the active color of the picker after initialization?</summary>
    <p><code>color-picker</code> component uses <code>$onChanges</code> to detect changes of the color binding. When using <code>&lt;color-picker color="$ctrl.color"&gt;&lt;/color-picker&gt;</code> if you change a property of <code>$ctrl.color</code> object <code>$onChanges</code> is not triggered, because <a href="https://github.com/angular/angular.js/issues/14378#issuecomment-328805679">angular uses a shallow comparison</a>. To properly update the color you'll have to create a new object with the new values. For example:
    <pre>$ctrl.color.hue = 42; // won't work</pre>
    <pre>// use the angular helper
$ctrl.color = angular.extend({}, $ctrl.color, { hue: 42 });</pre>
    <pre>// or create the object manually
$ctrl.color = {
    hue: 42,
    luminosity: $ctrl.color.luminosity,
    saturation: $ctrl.color.saturation,
    alpha: $ctrl.color.alpha
};</pre>
    <pre>// or use Stage-3 Object Spread properties
$ctrl.color = { ...$ctrl.color, hue: 42 };</pre>
    <pre>// or use Object.assign
$ctrl.color = Object.assign({}, $ctrl.color, { hue: 42 });</pre>
    </p>
</details>

<details>
    <summary>Why does Google Chrome throw a <code>[Violation] Added non-passive event listener to a scroll-blocking 'touchmove' event.</code> warning in the console?</summary>
    <p><code>touchmove</code> is used with <code>preventDefault()</code> to block scrolling on mobile while rotating the color knob. Even the <a href="https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#removing-the-need-to-cancel-events">Web Incubator Community Group</a> acknowledges that in some cases a passive event listener can't be used.</p>
</details>

<details>
    <summary>Why is the scroll-to-rotate not turned on by default?</summary>
    <p>It's another non-passive event that could potentially introduce jank on scroll. To rotate the color knob, but stay on the same scrolling position the <code>wheel</code> event is blocked with <code>preventDefault()</code>. Thus, if you really want this feature for your users you'll have to explicitly add the <code>mouse-scroll="true"</code> attribute.</p>
</details>
<br>

[Back To Top](#user-content-quick-links)

## Contribute
If you're interested in the project you can help out with feature requests, bugfixes, documentation improvements or any other helpful contributions. You can use the issue list of this repo for bug reports and feature requests and as well as for questions and support.

We are also particularly interested in projects you did with this plugin. If you have created something colorful and creative with the color picker and want to show it off send us a quick mail.

The project is using an adapted version of [Angular's commit convention](https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/convention.md) and commit messages should adhere to it.

[Back To Top](#user-content-quick-links)
