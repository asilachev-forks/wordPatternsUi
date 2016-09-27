NUMBER_OF_BINS = 256
chartsModule = angular.module('charts.js', [])

chartsModule.directive 'barChart', ->
    chart = d3.custom.barChart()
    {
        restrict: 'E'
        replace: true
        template: '<div class="chart"></div>'
        scope:
            data: '=data'
            ranges: '=ranges'

        link: (scope, element, attrs) ->
            chartEl = d3.select(element[0])

            scope.$watchGroup ['data','ranges.min','ranges.max','ranges.options.floor','ranges.options.ceil'], (newVal, oldVal) ->
                noZeors = _.filter(
                    newVal[0],
                    (x) -> x > 0.00001)

                x = d3.scaleLinear().domain([
                    0
                    d3.max( noZeors, (d, i) -> d)
                ])
                histogram = d3.histogram().domain(x.domain()).thresholds(NUMBER_OF_BINS)


                chartData={
                    values : _.map histogram(noZeors), (num) -> num.length
                    ranges :
                        min: newVal[1]
                        max: newVal[2]
                        floor: newVal[3]
                        ceil: newVal[4]
                }

                chartEl.datum(chartData).call chart
                return
            return

    }
#------------------------------
d3.custom = {}

d3.custom.barChart = ->
    range_0_100= [ 0, 100 ]
    box = undefined
    format = d3.format('.5n')
    exports = (_selection) ->

        _selection.each (_data) ->
            barwidth = format(99.9 / _data.values.length) + '%'


            ########
            x1 = d3.scaleLinear().domain([
                0
                _data.values.length
            ]).range([_data.ranges.floor, _data.ranges.ceil])

            ########
            y1 = d3.scaleLinear().domain([
                0
                d3.max _data.values, (d, i) -> d
            ]).range(range_0_100)

            ########
            colorFn = (d,i) ->
                if _data.ranges.min <= x1(i) <= _data.ranges.max
                    return uiColors['pink']
                return uiColors['panel']

            if not box
                box = d3.select(this).append('div').attr('class', 'bar-chart-az')

            box.selectAll('*').remove()
            bars = box.selectAll('div').data(_data.values)
            bars.enter().append('div')
                .style( 'height', (d, i) -> format(100.0 - y1(d)) + '%')
                .style( 'width', barwidth )
                .style( 'background', colorFn )
            return
        return

    exports
