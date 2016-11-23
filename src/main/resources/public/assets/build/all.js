var API_URL, NUMBER_OF_BINS, Paragraph, Paragraphs, TextController, chartsModule, dshc, getResponseError, kdDashboardApp, mean, meanInRange, mod_colors, text_metrics_module, uiColors;

API_URL = 'http://localhost:8090/text/metrics/v2/';

text_metrics_module = angular.module('text_metrics.js', ['mod_colors.js']);

TextController = function($scope, $http, $sce, $timeout) {
  $scope.navState = 2;
  this.showHideNav = function() {
    if ($scope.navState === 2) {
      $scope.navState = 1;
    } else {
      $scope.navState = 2;
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

uiColors = {};

mod_colors = angular.module('mod_colors.js', []);

mod_colors.run(function() {
  var c, htmlStyles, j, len, list;
  htmlStyles = window.getComputedStyle(document.querySelector('html'));
  list = ['red', 'redtr', 'panel', 'pink', 'grey'];
  uiColors = {};
  for (j = 0, len = list.length; j < len; j++) {
    c = list[j];
    uiColors[c] = htmlStyles.getPropertyValue('--words-' + c).trim();
  }
});

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

NUMBER_OF_BINS = 256;

chartsModule = angular.module('charts.js', []);

chartsModule.directive('barChart', function() {
  var chart;
  chart = d3.custom.barChart();
  return {
    restrict: 'E',
    replace: true,
    template: '<div class="chart"></div>',
    scope: {
      data: '=data',
      ranges: '=ranges'
    },
    link: function(scope, element, attrs) {
      var chartEl;
      chartEl = d3.select(element[0]);
      scope.$watchGroup(['data', 'ranges.min', 'ranges.max', 'ranges.options.floor', 'ranges.options.ceil'], function(newVal, oldVal) {
        var chartData, histogram, noZeors, x;
        noZeors = _.filter(newVal[0], function(x) {
          return x > 0.00001;
        });
        x = d3.scaleLinear().domain([
          0, d3.max(noZeors, function(d, i) {
            return d;
          })
        ]);
        histogram = d3.histogram().domain(x.domain()).thresholds(NUMBER_OF_BINS);
        chartData = {
          values: _.map(histogram(noZeors), function(num) {
            return num.length;
          }),
          ranges: {
            min: newVal[1],
            max: newVal[2],
            floor: newVal[3],
            ceil: newVal[4]
          }
        };
        chartEl.datum(chartData).call(chart);
      });
    }
  };
});

d3.custom = {};

d3.custom.barChart = function() {
  var box, exports, format, range_0_100;
  range_0_100 = [0, 100];
  box = void 0;
  format = d3.format('.5n');
  exports = function(_selection) {
    _selection.each(function(_data) {
      var bars, barwidth, colorFn, x1, y1;
      barwidth = format(99.9 / _data.values.length) + '%';
      x1 = d3.scaleLinear().domain([0, _data.values.length]).range([_data.ranges.floor, _data.ranges.ceil]);
      y1 = d3.scaleLinear().domain([
        0, d3.max(_data.values, function(d, i) {
          return d;
        })
      ]).range(range_0_100);
      colorFn = function(d, i) {
        var ref;
        if ((_data.ranges.min <= (ref = x1(i)) && ref <= _data.ranges.max)) {
          return uiColors['pink'];
        }
        return uiColors['panel'];
      };
      if (!box) {
        box = d3.select(this).append('div').attr('class', 'bar-chart-az');
      }
      box.selectAll('*').remove();
      bars = box.selectAll('div').data(_data.values);
      bars.enter().append('div').style('height', function(d, i) {
        return format(100.0 - y1(d)) + '%';
      }).style('width', barwidth).style('background', colorFn);
    });
  };
  return exports;
};

Paragraph = (function() {
  function Paragraph() {}

  Paragraph.prototype.metrics = {
    mean: 0
  };

  Paragraph.prototype.loading = false;

  Paragraph.prototype.changed = true;

  Paragraph.prototype.words = [];

  Paragraph.prototype.text = "Пишите сюда";

  return Paragraph;

})();

Paragraphs = (function() {
  var oneGramms, paragraphs;

  paragraphs = [];

  oneGramms = [];

  function Paragraphs(ranges) {
    this.ranges = ranges;
    this.metrics = {
      min: 0,
      max: 255,
      l_min: 0,
      l_max: 255
    };
  }

  Paragraphs.prototype["export"] = function() {
    return _.reduce(this.paragraphs, (function(memo, num) {
      return memo + num.text + '\n';
    }), '').trim();
  };

  Paragraphs.prototype.collapse = function() {
    var fulltext;
    fulltext = this["export"]();
    this.paragraphs = [];
    this.setText(0, fulltext);
    this.paragraphs[0].changed = true;
    this.paragraphMetrics();
  };

  Paragraphs.prototype.setText = function(index, str) {
    if (!this.paragraphs[index]) {
      this.paragraphs[index] = new Paragraph();
    }
    this.paragraphs[index].text = str;
  };

  Paragraphs.prototype.clear = function() {
    this.paragraphs = [];
    this.paragraphs.push(new Paragraph());
    this.paragraphMetrics();
  };

  Paragraphs.prototype.paragraphsStyle = function(paragraph) {
    var color, k, val;
    if (!paragraph) {
      return '';
    }
    if (paragraph.changed) {
      return 'border-right: 5px solid #999999';
    }
    val = paragraph.metrics.mean;
    k = (val - this.metrics.min) / this.metrics.max;
    color = d3.color(uiColors['red']);
    color.opacity = Math.round(k * 1000) / 1000.0;
    return 'border-right: 5px solid ' + color.toString() + ';';
  };

  Paragraphs.prototype.textStyle = function(val) {
    var color, k;
    if (!val) {
      return '';
    }
    if (val >= this.ranges.min && val <= this.ranges.max) {
      k = (val - this.metrics.l_min) / this.metrics.range;
      color = d3.color(uiColors['red']);
      color.opacity = Math.round(k * 1000) / 1000.0;
      return 'background:' + color.toString() + ';';
    } else {
      return 'color:' + uiColors['grey'] + ';';
    }
  };

  Paragraphs.prototype.markDirty = function() {
    var j, len, p, ref;
    ref = this.paragraphs;
    for (j = 0, len = ref.length; j < len; j++) {
      p = ref[j];
      p.changed = true;
    }
  };

  Paragraphs.prototype.paragraphMetrics = function() {
    var clr, cnt, j, l, len, len1, p, ref, ref1, sum, word;
    sum = 0;
    cnt = 0;
    this.oneGramms = [];
    ref = this.paragraphs;
    for (j = 0, len = ref.length; j < len; j++) {
      p = ref[j];
      ref1 = p.words;
      for (l = 0, len1 = ref1.length; l < len1; l++) {
        word = ref1[l];
        cnt++;
        clr = word[1];
        if (clr > 0) {
          sum += clr;
          this.oneGramms.push(clr);
        }
      }
    }
    this.metrics.mean = sum / (this.oneGramms.length === 0 ? 1 : this.oneGramms.length);
    this.metrics.count = this.oneGramms.length;
    this.metrics.countAll = cnt;
    this.metrics.max = _.max(this.oneGramms);
    this.metrics.min = _.min(this.oneGramms);
  };

  Paragraphs.prototype.insertParagraphs = function(analyzedParagraphs, paragraphIndex) {
    var i, j, len, p, paragraph;
    this.paragraphs.splice(paragraphIndex, 1);
    console.log('loaded ' + analyzedParagraphs.length + ' paragraphs, start index=' + paragraphIndex);
    i = 0;
    for (j = 0, len = analyzedParagraphs.length; j < len; j++) {
      p = analyzedParagraphs[j];
      paragraph = {
        loading: false,
        metrics: {
          mean: meanInRange(p.colors, 0, 255)
        },
        changed: false,
        words: _.zip(p.tokens, p.colors),
        text: _.reduce(p.tokens, (function(memo, num) {
          return memo + num;
        }), '')
      };
      this.paragraphs.splice(paragraphIndex + i, 0, paragraph);
      i++;
    }
    this.paragraphMetrics();
    this.onThresholds();
  };

  Paragraphs.prototype.merge = function(index) {
    var pp;
    pp = this.paragraphs;
    if (pp[index] && pp[index - 1]) {
      pp[index - 1].text = pp[index - 1].text.trim() + ' ' + pp[index].text.trim();
      pp[index - 1].changed = true;
      pp.splice(index, 1);
      this.selectParagraph(index - 1);
    }
  };

  Paragraphs.prototype.selectParagraph = function(index) {
    this.selectedParagraphIndex = index;
    this.selectedParagraph = this.paragraphs[index];
  };

  Paragraphs.prototype.onThresholds = function() {
    this.metrics.l_min = Math.max(this.ranges.min, this.metrics.min);
    this.metrics.l_max = Math.min(this.ranges.max, this.metrics.max);
    this.metrics.range = this.metrics.l_max - this.metrics.l_min;
  };

  return Paragraphs;

})();

getResponseError = function(data) {
  var error;
  if ('org.az.words.ServiceException' === data.exception) {
    return data.message;
  } else {
    error = '';
    if (data.error) {
      error += data.error + ' ';
    }
    if (data.message) {
      error += data.message + ' ';
    }
    return error;
  }
};

mean = function(array) {
  var a, j, len, sum;
  if (array.length === 0) {
    return 0;
  }
  sum = 0;
  for (j = 0, len = array.length; j < len; j++) {
    a = array[j];
    sum += a;
  }
  return sum / array.length;
};

meanInRange = function(array, fmin, fmax) {
  var a, cnt, j, len, sum;
  if (array.length === 0) {
    return 0;
  }
  sum = 0;
  cnt = 0;
  for (j = 0, len = array.length; j < len; j++) {
    a = array[j];
    if ((fmin < a && a < fmax)) {
      sum += a;
      cnt++;
    }
  }
  if (cnt === 0) {
    return 0;
  }
  return sum / cnt;
};

//# sourceMappingURL=all.js.map
