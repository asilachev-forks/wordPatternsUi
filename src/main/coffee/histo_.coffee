NUMBER_OF_BINS = 256
chartsModule = angular.module('charts.js', [])

chartsModule.directive 'barChart', ->
    chart = d3.custom.barChart()
    {
        restrict: 'E'
        replace: true
        template: '<div class="chart"></div>'
        scope: data: '=data'

        link: (scope, element, attrs) ->
            chartEl = d3.select(element[0])

            scope.$watch 'data', (newVal, oldVal) ->
                noZeors = _.filter newVal, (x) -> x > 0.00001

                x = d3.scaleLinear().domain([
                    0
                    d3.max noZeors, (d, i) -> d
                ])
                histogram = d3.histogram().domain(x.domain()).thresholds(NUMBER_OF_BINS)
                d = histogram(noZeors)
                d = _.map d, (num) -> num.length

                chartEl.datum(d).call chart
                return
            return

    }
#------------------------------
d3.custom = {}

d3.custom.barChart = ->
    box = undefined

    exports = (_selection) ->
        _selection.each (_data) ->
            y1 = d3.scaleLinear().domain([
                0
                d3.max _data, (d, i) -> d
            ]).range([
                0
                100
            ])
            if not box
                box = d3.select(this).append('div').attr('class', 'bar-chart-az')
                
            box.selectAll('*').remove()
            bars = box.selectAll('div').data(_data)
            bars.enter().append('div').style 'height', (d, i) ->
                100 - y1(d) + '%'
            return
        return

    exports
