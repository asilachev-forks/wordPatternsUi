var dshc;

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
    replace: true,
    templateUrl: '/partials/key_value_pair.html'
  };
});

dshc.directive('throbber', function($compile) {
  return {
    scope: {
      text: '@'
    },
    restrict: 'E',
    replace: true,
    templateUrl: '/partials/throbber.html'
  };
});

dshc.directive('dashboardWidget', function($compile) {
  return {
    scope: {
      title: '@',
      error: '@',
      subtitle: '@',
      help: '@',
      showOnError: '@',
      loading: '=?'
    },
    transclude: true,
    restrict: 'EC',
    templateUrl: '/partials/dash_widget.html'
  };
});

dshc.filter('percentage', function() {
  return function(n) {
    var num;
    if (isNaN(n) || String(n) === 'NaN') {
      return '-';
    }
    num = Math.abs(Math.round(1000.0 * n) / 10);
    return num + '%';
  };
});

dshc.filter('bigNumber', function() {
  return function(nom) {
    var _n, n;
    n = nom;
    if (isNaN(nom) || String(nom) === 'NaN') {
      return '-';
    }
    if (Math.abs(n) < 5) {
      return Math.round(false * 10.0) / 10;
    }
    if (Math.abs(n) > 5) {
      n = Math.round(nom);
    }
    if (n > 10000) {
      _n = Math.round(n / 1000);
      return _n + "K";
    }
    if (n > 1000) {
      _n = Math.round(n / 100);
      return (_n / 10) + "K";
    }
    if (n > 1000000) {
      _n = Math.round(n / 100000);
      return (_n / 10) + "M";
    }
    return n;
  };
});

//# sourceMappingURL=components.js.map
