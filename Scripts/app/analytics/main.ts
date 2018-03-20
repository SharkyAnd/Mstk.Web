/// <amd-module name='analytics/main'/>

/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/moment/moment.d.ts" />
/// <reference path="../../typings/underscore/underscore.d.ts" />
/// <reference path="../../typings/toastr/toastr.d.ts" />

import Core = require('core');
import MemberFilters = require('member/filters');
import Data = require('common/dataAccess');
import Models = require('common/models');
import UI = require('common/ui');

import { FilterItemModel, AnalyticsReport, Statistics } from 'common/dataModels/api';
import { PropertyModel, LookupPropertyEx, HierarchicalLookupProperty, createLookup, createHierarchicalLookup } from '../common/properties';
import { DxDataTable } from '../common/models';

let Urls = {
    getReportTypes: '~/analytics/reportTypes',
    filters: '~/filters?actualOnly={actualOnly}&withDataOnly={withDataOnly}',
    createReport: '~/analytics/report',
    getStatistics: '~/analytics/statistics',
    organizations: '~/ou/my',
    organizationManagers: '~/ou/{orgId}/managers?includeSelf=true',
    getUserBlocks: '~/widgets/folders'
}

let SortFunc = function (c1: any, c2: any) { // FIXME: any
    if (c1.TransSegmentId === c2.TransSegmentId)
        return c1.SortOrder - c2.SortOrder;
    else if (!c1.TransSegmentId && c2.TransSegmentId)
        return -1;
    else
        return 1;
};

/**
 * /@class
 * Абстрактный класс, представляющий блок на странице сводной аналитики
 */
export class AnalyticsBlock {
    public name: string;
    public templateName: string;
    public isBusy: KnockoutObservable<boolean> = ko.observable(false);
    constructor() {
        this.isBusy.subscribe((val) => {
            Core.toggleLoading(val ? 'show' : 'hide');
        });
    }
    public load() {

    }
}
/**
 * /@class
 * Фильтры для отчета "Перечень показателей"
 */
class Filters extends MemberFilters.Tree {
    /**
     * /@constructor
     */
    constructor() {
        let url = Core.replaceUrlParameters(Urls.filters, {
            actualOnly: true,
            withDataOnly: false
        });
        super(url);
        this.isValid(true);
        this.privateOnly(false);
    }
    /**
     * /@method
     * Загрузить данные по имеющимся фильтрам
     * @param report
     * Тип отчета
     */
    public load(report: AnalyticsReport): any {
        let request = new Data.Request(Urls.filters);
        let defer = $.Deferred();
        this.rootNodes([]);
        let query = new Data.Query({ actualOnly: true, withDataOnly: false });
        request.get(query).done((result: Array<FilterItemModel>) => {
            ko.utils.arrayForEach(result, (item) => {
                item.IsSelected = false;
            })
            var itemsData = this.itemsFromResult(result);
            var rootsJs = _.filter(itemsData, (x: any) => { // FIXME: any
                return !x.ParentId;
            });
            var rootNodes = _.map(rootsJs, (js) => {
                return new MemberFilters.TreeNode(this, itemsData, js, null);
            });
            this.rootNodes.sort(SortFunc);
            this.rootNodes(rootNodes);
            this.showEditor(report);
            defer.resolve();
        });

        return defer.promise();
    }
    /**
     * /@method
     * Показать всплывающее окно с фильтрами
     * @param report
     */
    public showEditor(report: AnalyticsReport): any {
        let modal = UI.createModal('Выберите фильтр', this, 'shared/filter', 'Выгрузить');

        return modal.show((callback) => {
            var newSelection = this.getSelectedIds().sort();
            this.createReport(newSelection, report)
                .done(function () {
                    callback(true);
                })
                .fail(function () {
                    callback(false);
                });
        });
    }
    /**
     * /@methos
     * Создает отчет, исходя из выбранных фильтров
     * @param newSelection
     * Выбранные фильтры
     * @param report
     * Вид отчета
     */
    public createReport(newSelection, report: AnalyticsReport) {
        let req = new Data.Request(Urls.createReport),
            query = new Data.Query({
                FilterIds: newSelection,
                Report: report
            });
        return req.postJson(query).done((result: number) => {
            if (result == 0) {
                toastr.warning('Нет данных');
                return;
            }
            $('#downloadLink').attr({
                href: Core.resolveUrl('~/members/downloadDocument') + '?fileId=' + result,
                target: '_blank',
                download: ''
            });
            $('#downloadLink')[0].click();
        });
    }
}
/**
 * /@class
 * Отчет - Статистика использования показателей
 */
