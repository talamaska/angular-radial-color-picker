import ConicGradient from './conic-gradient.js';

export default function colorPickerConicGradient() {
    return function ($scope, $element) {
        $element[0].style.background = new ConicGradient($element[0].offsetWidth).toString();
    }
}
