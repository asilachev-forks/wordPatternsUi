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
