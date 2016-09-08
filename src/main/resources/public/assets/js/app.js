angular.module('text_metrics.js', [])

.controller(
    'textCtrl', [
        '$scope',
        '$http',

        TextController
    ]);


function TextController($scope, $http) {
    $scope.msg = messages;

    this.mainText = $scope.msg['placeholder.mainText'];
    $scope.coloredText = 'result';
    // this.mainTextTresholdMax = 240;
    // this.mainTextTresholdMin = 20;



    $scope.oneGramms = {};
    $scope.oneGramms.colors = [100, 200];

    $scope.textMetrics = {
        min: 0,
        max: 255,
        l_min: 0,
        l_max: 255
    };



    $scope.onThresholds = function() {
        //var min = Math.max($scope.ranges.min, $scope.textMetrics.min);
        //var max = Math.min($scope.ranges.max, $scope.textMetrics.max);
        //max = max - min;

        $scope.textMetrics.l_min = Math.max($scope.ranges.min, $scope.textMetrics.min);
        $scope.textMetrics.l_max = Math.min($scope.ranges.max, $scope.textMetrics.max);
        $scope.textMetrics.range = $scope.textMetrics.l_max - $scope.textMetrics.l_min;

        console.log($scope.textMetrics.l_min);
        console.log($scope.textMetrics.l_max);
    };

    $scope.ranges = {
        min: 50,
        max: 190,

        options: {
            floor: 0,
            ceil: 255,

            onChange: $scope.onThresholds
        }
    };

    this.textStyle = function(val) {
        if (!val) return "";
        var tm = $scope.textMetrics;
        if (val >= $scope.ranges.min && val <= $scope.ranges.max) {
            var vval = Math.round(255.0 * (val - tm.l_min) / tm.range);
            return "background:rgb(255," + (255 - vval) + "," + (255 - vval) + ");";
        } else {
            return "color: gray";
        }
    };

    this.textMetrics = {};


    $scope.meterText = function(textMetrics) {

        var t = $scope.oneGramms.tokens;
        var c = $scope.oneGramms.colors;

        textMetrics.min = _.min(c);
        textMetrics.max = _.max(c);
        textMetrics.mean = _.reduce(c, function(memo, num) {
            return memo + num;
        }, 0) / (c.length === 0 ? 1 : c.length);

        textMetrics.count = c.length;
        $scope.onThresholds();

        $scope.ranges.options.floor = textMetrics.min;
        $scope.ranges.options.ceil = textMetrics.max;

        console.log(textMetrics.min);
        console.log(textMetrics.max);
    };

    this.submitText = function() {

        var tm = $scope.textMetrics;
        $http.post('https://textwell-api.herokuapp.com/text/metrics/1gramms', this.mainText).then(
            function(r) {

                $scope.oneGramms = r.data;

                var t = $scope.oneGramms.tokens;
                var c = $scope.oneGramms.colors;
                $scope.meterText(tm);

                $scope.coloredText = [
                    [],
                    []
                ];

                for (var i = 0; i < c.length; i++) {
                    $scope.coloredText.push([t[i], c[i]]);
                }

            },

            function(r) { //error
                console.log(r);
                alert(r);
            }
        );
    };
    
    
    this.submitText();
    
    


};

var kdDashboardApp = angular.module('kdDashboardApp', ['dashboard_components.js', 'text_metrics.js', 'charts.js', 'rzModule']);
