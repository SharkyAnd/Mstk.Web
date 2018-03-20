$(function () {

    var renderCharts = function (domElement, chartOptions) {
        var $domElement = $(domElement);

        if (chartOptions) {

            chartOptions.chart = chartOptions.chart || {};

            var height = $domElement.height(),
                chartSettings = chartOptions.chart,
                chartType = chartSettings ? chartSettings.type : null,
                maxItems = 20;

            if (chartType === 'bar' && height && chartOptions.series && chartOptions.series.length) {
                var dataSize = height - height * 0.15 - 40,
                    itemsHeight = dataSize / maxItems,
                    series = chartOptions.series[0].data || [],
                    seriesNew = [];

                for (var i = 0, l = series.length; i < l; i += maxItems) {
                    var seriesSlice = series.slice(i, i + maxItems);
                    seriesNew.push({
                        name: Math.ceil(i / maxItems) + 1,
                        data: seriesSlice,
                        pointWidth: itemsHeight,
                        visible: i === 0
                    });
                }
                chartOptions.xAxis.categories = chartOptions.xAxis.categories.slice(0, maxItems);
                chartOptions.series = seriesNew;
                if (!chartOptions.hasOwnProperty('legend')) {
                    chartOptions.legend = {};
                }
                chartOptions.legend.enabled = seriesNew.length > 1;
            }

            chartOptions.chart.height = height * 0.98;

            if (!chartOptions.isMap)
                $domElement.highcharts(chartOptions);
            else
                $domElement.highcharts('Map', chartOptions);

            var chart = $domElement.highcharts();
            if (!chart.hasData()) { // Only if there is no data
                chart.hideNoData(); // Hide old message
                chart.showNoData('Нет данных для отображения');
            }
        }
        else {
            $domElement.empty();
        }
    }

    ko.bindingHandlers.highCharts = {

        init: function (element, valueAccessor) {
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                var chart = $(element).highcharts();

                if (chart && chart.destroy) {
                    chart.destroy();
                }
                else {
                    try {
                        $(element).highcharts('destroy');
                    } catch (e) {
                    }
                }
            });
            var value = valueAccessor(),
                config = ko.unwrap(value);
        },

        update: function (element, valueAccessor) {
            var value = valueAccessor(),
                config = ko.unwrap(value);

            renderCharts(element, config);

        }
    }
});