#var API_URL = 'https://textwell-api.herokuapp.com/text/metrics/v2/';
API_URL = 'http://localhost:8090/text/metrics/v2/'
text_metrics_module = angular.module('text_metrics.js', ['mod_colors.js'])


TextController = ($scope, $http, $sce, $timeout) ->
    $scope.navState = 2; #half-opened by default

    @showHideNav = ->        
        if $scope.navState == 2
            $scope.navState = 1
        else
            $scope.navState = 2

        if $scope.navState > 1
            $scope.refreshSlider()

        return


    $scope.onThresholds = -> $scope.text.onThresholds()

    $scope.ranges =
        min: 50
        max: 190
        options:
            floor: 0
            ceil: 255
            step: 0.1
            precision: 1
            hidePointerLabels: true
            hideLimitLabels: true

            onChange: $scope.onThresholds


    $scope.text = new Paragraphs($scope.ranges)
    $scope.msg = messages
    $scope.statsLoading = 0

    @mainText = $scope.msg['placeholder.mainText']

    $scope.apis = [
        {
            'name': 'словосочетания из 2'
            'value': '2gramms'
        },
        {
            'name': 'словосочетания из 1'
            'value': '1gramms'
        }
    ]

    $scope.selectedApi = $scope.apis[1]

    @selectApi = (item) ->
        $scope.selectedApi = item
        console.log $scope.selectedApi

        $scope.text.collapse()
        @submitText(0)


    @exportText = () ->
        if $scope.exportMode
            $scope.exportMode = false
            $scope.refreshSlider()
        else
            $scope.exportMode = true
            $scope.exportedText = $scope.text.export()


    @clearAll = (doSubmit) ->
        $scope.exportMode = false
        $scope.text.clear()

        if doSubmit
            @submitText(0);


    @onParagraphChanged = (index) ->
        if $scope.text.paragraphs[index]
            $scope.text.paragraphs[index].changed = true

        console.log("changed:" + index)


    @onParagraphMerge = (index) ->
        $scope.text.merge(index)
        @submitText(index - 1)


    @onParagraphBlur = (index) ->
        console.log("blured:" + index)
        p = $scope.text.paragraphs[index]
        if p? && p.changed
            @submitText(index, p.text)


    $scope.onParagraphsLoaded = (analyzedParagraphs, paragraphIndex) ->
        $scope.text.insertParagraphs(analyzedParagraphs, paragraphIndex)
        $scope.ranges.options.floor=$scope.text.metrics.min
        $scope.ranges.options.ceil=$scope.text.metrics.max
        $scope.ranges.min=$scope.text.metrics.min+10
        $scope.ranges.max=$scope.text.metrics.max-10
        $scope.refreshSlider()


    $scope.refreshSlider = -> $timeout -> $scope.$broadcast('rzSliderForceRender')

    @submitText = (paragraphIndex) ->
        $timeout( ->
            $scope.statsLoading++
            $scope.statsLoadingError = null

            para = $scope.text.paragraphs[paragraphIndex]
            para.loading = true
            text = para.text

            if not text? or text == ''
                text = ' '

            $http.post(API_URL + $scope.selectedApi.value, text).then(
                (r) ->
                    $scope.statsLoading--
                    $scope.onParagraphsLoaded(r.data, paragraphIndex)
                    return
                (r) ->
                    console.log r
                    $scope.statsLoadingError = getResponseError(r)
                    $scope.statsLoading--
                    return
            )
        50)
        return



    @clearAll(false)
    $scope.text.setText(0, $scope.msg['placeholder.mainText'])
    @submitText(0)

    return


text_metrics_module.controller(
    'textCtrl', [
        '$scope'
        '$http'
        '$sce'
        '$timeout'
        TextController
    ])


kdDashboardApp = angular.module('kdDashboardApp', ['dashboard_components.js', 'text_metrics.js', 'charts.js', 'rzModule'])

uiColors={}
mod_colors = angular.module 'mod_colors.js', []

mod_colors.run () ->

    htmlStyles = window.getComputedStyle(document.querySelector('html'))

    list=[ 'red', 'redtr', 'panel', 'pink', 'grey']
    uiColors={}
    for c in list
        uiColors[c]=htmlStyles.getPropertyValue('--words-' + c).trim()



    return

dshc = angular.module('dashboard_components.js', [])


dshc.directive 'keyValuePair', ($compile) ->
    scope:
        key: '@'
        value: '@'
        comment: '@'
        href: '@'

    transclude: true
    restrict: 'C'
    replace: true
    templateUrl: '/partials/key_value_pair.html'


dshc.directive 'throbber', ($compile) ->
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

