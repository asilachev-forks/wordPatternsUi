 dshc = angular.module('dashboard_components.js', []);

 dshc.directive('keyValuePair', function($compile) {
     return {
         scope: {
             key: '@',
             value: '@',
             comment: '@',
             href: '@'
         },
         transclude: true,
         restrict: 'C',
         templateUrl: '/partials/key_value_pair2.html',

     };
 })


 .directive('throbber', function($compile) {
     return {
         scope: {
             text: '@'
         },
         restrict: 'E',
         replace: true,
         templateUrl: '/partials/throbber.html'
     };
 })

 .directive('dashboardWidget', function($compile) {
     return {
         scope: {
             title: '@',
             error: '@',
             subtitle: "@",
             help: "@",
             showOnError: "@",
             loading: "=?"
         },
         transclude: true,
         restrict: 'EC',
         templateUrl: '/partials/dash_widget.html'
     };
 })


 .filter('bigNumber', function() {
     return function(no) {

         var n = no;

         if (isNaN(n) || String(n) === "NaN") {
             return "-";
         }

         if (Math.abs(n) < 5) {
             return Math.round(no * 10.0) / 10;
         }

         if (Math.abs(n) > 5) {
             n = Math.round(no);
         }

         if (n > 10000) {
             var num1 = Math.round(n / 1000);
             return (num1) + "K";
         }

         if (n > 1000) {
             var num2 = Math.round(n / 100);
             return (num2 / 10) + "K";
         }

         if (n > 1000000) {
             var num3 = Math.round(n / 100000);
             return (num3 / 10) + "M";
         }

         return n;

     };
 })


 .filter('percentage', function() {
     return function(n) {

         if (isNaN(n) || String(n) === "NaN") {
             return "-";
         }

         var num = Math.abs(Math.round(1000.0 * n) / 10);
         var ret = (num) + "%";
         return ret;

     };
 });
