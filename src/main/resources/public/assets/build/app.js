var API_URL, TextController, kdDashboardApp, text_metrics_module;

API_URL = 'http://localhost:8090/text/metrics/v2/';

text_metrics_module = angular.module('text_metrics.js', []);

TextController = function($scope, $http, $sce, $timeout) {
  $scope.navState = 2;
  this.showHideNav = function() {
    $scope.navState++;
    if ($scope.navState > 3) {
      $scope.navState = 1;
    }
    if ($scope.navState > 1) {
      $scope.refreshSlider();
    }
  };
  $scope.onThresholds = function() {
    return $scope.text.onThresholds();
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
  $scope.text = new Paragraphs($scope.ranges);
  $scope.msg = messages;
  $scope.statsLoading = 0;
  this.mainText = $scope.msg['placeholder.mainText'];
  $scope.apis = [
    {
      'name': 'словосочетания из 2',
      'value': '2gramms'
    }, {
      'name': 'словосочетания из 1',
      'value': '1gramms'
    }
  ];
  $scope.selectedApi = $scope.apis[1];
  this.selectApi = function(item) {
    $scope.selectedApi = item;
    console.log($scope.selectedApi);
    $scope.text.collapse();
    return this.submitText(0);
  };
  this.exportText = function() {
    if ($scope.exportMode) {
      $scope.exportMode = false;
      return $scope.refreshSlider();
    } else {
      $scope.exportMode = true;
      return $scope.exportedText = $scope.text["export"]();
    }
  };
  this.clearAll = function(doSubmit) {
    $scope.exportMode = false;
    $scope.text.clear();
    if (doSubmit) {
      return this.submitText(0);
    }
  };
  this.onParagraphChanged = function(index) {
    if ($scope.text.paragraphs[index]) {
      $scope.text.paragraphs[index].changed = true;
    }
    return console.log("changed:" + index);
  };
  this.onParagraphMerge = function(index) {
    $scope.text.merge(index);
    return this.submitText(index - 1);
  };
  this.onParagraphBlur = function(index) {
    var p;
    console.log("blured:" + index);
    p = $scope.text.paragraphs[index];
    if ((p != null) && p.changed) {
      return this.submitText(index, p.text);
    }
  };
  $scope.onParagraphsLoaded = function(analyzedParagraphs, paragraphIndex) {
    $scope.text.insertParagraphs(analyzedParagraphs, paragraphIndex);
    $scope.ranges.options.floor = $scope.text.metrics.min;
    $scope.ranges.options.ceil = $scope.text.metrics.max;
    $scope.ranges.min = $scope.text.metrics.min + 10;
    $scope.ranges.max = $scope.text.metrics.max - 10;
    return $scope.refreshSlider();
  };
  $scope.refreshSlider = function() {
    return $timeout(function() {
      return $scope.$broadcast('rzSliderForceRender');
    });
  };
  this.submitText = function(paragraphIndex) {
    $timeout(function() {
      var para, text;
      $scope.statsLoading++;
      $scope.statsLoadingError = null;
      para = $scope.text.paragraphs[paragraphIndex];
      para.loading = true;
      text = para.text;
      if ((text == null) || text === '') {
        text = ' ';
      }
      return $http.post(API_URL + $scope.selectedApi.value, text).then(function(r) {
        $scope.statsLoading--;
        $scope.onParagraphsLoaded(r.data, paragraphIndex);
      }, function(r) {
        console.log(r);
        $scope.statsLoadingError = getResponseError(r);
        $scope.statsLoading--;
      });
    }, 50);
  };
  this.clearAll(false);
  $scope.text.setText(0, $scope.msg['placeholder.mainText']);
  this.submitText(0);
};

text_metrics_module.controller('textCtrl', ['$scope', '$http', '$sce', '$timeout', TextController]);

kdDashboardApp = angular.module('kdDashboardApp', ['dashboard_components.js', 'text_metrics.js', 'charts.js', 'rzModule']);