class Paragraph
    metrics:
        mean: 0
    loading: false
    changed: true
    words: []
    text: "Пишите сюда"


class Paragraphs
    paragraphs=[]
    oneGramms=[]

    constructor:(ranges)->
        @ranges = ranges

        @metrics =
            min: 0
            max: 255
            l_min: 0
            l_max: 255


    export: ->
        _.reduce(@paragraphs, ((memo, num) ->
            memo + num.text + '\n'
        ), '').trim()

    collapse: ->
        fulltext = @export()
        @paragraphs = []
        @setText 0,fulltext
        @paragraphs[0].changed=true
        @paragraphMetrics()
        return

    setText:(index, str)->
        if !@paragraphs[index]
            @paragraphs[index]=new Paragraph()

        @paragraphs[index].text=str
        return

    clear: ->
        @paragraphs = []
        @paragraphs.push(new Paragraph())
        @paragraphMetrics()
        return

    paragraphsStyle: (paragraph) ->
        if not paragraph
            return ''
        if paragraph.changed
            return 'border-right: 5px solid #999999'

        val = paragraph.metrics.mean
        k = (val - @metrics.min) / @metrics.max
        # vval = 255 - Math.round(255.0 * (val - (@metrics.min)) / @metrics.max)
        color = d3.color(uiColors['red'])
        color.opacity = Math.round(k * 1000)/1000.0
        'border-right: 5px solid ' + color.toString() + ';'

    textStyle: (val) ->
        if not val
            return ''

        if val >= @ranges.min and val <= @ranges.max

            k = (val - (@metrics.l_min)) / @metrics.range
            color = d3.color(uiColors['red'])
            color.opacity = Math.round(k * 1000)/1000.0

            #b = Math.round(0x3f * k + 0xff * (1 - k))
            #g = Math.round(0x12 * k + 0xff * (1 - k))
            #'background:rgb(255,' + g + ',' + b + ');'
            'background:' + color.toString() + ';'
        else
            'color:' + uiColors['grey'] + ';'

    markDirty: ->
        p.changed = true for p in @paragraphs
        return

    paragraphMetrics: ->
        sum = 0
        cnt = 0
        @oneGramms = []

        #@oneGramms.push(0)
        #@oneGramms.push(255)

        for p in @paragraphs
            for word in p.words
                cnt++
                clr = word[1]
                if clr > 0
                    sum += clr
                    @oneGramms.push clr


        @metrics.mean = sum / (if @oneGramms.length == 0 then 1 else @oneGramms.length)
        @metrics.count = @oneGramms.length
        @metrics.countAll = cnt
        @metrics.max = _.max(@oneGramms)
        @metrics.min = _.min(@oneGramms)
        return

    insertParagraphs :(analyzedParagraphs, paragraphIndex) ->
        #remove old one;
        @paragraphs.splice paragraphIndex, 1

        #normally, we should get 1 Paragraph, if the test was small;
        console.log 'loaded ' + analyzedParagraphs.length + ' paragraphs, start index=' + paragraphIndex
        i=0
        for p in analyzedParagraphs
            paragraph =
                loading: false
                metrics: mean: meanInRange(p.colors, 0, 255)
                changed: false
                words: _.zip(p.tokens, p.colors)
                text: _.reduce(p.tokens, ((memo, num) ->
                    memo + num
                ), '')

            @paragraphs.splice paragraphIndex + i, 0, paragraph
            i++

        @paragraphMetrics()
        @onThresholds()
        return



    merge: (index) ->
        pp = @paragraphs
        if pp[index] and pp[index - 1]
            pp[index - 1].text = pp[index - 1].text.trim() + ' ' + pp[index].text.trim()
            pp[index - 1].changed = true
            pp.splice index, 1
            @selectParagraph index - 1
            return


    selectParagraph: (index) ->
        @selectedParagraphIndex = index;
        @selectedParagraph = @paragraphs[index]
        return


    onThresholds: ->
        @metrics.l_min = Math.max(@ranges.min, @metrics.min);
        @metrics.l_max = Math.min(@ranges.max, @metrics.max);
        @metrics.range = @metrics.l_max - @metrics.l_min;
        return

getResponseError = (data) ->
    if 'org.az.words.ServiceException' == data.exception
        data.message
    else
        error = ''
        if data.error
            error += data.error + ' '
        if data.message
            error += data.message + ' '
        error

mean = (array) ->
    if array.length == 0
        return 0
    sum = 0
    for a in array
        sum += a
    sum / array.length


meanInRange = (array, fmin, fmax) ->
    if array.length == 0
        return 0

    sum = 0
    cnt = 0

    for a in array
        if fmin < a < fmax
            sum += a
            cnt++

    if cnt == 0
        return 0

    sum / cnt