class UsageStatistics extends Models.DataObjectBase {
    organization: HierarchicalLookupProperty;
    manager: LookupPropertyEx;
    block: HierarchicalLookupProperty;
    activeManagerId: KnockoutComputed<number>;
    /**
     * /@constructor
     */
    constructor() {
        super();
        this.canEdit(true);
        let isAnalyst = (Core.managersDesktop.isAnalyst || Core.managersDesktop.isAdmin);
        this.activeManagerId = ko.pureComputed( ()=> {
            if (isAnalyst) {
                return this.manager.value();
            }
            return '';
        });
        this.organization = createHierarchicalLookup('Organization', 'Организация', Urls.organizations, null).require(true).minLength(0); this.registerProperty(this.organization);
        this.manager = createLookup('Manager', 'Руководитель', Urls.organizationManagers, null, () => {
            return {
                orgId: this.organization.value()
            };
        }).require(true).minLength(0); this.registerProperty(this.manager);
        this.block = createHierarchicalLookup('Block', 'Папка', Urls.getUserBlocks, null, ()=> {
            return {
                userId: this.activeManagerId()
            };
        });
        this.block.minLength(0); this.registerProperty(this.block);
    }
    /**
     * /@method
     * Создать отчет
     * @param report
     * Тип отчета
     */
    public createReport(report: AnalyticsReport): JQueryPromise<any> {
        let req = new Data.Request(Urls.createReport),
            query = new Data.Query({
                OrgId: this.organization.value(),
                UserId: this.manager.value(),
                BlockId: this.block.value(),
                Report: report
            });
        return req.postJson(query).done((result: number) => {
            if (result == 0) {
                toastr.warning('Нет данных');
                return;
            }
            $('#downloadLink').attr({
                href: Core.resolveUrl('~/members/downloadDocument') + '?fileId=' + result,
                target: '_blank',
                download: ''
            });
            $('#downloadLink')[0].click();
        });
    }
}
/**
 * /@class
 * Блок с новой статистикой
 */
class NewStatistics extends AnalyticsBlock {
    reportTypes: KnockoutObservableArray<AnalyticsReport> = ko.observableArray();
    /**
     * /@constructor
     */
    constructor() {
        super();
        this.reportTypes([]);
        this.name = "Новая статистика";
        this.templateName = "analytics/newStatistics";
    }
    /**
     * /@method
     * Загрузить данные
     */
    public load() {
        let req = new Data.Request(Urls.getReportTypes);
        this.isBusy(true);
        req.get().done((result: Array<AnalyticsReport>) => {
            ko.utils.arrayForEach(result, (report) => {
                this.reportTypes.push(report);
            })
            this.isBusy(false);
        })
    }
    /**
     * /@method
     * Создать отчет
     * @param report
     * Тип отчета
     */
    public createReport(report: AnalyticsReport): void {
        switch (report.Name) {
            case "Перечень показателей":
                let editor = new Filters();
                editor.load(report);
                break;
            case "Использование в портфеле Руководителя":
                let model = new UsageStatistics();
                let modal = UI.createModal('Выберите пользователя', model, 'analytics/usageStatistics', 'Выгрузить');

                modal.show((callback) => {
                    model.createReport(report)
                        .done(function () {
                            callback(true);
                        })
                        .fail(function () {
                            callback(false);
                        });
                });
                break;
        }
    }
}
/**
 * /@class
 * Блок со сформированной статистикой
 */
class StatisticsView extends AnalyticsBlock {
    gridOptions: KnockoutObservable<any> = ko.observable({});
    gridInstance: any;
    /**
     * /@constructor
     */
    constructor() {
        super();
        this.name = "Сформированная статистика";
        this.templateName = "analytics/statistics";
    }
    /**
     * /@method
     * Загрузить данные
     */
    public load() {
        var columns = [
            {
                caption: "Наименование формы",
                dataField: "FormName",
                excelWidth: '20',
                width:'32%'
            },
            {
                caption: "Пользователь",
                dataField: "UserName",
                excelWidth: '20',
                width: '32%'
            },
            {
                caption: "Дата формирования",
                dataField: "CreateDate",
                excelWidth: '20',
                width: '32%'
            },
            {
                caption: "",
                dataField: "FileId",
                excelWidth: '20',
                cellTemplate: (container, options) => {
                    $('<a/>').addClass('fa fa-download ')
                        .addClass('button-link')
                        .attr('href', Core.resolveUrl('~/members/downloadDocument') + '?fileId=' + options.data.FileId)
                        .attr('target', '_blank')
                        .attr('title', 'Скачать')
                        .attr('download', '').appendTo(container);
                },
                headerCellTemplate: (header, info) => {
                    $('<span/>').addClass('fa fa-refresh')
                        .on('dxclick', (e) => {
                            e.preventDefault();
                            this.refreshData();
                        })
                        .appendTo(header);
                },
                width: '4%',
                alignment: 'left',
                allowSorting: false
            }]

        var gridConfig = {
            allowColumnReordering: true,
            allowColumnResizing: true,
            export: {
                enabled: false
            },
            searchPanel: {
                visible: false
            },
            columns: columns,
            onInitialized: (e) => {
                this.gridInstance = e.component;
            }
        }
        var table = new DxDataTable(gridConfig, Urls.getStatistics);
        this.gridOptions(table);
    }

    public refreshData(): void {
        this.gridInstance.refresh();
    }
}
/**
 * /@class
 * Контроллер страницы
 */
export class Controller {
    blocks: Array<AnalyticsBlock>;
    constructor() {
        this.blocks = new Array<any>(
            new NewStatistics(),
            new StatisticsView()
        );
        ko.utils.arrayForEach(this.blocks, (block) => {
            block.load();
        });
    }
}