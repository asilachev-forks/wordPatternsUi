var NUMBER_OF_BINS = 256;

angular.module('charts.js', [])



.directive('barChart', function() {
    var chart = d3.custom.barChart();



    return {
        restrict: 'E',
        replace: true,
        template: '<div class="chart"></div>',
        scope: {
            height: '=height',
            data: '=data'
        },

        link: function(scope, element, attrs) {
            var chartEl = d3.select(element[0]);

            scope.$watch('data', function(newVal, oldVal) {

                var noZeors = _.filter(newVal, function(x) {
                    return x > 0.00001;
                });

                var x = d3.scaleLinear()
                    .domain([0, d3.max(noZeors,
                        function(d, i) {
                            return d;
                        })]);

                var histogram = d3.histogram()
                    .domain(x.domain())
                    .thresholds(NUMBER_OF_BINS);

                var d = histogram(noZeors);

                d = _.map(d, function(num) {
                    return num.length;
                });
                
                chartEl.datum(d).call(chart);
            });

        }
    }
});

//------------------------------

d3.custom = {};

d3.custom.barChart = function module() {

    var box;

    function exports(_selection) {
        _selection.each(function(_data) {

            var y1 = d3.scaleLinear()
                .domain([0, d3.max(_data,
                    function(d, i) {
                        return d;
                    })]).range([0, 100]);


            if (!box) {
                box = d3.select(this)
                    .append('div').attr("class", "bar-chart-az");
            };

			box.selectAll("*").remove();
			
            var bars = box.selectAll("div")
                .data(_data);


            bars.enter().append('div')
                .style("height", function(d, i) {
                    return (100 - y1(d)) + "%";
                });

        });
    }


    return exports;
};
