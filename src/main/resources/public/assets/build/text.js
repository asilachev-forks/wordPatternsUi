var Paragraph, Paragraphs;

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
    var val, vval;
    if (!paragraph) {
      return '';
    }
    if (paragraph.changed) {
      return 'border-left: 5px solid #999999';
    }
    val = paragraph.metrics.mean;
    vval = 255 - Math.round(255.0 * (val - this.metrics.min) / this.metrics.max);
    return 'border-left: 5px solid rgb(255,' + vval + ',' + vval + ');';
  };

  Paragraphs.prototype.textStyle = function(val) {
    var b, g, k;
    if (!val) {
      return '';
    }
    if (val >= this.ranges.min && val <= this.ranges.max) {
      k = (val - this.metrics.l_min) / this.metrics.range;
      b = Math.round(0x3f * k + 0xff * (1 - k));
      g = Math.round(0x12 * k + 0xff * (1 - k));
      return 'background:rgb(255,' + g + ',' + b + ');';
    } else {
      return 'color:#999999';
    }
  };

  Paragraphs.prototype.markDirty = function() {
    var l, len, p, ref;
    ref = this.paragraphs;
    for (l = 0, len = ref.length; l < len; l++) {
      p = ref[l];
      p.changed = true;
    }
  };

  Paragraphs.prototype.paragraphMetrics = function() {
    var clr, cnt, j, l, len, p, ref, sum;
    sum = 0;
    cnt = 0;
    this.oneGramms = [];
    ref = this.paragraphs;
    for (l = 0, len = ref.length; l < len; l++) {
      p = ref[l];
      j = 0;
      while (j < p.words.length) {
        cnt++;
        clr = p.words[j][1];
        if (clr > 0) {
          sum += clr;
          this.oneGramms.push(clr);
        }
        j++;
      }
    }
    this.metrics.mean = sum / (this.oneGramms.length === 0 ? 1 : this.oneGramms.length);
    this.metrics.count = this.oneGramms.length;
    this.metrics.countAll = cnt;
    this.metrics.max = _.max(this.oneGramms);
    this.metrics.min = _.min(this.oneGramms);
  };

  Paragraphs.prototype.insertParagraphs = function(analyzedParagraphs, paragraphIndex) {
    var i, l, len, p, paragraph;
    this.paragraphs.splice(paragraphIndex, 1);
    console.log('loaded ' + analyzedParagraphs.length + ' paragraphs, start index=' + paragraphIndex);
    i = 0;
    for (l = 0, len = analyzedParagraphs.length; l < len; l++) {
      p = analyzedParagraphs[l];
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
