#var API_URL = 'https://textwell-api.herokuapp.com/text/metrics/v2/';
API_URL = 'http://localhost:8090/text/metrics/v2/'
text_metrics_module = angular.module('text_metrics.js', [])


TextController = ($scope, $http, $sce, $timeout) ->
    $scope.navState = 2; #half-opened by default

    @showHideNav = ->
        $scope.navState++
        if $scope.navState > 3
            $scope.navState = 1

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
