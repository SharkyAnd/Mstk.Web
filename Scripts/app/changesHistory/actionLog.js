// @ts-check
/// <amd-module name="changesHistory/actionLog"/>
/// <reference path="../../typings/requirejs/require.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />

define('changesHistory/actionLog', [
    'core',
    'common/mediator',
    'common/dataAccess',
    'common/ui',
    'common/models',
    'watch/resources',
    'watch/views/common',
    'watch/views/periods',
    'watch/views/gridFilter'
], function (
    Core,
    Mediator,
    Data,
    UI,
    CommonModels,
    Resources,
    Common,
    Periods, // TODO: не используется
    Grid
) {

    'use strict';

    var wordWrapFormatter = function (row, cell, value, columnDef, dataContext) {
        return "<span style='white-space:normal'>" + value + "</span>";
    };
    var filterOperators = [
        { DX: 'contains', Server: 'Contains' },
        { DX: '=', Server: 'Equals' }
    ];
    function getServerOperator(dxDefinition) {
        var serverDef = ko.utils.arrayFirst(filterOperators, function (item) {
            return item.DX == dxDefinition;
        });
        return serverDef ? serverDef.Server : {};
    }
    var Urls = {
        ListActionLogs: '~/ChangesHistory/ListActionLogs',
        GetActionLogColumnHandbooks: '~/ChangesHistory/GetActionLogColumnHandbook',
        ExportActionLogs: '~/ChangesHistory/ExportLogsToExcel',
        ListAutomationLogs: '~/ChangesHistory/GetAutomationLogs',
        ExportAutoLogs: '~/ChangesHistory/ExportAutoLogsToExcel',
        GetAutomationLogsColumnHandbooks: '~/ChangesHistory/GetAutomationLogColumnHandbook',
        ListPortfolioLogs: '~/ChangesHistory/ListPortfolioLogs',
        GetPortfolioLogColumnHandbooks: '~/ChangesHistory/GetPortfolioLogColumnHandbooks',
        ExportPortfolioLogs: '~/ChangesHistory/ExportPortfolioLogs',
    };

    function FilterDef(data) {
        this.fieldNames = data.fieldNames;
        var value = data.value;
        if (!ko.isObservable(value)) {
            value = ko.observable(value);
        }
        this.value = value;
        this.operator = data.operator;
    }

    FilterDef.prototype.toJs = function () {
        return {
            FieldNames: this.fieldNames,
            Value: ko.unwrap(this.value),
            Operator: this.operator
        };
    };

    var ActionLogListView = Class.extend({
        init: function (params) {
            var self = this;
            this.url = Urls.ListActionLogs;
            this.searchText = ko.observable();
            this.defaults = {
                sortColumn: {},
                sortDescending: false,
                pageSize: 50,
                pagerButtonsCount: 5,
                smallPagerButtonCount: 3,
                initialFilters: [
                    {
                        fieldNames: ['Name', 'ObjectName'],
                        value: this.searchText,
                        operator: 'Contains'
                    }
                ]
            };

            var options = $.extend(Object.create(null), this.defaults);
            if (params.options) {
                $.extend(options, params.options);
            }

            this.displayTemplate = ko.observable('views/actionLogGrid');
            this.currentPage = ko.observable(0);
            this.firstItemIndex = ko.pureComputed(function () {
                return self.currentPage() * self.pageSize();
            }, this);

            this.filters = ko.observableArray((options.initialFilters || []).map(function (filt) {
                var def = new FilterDef(filt);
                return def;
            }));
            this.sortColumn = ko.observable(options.sortColumn);
            this.sortDescending = ko.observable(options.sortDescending);
            this.currentFilters = ko.pureComputed(function () {
                var result = [],
                    filters = this.filters();

                filters.forEach(function (filter) {
                    var val = ko.unwrap(filter.value);
                    if (val !== null && val !== undefined && val !== '') {
                        result.push(filter);
                    }
                });

                return result;
            }, this);

            this.totalItemsCount = ko.observable();
            this.pageSize = ko.observable(options.pageSize);
            this.pager = new UI.Pager(this, this.pageSize());
            this.isBusy = ko.observable(false);
            this.isBusy.subscribe(function (val) {
                Core.toggleLoading(val ? 'show' : 'hide');
            });

            this.currentHandbookValues = ko.observableArray();
            this.currentSearchValues = ko.observableArray();

            this.menu = ko.pureComputed(function () {
                var menu = new UI.Menu();
                menu.alignRight(true);

                menu.newGroup();
                menu.add('Экспорт в PDF', self.exportToPdf, self).iconClass('fa fa-file-pdf-o');
                menu.add('Экспорт в Excel', self.exportToExcel, self).iconClass('fa fa-file-excel-o');

                return menu;
            });
            this.chartData = ko.observable();
            this.refresh();
        },
        exportToExcel: function () {

        },
        exportToPdf: function () {

        },
        gotoPage: function (firstItemIndex) {
            this.currentPage(Math.floor(firstItemIndex / this.pageSize()));
            this.refresh();
        },
        refresh: function () {
            var self = this;
            var data = {
                Start: ko.unwrap(this.firstItemIndex),
                Limit: ko.unwrap(this.pageSize)
            };

            var currentFilters = this.currentFilters();
            if (currentFilters && currentFilters.length) {
                data.Filters = currentFilters.map(function (filt) {
                    return filt.toJs();
                });
            }
            var sortCol = this.sortColumn();
            if (sortCol) {
                data.SortingConditions = [{ FieldName: sortCol.FieldName, Direction: sortCol.Direction }];
            }
            var listUrl = this.url;
            var request = Data.createRequest(listUrl);
            this.addAdditionalParamsToRequest(data);
            this.isBusy(true);
            request.post(data)
                .done(function (result) {
                    self.dataLoaded(result);
                }).always(function () {
                    self.isBusy(false);
                });
        },
        dataLoaded: function (result) {
            var self = this;
            self.totalItemsCount(result.TotalCount);
            self.pager.pageSize = self.pageSize();
            self.pager.update(self.firstItemIndex(), self.totalItemsCount());
            var chartData = self.createTableData(result);
            self.chartData(chartData);
        },
        getParametersJson: function () {
            var js = this._super(),
                ss = this.getSliderState(),
                filters = this.gridFilters(),
                sorting = this.gridSorting(),
                slider = {
                    type: 'range',
                    selectedMin: ss ? ss.min : null,
                    selectedMax: ss ? ss.max : null
                };

            if (ss.min && ss.min !== ss.defaultMin) {
                slider.min = ss.min;
            }
            if (ss.max && ss.max !== ss.defaultMax) {
                slider.max = ss.max;
            }

            if (filters && filters.length > 0)
                js.gridFilters = filters;
            if (sorting && sorting.length > 0)
                js.gridSorting = sorting;

            js.slider = slider;

            return js;
        },
        createTableData: function (result) {
            var data = result.Data;
            var columnNames = [
                {
                    field: 'ObjectName',
                    name: 'Тип объекта',
                    maxWidth: 90
                },
                {
                    field: 'ActionTypeName',
                    name: 'Действие',
                    maxWidth: 90
                },
                {
                    field: 'OldValue',
                    name: 'Было'
                },
                {
                    field: 'NewValue',
                    name: 'Стало'
                },
                {
                    field: 'Name',
                    name: 'Наименование',
                    width: 300
                },
                {
                    field: 'Period',
                    name: 'Период'
                },
                {
                    field: 'ActionDate',
                    name: 'Дата действия'
                },
                {
                    field: 'UserFIO',
                    name: 'Пользователь'
                },
                {
                    field: 'Transsegment',
                    name: 'Организация'
                },
                {
                    field: 'ObjectLink',
                    name: 'Перейти',
                    formatter: function (row, cell, value, columnDef, dataContext) {
                        if (!value)
                            return '';
                        return '<a href="' + value + '">' + value + '</a>';
                    }
                }
            ];

            var self = this,
                columns = _.map(columnNames, function (column, index) {
                    var id = index + 2;
                    var hasHandbook = false;
                    var handbookValues = [];
                    var col = {
                        id: id,
                        field: column.field,
                        name: column.name,
                        selectable: true,
                        resizable: true,
                        sortable: true,
                        formatter: wordWrapFormatter
                    };

                    if (column.minWidth) {
                        col.minWidth = column.minWidth;
                    }

                    if (column.maxWidth) {
                        col.maxWidth = column.maxWidth;
                    }

                    if (column.width) {
                        col.width = column.width;
                    }

                    if (column.formatter)
                        col.formatter = column.formatter;
                    _.each(result.Handbooks, function (handbook, index) {
                        hasHandbook = handbook.Name == column.field;
                        if (hasHandbook)
                            handbookValues = handbook.Values;
                    });
                    if (handbookValues && handbookValues.length > 0) {
                        col.handbook = handbookValues;
                        col.onChooseHandbook = self.onChooseHandbook;
                    }
                    return col;
                });

            var rowData = _.map(data, function (d, index) {
                var row = {};
                row['id'] = 'c' + index;
                _.each(columnNames, function (column, index) {
                    row[column.field] = d[column.field] ? d[column.field] : null;
                });
                return row;
            });

            for (var i = 0; i < columns.length; i++) {
                columns[i].header = {
                    menu: {
                        items: [
                            {
                                iconCssClass: 'fa fa-sort-numeric-asc',
                                title: 'Сортировка по возрастанию',
                                command: 'ASC'
                            },
                            {
                                iconCssClass: 'fa fa-sort-numeric-desc',
                                title: 'Сортировка по убыванию',
                                command: 'DESC'
                            }
                        ]
                    }
                };
            }

            var gridConfig = {
                options: {
                    enableColumnReorder: false,
                    editable: false,
                    enableCellNavigation: true,
                    defaultFormatter: function (row, cell, value, columnDef, dataContext) {
                        var ret = ko.unwrap(value);
                        return cell > 0 ? Common.Utils.formatValue(ret) : ret;
                    },
                    resizable: false,
                    sizeToContainer: true,
                    explicitInitialization: true,
                    showHeaderRow: true,
                    useServerFiltering: true,
                    wrapText: true,
                    fullWidthRows: true,
                    forceFitColumns: true,
                    syncColumnCellResize: true,
                    enableAddRow: true
                },
                columns: columns,
                data: rowData,
                afterInit: function (grid) {
                    setTimeout(function () {
                        var selectedHandbooks = self.currentHandbookValues();
                        if (selectedHandbooks && selectedHandbooks.length > 0) {
                            for (var i = 0; i < selectedHandbooks.length; i++) {
                                Core.selectHandbookVal(selectedHandbooks[i]);
                            }
                        }

                        var selectedSeacrh = self.currentSearchValues();
                        if (selectedSeacrh && selectedSeacrh.length > 0) {
                            for (var i = 0; i < selectedSeacrh.length; i++) {
                                Core.selectSearchVal(selectedSeacrh[i]);
                            }
                        }

                        var sortCol = self.sortColumn();
                        if (sortCol && sortCol.ColumnIndex)
                            grid.setSortColumn(sortCol.ColumnIndex, sortCol.Direction == 'ASC');

                        grid.autosizeColumns(100);
                    }, 0);
                },
                onCommand: function (e, args) {
                    self.sortColumn({ FieldName: args.column.field, Direction: args.command, ColumnIndex: args.column.id });

                    self.refresh();
                },
                onHandbookValueSelected: function (eventData, args) {
                    var def = new FilterDef({ fieldNames: [args.columnField], value: args.handbookValue, operator: 'Equals' });
                    var currentF = self.currentFilters();
                    for (var i = 0; i < currentF.length; i++) {
                        if (currentF[i].fieldNames[0] == def.fieldNames[0])
                            currentF.splice(i, 1);
                    }
                    var currentH = self.currentHandbookValues();
                    for (var i = 0; i < currentH.length; i++) {
                        if (currentH[i].columnField == args.columnField)
                            currentH.splice(i, 1);
                    }
                    if (args.handbookValue && args.handbookValue != '') {
                        self.currentHandbookValues().push(args);
                        self.currentFilters().push(def);
                    }
                    self.refresh();
                },
                onColumnSearch: function (eventData, args) {
                    var def = new FilterDef({ fieldNames: [args.columnField], value: args.searchText, operator: 'Contains' });
                    var currentF = self.currentFilters();
                    for (var i = 0; i < currentF.length; i++) {
                        if (currentF[i].fieldNames[0] == def.fieldNames[0])
                            currentF.splice(i, 1);
                    }

                    var currentS = self.currentSearchValues();
                    for (var i = 0; i < currentS.length; i++) {
                        if (currentS[i].columnField == args.columnField)
                            currentS.splice(i, 1);
                    }

                    if (args.searchText && args.searchText != '') {
                        self.currentSearchValues().push(args);
                        self.currentFilters().push(def);
                    }
                    self.refresh();
                }
            };

            var chartData = {
                chart: {
                    type: 'table'
                },
                yAxesCount: 1,
                displayTemplate: 'views/grid',
                config: gridConfig,
                rows: rowData
            };

            return chartData;
        },
        addAdditionalParamsToRequest: function () {

        }
    });

    var ActionLogDxView = Class.extend({
        init: function (params) {
            var self = this;

            this.isBusy = ko.observable(false);
            this.isBusy.subscribe(function (val) {
                Core.toggleLoading(val ? 'show' : 'hide');
            });

            this.data = ko.observable();
            this.refresh();
        },
        refresh: function () {
            this.createTableData();
        },
        getParametersJson: function () {
            var js = this._super(),
                ss = this.getSliderState(),
                filters = this.gridFilters(),
                sorting = this.gridSorting(),
                slider = {
                    type: 'range',
                    selectedMin: ss ? ss.min : null,
                    selectedMax: ss ? ss.max : null
                };

            if (ss.min && ss.min !== ss.defaultMin) {
                slider.min = ss.min;
            }
            if (ss.max && ss.max !== ss.defaultMax) {
                slider.max = ss.max;
            }

            if (filters && filters.length > 0)
                js.gridFilters = filters;
            if (sorting && sorting.length > 0)
                js.gridSorting = sorting;

            js.slider = slider;

            return js;
        },
        createTableData: function (result) {
            var self = this;

            var columns = [{
                caption: "Тип объекта",
                dataField: "ObjectName",
                excelWidth: '20'
            }, {
                caption: "Наименование",
                dataField: "Name",
                allowHeaderFiltering: false,
                excelWidth: '20'
            }, {
                caption: "Верхний уровень",
                dataField: "ParentObjectName",
                allowHeaderFiltering: false,
                excelWidth: '20'
            }, {
                caption: "Действие",
                dataField: "ActionTypeName",
                width: 'auto',
                excelWidth: '15'
            }, {
                caption: "Поле",
                dataField: "Field",
                width: 'auto',
                excelWidth: '20'
            }, {
                caption: "Было",
                dataField: "OldValue",
                allowHeaderFiltering: false,
                excelWidth: '50'
            }, {
                caption: "Стало",
                dataField: "NewValue",
                allowHeaderFiltering: false,
                excelWidth: '50'
            }, {
                caption: "Период",
                dataField: "Period",
                allowHeaderFiltering: false,
                excelWidth: '20'
            }, {
                caption: "Дата действия",
                dataField: "ActionDate",
                dataType: 'date',
                allowHeaderFiltering: false,
                width: '146px',
                excelWidth: '20',
                cellTemplate:function(container, options){
                    $("<div>")
                        .text(options.data.ActionDate)
                        .appendTo(container);
                }
            }, {
                caption: "Пользователь",
                dataField: "UserFIO",
                excelWidth: '30'
            }, {
                caption: "Организация",
                dataField: "Transsegment",
                excelWidth: '15'               
            }, {
                caption: "Ссылка",
                dataField: "ObjectLink",
                cellTemplate: function (container, options) {
                    //console.log('ObjectLink is ' + options.data.ObjectLink)
                    $('<a/>').addClass('dx-link')
                        .text('Перейти')
                        .attr('href', options.data.ObjectLink)
                        .attr('target','_blank')
                        .on('dxclick', function () {

                        })
                        .appendTo(container);
                },
                width: 'auto',
                allowHeaderFiltering: false,
                excelWidth: '15',
                excelColumnType: 'Link',
                allowSearch: false
            }];

            var gridConfig = {
                headerFilter: {
                    visible: true,
                    width: '300px',
                    height: '400px'
                },
                allowColumnReordering: true,
                allowColumnResizing: true,
                remoteOperations: {
                    sorting: true,
                    paging: true,
                    filtering: true
                },
                export: {
                    enabled: false,
                    custom:true
                },
                columns: columns
            }
            var table = new CommonModels.DxDataTable(gridConfig, Urls.ListActionLogs, Urls.GetActionLogColumnHandbooks, Urls.ExportActionLogs);

            this.data(table);
        },
        addAdditionalParamsToRequest: function () {

        }
    });

    var AutomationLogDxView = Class.extend({
        init: function (params) {
            var self = this;

            this.isBusy = ko.observable(false);
            this.isBusy.subscribe(function (val) {
                Core.toggleLoading(val ? 'show' : 'hide');
            });

            this.data = ko.observable();
            this.refresh();
        },
        refresh: function () {
            this.createTableData();
        },
        getParametersJson: function () {
            var js = this._super(),
                ss = this.getSliderState(),
                filters = this.gridFilters(),
                sorting = this.gridSorting(),
                slider = {
                    type: 'range',
                    selectedMin: ss ? ss.min : null,
                    selectedMax: ss ? ss.max : null
                };

            if (ss.min && ss.min !== ss.defaultMin) {
                slider.min = ss.min;
            }
            if (ss.max && ss.max !== ss.defaultMax) {
                slider.max = ss.max;
            }

            if (filters && filters.length > 0)
                js.gridFilters = filters;
            if (sorting && sorting.length > 0)
                js.gridSorting = sorting;

            js.slider = slider;

            return js;
        },
        createTableData: function (result) {
            var self = this;

            var gridConfig = {              
                headerFilter: {
                    visible: true,
                    width: '300px',
                    height: '400px'
                },
                export: {
                    enabled: false,
                    custom:true
                },
                allowColumnReordering: true,
                allowColumnResizing: true,
                remoteOperations: {
                    sorting: true,
                    paging: true,
                    filtering: true
                },
                columns: [{
                    caption: "Наименование",
                    dataField: "Name",
                    allowHeaderFiltering: false,
                    excelWidth: '20'
                }, {
                    caption: "Было",
                    dataField: "OldValue",
                    allowHeaderFiltering: false,
                    excelWidth: '30'
                }, {
                    caption: "Стало",
                    dataField: "NewValue",
                    allowHeaderFiltering: false,
                    excelWidth: '30'
                }, {
                    caption: "Период",
                    dataField: "Period",
                    allowHeaderFiltering: false,
                    excelWidth: '15'
                }, {
                    caption: "Дата действия",
                    dataField: "ActionDate",
                    dataType: 'date',                    
                    allowHeaderFiltering: false,
                    excelWidth: '15',
                    cellTemplate: function (container, options) {
                        $("<div>")
                            .text(options.data.ActionDate)
                            .appendTo(container);
                    }
                }, {
                    caption: "Источник данных",
                    dataField: "DataSource",
                    excelWidth: '20'
                }, {
                    caption: "Перейти",
                    dataField: "ObjectLink",
                    cellTemplate: function (container, options) {
                        $('<a/>').addClass('dx-link')
                            .text('Перейти')
                            .attr('target', '_blank')
                            .attr('href', options.data.ObjectLink)
                            .on('dxclick', function () {

                            })
                            .appendTo(container);
                    },
                    width: '100px',
                    allowHeaderFiltering: false,
                    excelWidth: '15',
                    excelColumnType: 'Link',
                allowSearch :false
                }]
            }
            var table = new CommonModels.DxDataTable(gridConfig, Urls.ListAutomationLogs, Urls.GetAutomationLogsColumnHandbooks, Urls.ExportAutoLogs);

            this.data(table);
        },
        addAdditionalParamsToRequest: function () {

        }
    });

    var PortfolioMonitoringDxView = Class.extend({
        init: function (params) {
            var self = this;

            this.isBusy = ko.observable(false);
            this.isBusy.subscribe(function (val) {
                Core.toggleLoading(val ? 'show' : 'hide');
            });

            this.data = ko.observable();
            this.refresh();
        },
        refresh: function () {
            this.createTableData();
        },
        getParametersJson: function () {
            var js = this._super(),
                ss = this.getSliderState(),
                filters = this.gridFilters(),
                sorting = this.gridSorting(),
                slider = {
                    type: 'range',
                    selectedMin: ss ? ss.min : null,
                    selectedMax: ss ? ss.max : null
                };

            if (ss.min && ss.min !== ss.defaultMin) {
                slider.min = ss.min;
            }
            if (ss.max && ss.max !== ss.defaultMax) {
                slider.max = ss.max;
            }

            if (filters && filters.length > 0)
                js.gridFilters = filters;
            if (sorting && sorting.length > 0)
                js.gridSorting = sorting;

            js.slider = slider;

            return js;
        },
        createTableData: function (result) {
            var self = this;

            var columns = [{
                caption: "Тип объекта",
                dataField: "ObjectName",
                excelWidth: '20'
            }, {
                caption: "Наименование",
                dataField: "Name",
                allowHeaderFiltering: false,
                excelWidth: '20'
            }, {
                caption: "Поле",
                dataField: "Field",
                width: 'auto',
                excelWidth: '15'
            }, {
                caption: "Действие",
                dataField: "ActionTypeName",
                width: 'auto',
                excelWidth: '15'
            }, {
                caption: "Было",
                dataField: "OldValue",
                allowHeaderFiltering: false,
                excelWidth: '50'
            }, {
                caption: "Стало",
                dataField: "NewValue",
                allowHeaderFiltering: false,
                excelWidth: '50'
            }, {
                caption: "Период",
                dataField: "Period",
                allowHeaderFiltering: false,
                excelWidth: '20'
            }, {
                caption: "Дата действия",
                dataField: "ActionDate",
                dataType: 'date',
                allowHeaderFiltering: false,
                excelWidth: '15',
                cellTemplate: function (container, options) {
                    $("<div>")
                        .text(options.data.ActionDate)
                        .appendTo(container);
                }
            }, {
                caption: "Владелец",
                dataField: "Owner",
                excelWidth: '30'
            }, {
                caption: "Организация владельца",
                dataField: "OwnerOrgName",
                excelWidth: '30',
                allowSearch :false
            }, {
                caption: "Пользователь",
                dataField: "UserFIO",
                excelWidth: '30'
            }, {
                caption: "Организация",
                dataField: "Transsegment",
                excelWidth: '15'
            }, {
                caption: "Ссылка",
                dataField: "ObjectLink",
                cellTemplate: function (container, options) {
                    //console.log('ObjectLink is ' + options.data.ObjectLink)
                    $('<a/>').addClass('dx-link')
                        .text('Перейти')
                        .attr('href', options.data.ObjectLink)
                        .attr('target', '_blank')
                        .on('dxclick', function () {

                        })
                        .appendTo(container);
                },
                width: 'auto',
                allowHeaderFiltering: false,
                excelWidth: '15',
                excelColumnType: 'Link',
                allowSearch :false
            }];

            var gridConfig = {
                headerFilter: {
                    visible: true,
                    width: '300px',
                    height: '400px'
                },
                allowColumnReordering: true,
                allowColumnResizing: true,
                remoteOperations: {
                    sorting: true,
                    paging: true,
                    filtering: true
                },
                export: {
                    enabled: false,
                    custom:true
                },
                columns: columns
            }
            var table = new CommonModels.DxDataTable(gridConfig, Urls.ListPortfolioLogs, Urls.GetPortfolioLogColumnHandbooks, Urls.ExportPortfolioLogs);

            this.data(table);
        },
        addAdditionalParamsToRequest: function () {

        }
    });

    //return ActionLogListView;
    return {
        ActionLogDxView: ActionLogDxView,
        AutomationLogDxView: AutomationLogDxView,
        PortfolioMonitoringDxView: PortfolioMonitoringDxView
    };
});