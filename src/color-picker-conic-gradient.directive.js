import ConicGradient from './conic-gradient.js';

export default function colorPickerConicGradient() {
    return function ($scope, $element) {
        var size = $element[0].offsetWidth || 280;
        $element[0].style.background = new ConicGradient(size).toString();
    }
}
