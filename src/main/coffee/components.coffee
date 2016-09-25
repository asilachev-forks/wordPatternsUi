dshc = angular.module('dashboard_components.js', [])


dshc.directive 'keyValuePair',  ($compile) ->
    scope:
        key: '@'
        value: '@'
        comment: '@'
        href: '@'

    transclude: true
    restrict: 'C'
    templateUrl: '/partials/key_value_pair.html'


dshc.directive 'throbber',  ($compile) ->
    scope:
        text: '@'
    restrict: 'E'
    replace: true
    templateUrl: '/partials/throbber.html'


dshc.directive 'dashboardWidget', ($compile) ->
    scope:
        title: '@'
        error: '@'
        subtitle: '@'
        help: '@'
        showOnError: '@'
        loading: '=?'

    transclude: true
    restrict: 'EC'
    templateUrl: '/partials/dash_widget.html'

dshc.filter 'percentage', ->
    (n) ->
        if isNaN(n) or String(n) == 'NaN'
            return '-'

        num = Math.abs(Math.round(1000.0 * n) / 10)
        return (num) + '%'


dshc.filter 'bigNumber', ->
    (nom) ->
        n = nom;

        if isNaN(nom) or String(nom) == 'NaN'
            return '-'

        if Math.abs(n) < 5
            return Math.round(no * 10.0) / 10;

        if Math.abs(n) > 5
            n = Math.round(nom)

        if n > 10000
            _n = Math.round(n / 1000)
            return (_n) + "K"

        if n > 1000
            _n = Math.round(n / 100)
            return (_n / 10) + "K"

        if n > 1000000
            _n = Math.round(n / 100000);
            return (_n / 10) + "M"

        return n
