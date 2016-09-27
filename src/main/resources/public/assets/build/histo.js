var NUMBER_OF_BINS, chartsModule;

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
          return 'rgb(255,225,231)';
        }
        return '#ffffff';
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
