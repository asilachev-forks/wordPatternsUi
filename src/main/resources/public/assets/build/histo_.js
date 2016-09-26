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
      data: '=data'
    },
    link: function(scope, element, attrs) {
      var chartEl;
      chartEl = d3.select(element[0]);
      scope.$watch('data', function(newVal, oldVal) {
        var d, histogram, noZeors, x;
        noZeors = _.filter(newVal, function(x) {
          return x > 0.00001;
        });
        x = d3.scaleLinear().domain([
          0, d3.max(noZeors, function(d, i) {
            return d;
          })
        ]);
        histogram = d3.histogram().domain(x.domain()).thresholds(NUMBER_OF_BINS);
        d = histogram(noZeors);
        d = _.map(d, function(num) {
          return num.length;
        });
        chartEl.datum(d).call(chart);
      });
    }
  };
});

d3.custom = {};

d3.custom.barChart = function() {
  var box, exports;
  box = void 0;
  exports = function(_selection) {
    _selection.each(function(_data) {
      var bars, y1;
      y1 = d3.scaleLinear().domain([
        0, d3.max(_data, function(d, i) {
          return d;
        })
      ]).range([0, 100]);
      if (!box) {
        box = d3.select(this).append('div').attr('class', 'bar-chart-az');
      }
      box.selectAll('*').remove();
      bars = box.selectAll('div').data(_data);
      bars.enter().append('div').style('height', function(d, i) {
        return 100 - y1(d) + '%';
      });
    });
  };
  return exports;
};
