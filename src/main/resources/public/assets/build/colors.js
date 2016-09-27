var mod_colors, uiColors;

uiColors = {};

mod_colors = angular.module('mod_colors.js', []);

mod_colors.run(function() {
  var c, htmlStyles, i, len, list;
  htmlStyles = window.getComputedStyle(document.querySelector('html'));
  list = ['red', 'redtr', 'panel', 'pink', 'grey'];
  uiColors = {};
  for (i = 0, len = list.length; i < len; i++) {
    c = list[i];
    uiColors[c] = htmlStyles.getPropertyValue('--words-' + c).trim();
  }
});
