/*
 * ogrid.QSearchProcessor.Twitter
 *
 * Extension class to support twitter for Quick Search classes
 */

ogrid.QSearchProcessor.Tweet = ogrid.QSearchProcessor.extend({
    //private attributes
    _options:{},

    //for parsing, different from the one used by the factory class
    _pattern: /^(tweet|twe)(\s)*((\s)+((\w+)|(\"(.*)\")))*$/i,
    _input: '',

    //public attributes


    //constructor
    init: function(inputString, options) {
        if (options)
            //ogrid.mixin(this._options);
            this._options = options;

        this._input = inputString;
    },


    //private methods
    _processData: function(data) {
        if (data.features.length >= 1) {
            //auto-pop up first element
            //data.features[0].autoPopup = true;
        }
    },

    _getBuildParams: function() {
        var matches = this._pattern.exec(this._input);

        if (!matches) {
            throw ogrid.error('Quick Search Error', 'Twitter quick search input is invalid. Syntax: tweet &lt;keyword&gt; or &quot;key phrase&quot;.');
        }
        //match group 5 captures bare keyword
        //match group 8 captures quoted phrase
        if (!matches[5] && !matches[8]) {
            //no match will return most recent
            //for now, we are returning all with no filter
            //throw ogrid.error('Quick Search Error', 'Twitter quick search parameter is invalid. Syntax: tweet &lt;keyword&gt; or &quot;key phrase&quot;.');
            return '';
        } else {
            return 'q=' + encodeURI('{"text" : {$regex : ".*' + (matches[8] ? matches[8] : matches[5]) + '.*"}}');
        }
        //{"text" : {$regex : ".*son.*"}}

    },

    //public methods
    //returns RegEx pattern for supported command
    getPattern: function() {
        return this._pattern;
    },


    exec: function(onSuccess, onError) {
        //call opengrid service
        var me = this;
        var q = this._getBuildParams();

        if (!ogrid.Config.quickSearch.mock) {
            $.ajax({
                //should really be datasets/twitter/query/filter...
                url: ogrid.Config.service.endpoint + '/datasets/twitter/query?' + q,
                type: 'GET',
                async: true,
                contentType: 'application/json',
                timeout: ogrid.Config.service.timeout,
                xhrFields: {
                    withCredentials: false
                },
                headers: {
                    // Set any custom headers here.
                    // If you set any non-simple headers, your server must include these
                    // headers in the 'Access-Control-Allow-Headers' response header.
                },
                success: function(data) {
                    me._processData(data);
                    onSuccess(data);
                },
                error: function(jqXHR, txtStatus, errorThrown) {
                    if (txtStatus === 'timeout') {
                        ogrid.Alert.error('Search has timed out.');
                    } else {
                        ogrid.Alert.error( (jqXHR.responseText) ? jqXHR.responseText : txtStatus);
                    }
                },
                statusCode: {
                    //placeholder
                    404: function() {
                        ogrid.Alert.error( "Page not found" );
                    }
                }
            });
        } else {
            onSuccess(ogrid.Mock.data.tweet);
        }
    }
});

//supported syntax (regex)
//RegEx pattern by which the QuickSearch Prcoessor factory can recognize this
ogrid.QSearchProcessor.Tweet.pattern = /^(tweet|twe).*$/i;