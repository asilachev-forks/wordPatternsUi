var API_URL = 'https://textwell-api.herokuapp.com/text/metrics/v2/';
//var API_URL = 'http://localhost:8090/text/metrics/v2/';
var text_metrics_module = angular.module('text_metrics.js', []);

text_metrics_module.controller(
    'textCtrl', [
        '$scope',
        '$http',
        '$sce',
        '$timeout',
        TextController
    ]);



function TextController($scope, $http, $sce, $timeout) {
    $scope.msg = messages;

    this.mainText = $scope.msg['placeholder.mainText'];

    this.textMetrics = {};
    $scope.statsLoading = 0;
    $scope.paragraphs = [];


    $scope.navState = 2; //half-opened by default
    $scope.showHideNav = function() {
        $scope.navState++;
        if ($scope.navState > 3) $scope.navState = 1;

        if ($scope.navState > 1) {
            $scope.refreshSlider();
        }
    }

    this.exportText = function() {
        if ($scope.exportMode) {
            $scope.exportMode = false;
            $scope.refreshSlider();
            return;

        } else {
            $scope.exportMode = true;
            var text = _.reduce($scope.paragraphs, function(memo, num) {
                return memo + num.text + "\r\n ";
            }, "");

            $scope.exportedText = text;
        }
    }

    this.clearAll = function(doSubmit) {
        $scope.exportMode = false;
        $scope.oneGramms = [];
        $scope.paragraphs = [];

        $scope.paragraphs.push({
            text: "Пишите сюда",
            metrics: {
                mean: 0
            },
            loading: false,
            changed: true,
            words: []
        });

        $scope.textMetrics = {
            min: 0,
            max: 255,
            l_min: 0,
            l_max: 255
        };

        $scope.ranges = {
            min: 50,
            max: 190,

            options: {
                floor: 0,
                ceil: 255,
                step: 0.1,
                precision: 1,
                hidePointerLabels: true,
                hideLimitLabels: true,

                onChange: $scope.onThresholds
            }
        };

        if (doSubmit) {
            this.submitText(0);
        }
    }



    $scope.onThresholds = function() {
        $scope.textMetrics.l_min = Math.max($scope.ranges.min, $scope.textMetrics.min);
        $scope.textMetrics.l_max = Math.min($scope.ranges.max, $scope.textMetrics.max);
        $scope.textMetrics.range = $scope.textMetrics.l_max - $scope.textMetrics.l_min;

        //console.log($scope.textMetrics.l_min);
        //console.log($scope.textMetrics.l_max);
    };



    $scope.refreshSlider = function() {
        $timeout(function() {
            $scope.$broadcast('rzSliderForceRender');
        });
    };

    this.textStyle = function(val) {
        if (!val) return "";
        var tm = $scope.textMetrics;
        if (val >= $scope.ranges.min && val <= $scope.ranges.max) {
            var k = (val - tm.l_min) / tm.range;
            var b = Math.round(0x3f * k + 0xff * (1 - k));
            var g = Math.round(0x12 * k + 0xff * (1 - k));
            return "background:rgb(255," + (g) + "," + (b) + ");";
        } else {
            return "color:#999999";
        }
    };

    this.paragraphsStyle = function(paragraph) {

        if (!paragraph) return "";
        if (paragraph.changed) {
            return "border-left: 5px solid #999999";
        }

        var val = paragraph.metrics.mean;

        var tm = $scope.textMetrics;
        var vval = 255 - Math.round(255.0 * (val - tm.min) / tm.max);
        return "border-left: 5px solid rgb(255," + (vval) + "," + (vval) + ");";

    };


    $scope.selectParagraph = function(index) {
        $scope.selectedParagraphIndex = index;
        $scope.selectedParagraph = $scope.paragraphs[index];
    };

    this.onParagraphChanged = function(index) {
        if ($scope.paragraphs[index]) {
            $scope.paragraphs[index].changed = true;
        }
        console.log("changed:" + index);
    }

    this.onParagraphMerge = function(index) {
        var pp = $scope.paragraphs;
        if (pp[index] && pp[index - 1]) {
            pp[index - 1].text = pp[index - 1].text.trim() + " " + pp[index].text.trim();
            pp[index - 1].changed = true;
            pp.splice(index, 1);
            $scope.selectParagraph(index - 1);
            this.submitText(index - 1, pp[index - 1].text);
        }

    }

    this.onParagraphBlur = function(index) {
        console.log("blured:" + index);
        var p = $scope.paragraphs[index];
        if (p && p.changed) {
            this.submitText(index, p.text);
        }

    }

    $scope.onParagraphsLoaded = function(analyzedParagraphs, paragraphIndex) {

        /**
            remove old one;
        */
        $scope.paragraphs.splice(paragraphIndex, 1);

        /**
            normally, we should get 1 Paragraph, if the test was small;
        */
        console.log("loaded " + analyzedParagraphs.length + " paragraphs, start index=" + paragraphIndex);

        for (var i = 0; i < analyzedParagraphs.length; i++) {
            var p = analyzedParagraphs[i];
            var paragraph = {
                loading: false,
                metrics: {
                    mean: meanInRange(p.colors, 0, 255)
                },
                changed: false,
                words: _.zip(p.tokens, p.colors),

                text: _.reduce(p.tokens, function(memo, num) {
                    return memo + num;
                }, "")
            };

            $scope.paragraphs.splice(paragraphIndex + i, 0, paragraph);
        }

        $scope.paragraphMetrics($scope.paragraphs);
        $scope.onThresholds();
        $scope.refreshSlider();
    };



    $scope.paragraphMetrics = function(paragraphs) {
        var sum = 0;
        var cnt = 0;
        $scope.oneGramms = [];

        for (var i = 0; i < paragraphs.length; i++) {
            var p = paragraphs[i];
            for (var j = 0; j < p.words.length; j++) {
                cnt++;
                var clr = p.words[j][1];

                if (clr > 0) {
                    sum += clr;
                    $scope.oneGramms.push(clr);
                }
            }
        }

        this.textMetrics.mean = sum / ($scope.oneGramms.length == 0 ? 1 : $scope.oneGramms.length);
        this.textMetrics.count = $scope.oneGramms.length;
        this.textMetrics.countAll = cnt;
        this.textMetrics.max = _.max($scope.oneGramms);
        this.textMetrics.min = _.min($scope.oneGramms);;
    };

    this.submitText = function(paragraphIndex) {
        $scope.statsLoading++;
        $scope.statsLoadingError = null;

        if (!paragraphIndex) {
            paragraphIndex = $scope.selectedParagraphIndex;
        }

        if (!paragraphIndex) {
            paragraphIndex = 0;
        }

        var para = $scope.paragraphs[paragraphIndex];
        para.loading = true;
        text = para.text;

        if (!text || text == "") text = " ";


        var tm = $scope.textMetrics;
        $http.post(API_URL + "1gramms", text).then(
            function(r) {
                $scope.statsLoading--;
                $scope.onParagraphsLoaded(r.data, paragraphIndex);
            },

            function(r) {
                //error
                console.log(r);
                $scope.statsLoadingError = getResponseError(r);
                $scope.statsLoading--;
            }
        );
    };

    this.clearAll(false);
    $scope.paragraphs[0].text = $scope.msg['placeholder.mainText'];
    this.submitText(0);




};

var kdDashboardApp = angular.module('kdDashboardApp', ['dashboard_components.js', 'text_metrics.js', 'charts.js', 'rzModule']);
