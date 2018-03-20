///<amd-module name='core'/>

define('core', [
], function (
) {
    'use strict';

    /**
     * TODO: здесь намешано много вещей, не являющихся ядром. Со временем их нужно будет вынести во вспомогательные модули.
     */

    //bootstrap modal fix: http://stackoverflow.com/questions/32581987/need-click-twice-after-hide-a-shown-bootstrap-popover
    $('body').on('hidden.bs.popover', function (e) {
        $(e.target).data('bs.popover').inState = { click: false, hover: false, focus: false };
    });

    function getSummernoteValue() {
        return $('#summernote').summernote('code');
    }

    var r20 = /%20/g,
        rbracket = /\[\]$/;

    function replaceUrlParameters(url, parameters) {
        var result = url;
        var paramNames = url.match(/{\w+}/g);
        if (paramNames) {
            for (var i = 0; i < paramNames.length; i++) {
                var placeholder = paramNames[i];
                var name = placeholder.substr(1, placeholder.length - 2);
                var value = parameters[name];
                if (value === null || typeof value === 'undefined')
                    throw new Error('Required parameter value missing "' + placeholder + '".');
                result = result.replace(placeholder, value.toString());
                delete parameters[name];
            }
        }
        return result;
    }

    function resolveUrl(url, parameters) {
        //console.log('rootUrl is ' + this.rootUrl);
        if (url && url.substr(0, 2) === '~/') {
            var root = this.rootUrl;
            
            if (root.length > 0 && root.charAt(root.length - 1) === '/')
                root = root.substr(0, root.length - 1);
            url = root + url.substr(1);
        }

        if (parameters) {
            url = replaceUrlParameters(url, parameters);
        }
        //console.log('returned url is ' + url);
        return url;
    }

    function addAntiForgeryToken(data) {
        data.__RequestVerificationToken = $('#__AjaxAntiForgeryForm input[name=__RequestVerificationToken]').val();
        return data;
    }

    var loadingCount = 0;

    function toggleLoading(param) {
        var oldCount = loadingCount;
        switch (param) {
        case 'show':
            loadingCount++;
            break;
        case 'hide':
            if (loadingCount > 0)
                loadingCount--;
            break;
        }

        if (loadingCount === 1 && oldCount === 0) {
            $(".overlayShadow").show();
        } else if (loadingCount === 0 && oldCount > 0) {
            $(".overlayShadow").hide();
        }
    }

    function buildParams(prefix, obj, traditional, add) {
        var name;
        if (jQuery.isArray(obj)) {
            // Serialize array item.
            jQuery.each(obj, function (i, v) {
                if (traditional || rbracket.test(prefix)) {
                    // Treat each array item as a scalar.
                    add(prefix, v);

                } else {
                    // Item is non-scalar (array or object), encode its numeric index.
                    buildParams(prefix + "[" + i + "]", v, traditional, add);
                }
            });

        } else if (!traditional && jQuery.type(obj) === "object") {
            // Serialize object item.
            for (name in obj) {
                buildParams(prefix + "." + name, obj[name], traditional, add);
            }

        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    }

    function optionsAsGetParams(a, traditional) {
        var prefix,
            s = [],
            add = function (key, value) {
                // If value is a function, invoke it and return its value
                value = jQuery.isFunction(value) ? value() : (value == null ? "" : value);
                if (typeof value == 'object') {
                    var urlString = "";
                    for (var prop in value) {
                        urlString += urlString.length > 0 ? "&" : "";
                        if (!Array.isArray(value[prop])) {
                            urlString += encodeURIComponent(prop) + "=";
                            urlString += encodeURIComponent(value[prop]);
                        } else {
                            var obj = {};
                            obj[prop] = value[prop];
                            urlString += $.param(obj);
                        }
                    }
                    if (urlString.length > 0) {
                        s[s.length] = urlString;
                    }
                } else if (value) {
                    s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
                }
            };

        // Set traditional to true for jQuery <= 1.3.2 behavior.
        if (traditional === undefined) {
            traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
        }

        // If an array was passed in, assume that it is an array of form elements.
        if (jQuery.isArray(a) || (a.jquery && !jQuery.isPlainObject(a))) {
            // Serialize the form elements
            jQuery.each(a, function () {
                add(this.name, this.value);
            });

        } else {
            // If traditional, encode the "old" way (the way 1.3.2 or older
            // did it), otherwise encode params recursively.
            for (prefix in a) {
                buildParams(prefix, a[prefix], traditional, add);
            }
        }

        // Return the resulting serialization
        return s.join("&").replace(r20, "+");
    }

    function beginLoading() {
        toggleLoading('show');
    }

    function endLoading() {
        toggleLoading('hide');
    }

    function error(message) {
        toastr.error(message);
        throw new Error(message);
    }

    function getWindowWidth() {
        return $(window).outerWidth();
    }

    function createHiddenChartContainer(chartOptions) {
        var newContainer = $('<div id="hidden-chart-container" style="position:absolute;top:-9999em;width:1000px;height:500px"></div>');
        newContainer.appendTo('body');
        return Highcharts.chart('hidden-chart-container', chartOptions);
    }

    function getHiddenChartContainer(chartOptions) {
        return $('#hidden-chart-container').highcharts();
    }

    function destroyHiddenChartContainer() {
        $('#hidden-chart-container').highcharts().destroy();
    }

    function calculateTextContainerWidth(text, maxWidth, fontSize) {
        var width;
        var textBox = $('<span id="box-to-calculate-text-width">' + text + '</span>');
        if (fontSize) {
            textBox.css('font-size', fontSize + 'px');
            textBox.css('font-weight', 'bold');
        }
        $('body').append(textBox);
        width = textBox.outerWidth();

        if (width > maxWidth)
            return maxWidth;

        textBox.remove();

        return width + 1;
    }

    function selectHandbookVal(args) {
        $(".input-large.form-control[columnField=" + args.columnField + "]").val(args.handbookValue);
    }

    function selectSearchVal(args) {
        $(".slick-grid-search[columnField=" + args.columnField + "]").val(args.searchText);
    }

    /**
     * Типы виджетов аналитических панелей
     */
    var widgetTypes = {
        text: { id: 0, name: 'text' },
        chart: { id: 1, name: 'chart' }
    };

    var Math = {
        'равно': function (a, b) {
            return a == b;
        },
        'не равно': function (a, b) {
            return a != b;
        },
        'больше': function (a, b) {
            return a > b;
        },
        'больше или равно':function (a, b) {
            return a >= b;
        },
        'меньше':function (a, b) {
            return a < b;
        },
        'меньше или равно':function (a, b) {
            return a <= b;
        }
    };

    var Boolean = {
        'и': function (a, b) {
            return a && b;
        },
        'или': function (a, b) {
            return a || b;
        }
    };

    var memberUpdateModes = {
        Calculation: { id: 1, text: 'Расчет' },
        Manual: { id: 2, text: 'Ручной' },
        Automatic: { id: 3, text: 'Автоматический' }
    };

    var getMemberUpdateMode = function(id){
        var updateModeKeys = Object.keys(memberUpdateModes);
        return ko.utils.arrayFirst(updateModeKeys, function (key) {
            return memberUpdateModes[key].id == id
        });
    }

    var app = {
        getSummernoteValue: getSummernoteValue,
        
        replaceUrlParameters: replaceUrlParameters,
        resolveUrl: resolveUrl,
        addAntiForgeryToken: addAntiForgeryToken,
        toggleLoading: toggleLoading,
        beginLoading: beginLoading,
        endLoading: endLoading,
        error: error,
        makeGetParams: optionsAsGetParams,
        getWindowWidth: getWindowWidth,
        calculateTextContainerWidth: calculateTextContainerWidth,
        Math: Math,
        Boolean: Boolean,
        createHiddenChartContainer: createHiddenChartContainer,
        getHiddenChartContainer: getHiddenChartContainer,
        destroyHiddenChartContainer: destroyHiddenChartContainer,
        selectHandbookVal: selectHandbookVal,
        selectSearchVal: selectSearchVal,
        widgetTypes: widgetTypes,
        memberUpdateModes: memberUpdateModes,
        getMemberUpdateMode:getMemberUpdateMode,

        // Заполняется с бэкэнда через глобальные константы window.AppGlobals
        rootUrl: '',
        isOperatorRole: false,
        isManagerRole: false,
        isAdminRole: false,
        isAnalystRole: false,
        userRoles: [],
        title: '',
        isGisp: false,
        managersDesktop: {
            isAdmin: false,
            isAnalyst: false,
            isManager: false
        },
        user: {
            title: '',
            login: ''
        },
        userOU: {
            id: null,
            fullAccess: false,
            name: ''
        },
        flexmonster: {
            dataSource: '',
            licenceKey: ''
        }
    };

    // Мержим с глобальными константами 
    Object.assign(app, window.AppGlobals);

    return app;
});