using System.Web.Optimization;

namespace Mintrans.Mstk.Web
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            //BundleTable.EnableOptimizations = true;

            bundles.Add(new StyleBundle("~/bundles/css").Include(
                "~/Content/bootstrap.css",
                "~/Content/bootstrap-datepicker3.css",
                "~/Content/font-awesome.css",
                "~/Content/font-mstk.css",
                "~/Content/font-mstk2.css",
                "~/Content/select2.css",
                "~/Content/select2-bootstrap.css",
                "~/Content/jquery-ui.css",
                "~/Content/jquery.ui.labeledslider.css",
                "~/Content/toastr.css",
                "~/Content/summernote.css",
                "~/Content/site.common.css",
                "~/Content/slick.grid.css",
                "~/Content/slick.headermenu.css",
                "~/Content/slick-default-theme.css",
                "~/Content/slick.asutk.css",
                "~/Content/daterangepicker.css",
                "~/Content/bootstrap-combobox.css",
                "~/Content/switch.css",
                "~/Content/" + GlobalSettings.Stylesheet
            ));

            // Базовые библиотеки, которые должны грузиться в первую очередь
            bundles.Add(new ScriptBundle("~/bundles/core-libs").Include(
                "~/scripts/class.js",
                "~/scripts/jquery-{version}.js",
                "~/scripts/knockout-{version}.js",
                "~/scripts/moment-with-locales.min.js",
                "~/scripts/bootstrap.js"
                , "~/scripts/jquery-migrate-3.0.0.min.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/libs").Include(
                "~/scripts/deparam.js",
                "~/scripts/underscore.js",
                "~/scripts/jquery.history.js",
                "~/scripts/js.cookie.js",
                "~/scripts/linq.js",
                "~/scripts/signals.js",
                "~/scripts/knockout.dirtyFlag.js",
                "~/scripts/knockout.command.js",
                "~/scripts/knockout.activity.js",
                "~/scripts/knockout.amdtemplateengine.js",
                "~/scripts/knockout.mapping-latest.js",
                "~/scripts/knockout.validation.js",
                "~/scripts/knockout.validation.asutk.js",
                "~/scripts/knockout.extensions.js",
                "~/scripts/knockout.imageFile.js",
                "~/scripts/knockout.bootstrap-datepicker.js",
                "~/scripts/knockout-select2.js",
                "~/scripts/knockout-highcharts.js",
                "~/scripts/knockout-jqueryui.js",
                "~/scripts/knockout.mapping-latest.js",
                "~/scripts/knockout.popover.js",
                "~/scripts/jquery.slickgrid.export.excel.js",
                "~/scripts/jszip.js",
                "~/scripts/swfobject.js",
                "~/scripts/daterangepicker.js",
                "~/scripts/knockout.daterangepicker.js",
                "~/scripts/sha.js",
                // Flexmonster
                "~/scripts/knockout.flexmonster.js",
                "~/scripts/flexmonster/lib/canvg.min.js",
                "~/scripts/flexmonster/lib/file.min.js",
                "~/scripts/flexmonster/lib/html2canvas.min.js",
                "~/scripts/flexmonster/lib/jszip.min.js",
                "~/scripts/flexmonster/lib/promise.min.js",
                "~/scripts/flexmonster/lib/sha1.min.js",
                "~/scripts/flexmonster/lib/zlib.min.js",
                "~/scripts/flexmonster/lib/d3.min.js", // Большая
                //"~/scripts/flexmonster/lib/flexmonster.fusioncharts.js", // Не используется
                //"~/scripts/flexmonster/lib/flexmonster.googlecharts.js", // Не используется
                "~/scripts/flexmonster/lib/flexmonster.highcharts.js", // Не используется
                //"~/scripts/flexmonster/lib/jquery.min.js", // Уже есть
                "~/scripts/flexmonster/lib/jspdf.min.js", // Большая
                "~/scripts/flexmonster/flexmonster.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/ui").Include(
                "~/scripts/respond.js",
                "~/scripts/bootstrap-datepicker.js",
                "~/scripts/locales/bootstrap-datepicker.ru.min.js",
                "~/scripts/select2.js",
                "~/Scripts/knockout.binding.*",
                "~/scripts/select2-locales/select2_locale_ru.js",
                "~/scripts/toastr.js",
                "~/scripts/jquery-ui-1.10.3.js",
                "~/scripts/jquery.ui.labeledslider.mod.js",
                "~/scripts/summernote/summernote.js",
                "~/scripts/bootstrap-combobox.js",
                "~/scripts/summernote/lang/summernote-ru-RU.js",
                "~/scripts/summernote/plugin/cleaner/summernote-cleaner.js"
            ));

            /*
            bundles.Add(new ScriptBundle("~/bundles/highcharts").Include(
                "~/scripts/HighCharts/4.2.7/highcharts.src.js",
                // [VDemin] используется код из предыдущей версии, потому что в 4.2.7 какая-то несовместимость с текущим кодом
                // TODO: d.bykadorov - после фикса canvas-tools проблем не замечено. удалить эти комментарии после сдачи этапа
                //"~/scripts/HighCharts/4.1.10/modules/canvas-tools.js",
                "~/scripts/HighCharts/4.2.7/modules/canvas-tools.src.js",
                "~/scripts/HighCharts/4.2.7/modules/exporting.src.js",
                "~/scripts/HighCharts/4.2.7/modules/no-data-to-display.src.js",
                "~/scripts/HighCharts/4.2.7/modules/map.src.js",
                "~/scripts/HighCharts/ru-all-disputed.js",
                "~/scripts/HighCharts/highcharts-export-clientside.js"
            ));*/

            // TODO: d.bykadorov - HighCharts встал нормально, за исключением пайчартов. Разобраться, внедрить.
            bundles.Add(new ScriptBundle("~/bundles/highcharts").Include(
                "~/scripts/HighCharts/6.0.3/highcharts.src.js",
                "~/scripts/HighCharts/6.0.3/modules/exporting.src.js",
                "~/scripts/HighCharts/6.0.3/modules/no-data-to-display.src.js",
                "~/scripts/HighCharts/6.0.3/modules/map.src.js",
                "~/scripts/HighCharts/6.0.3/highcharts-more.src.js",
                "~/scripts/HighCharts/ru-all-disputed.js",
                "~/scripts/HighCharts/highcharts-export-clientside.js"
            ));

            var slickGrid = new ScriptBundle("~/bundles/slickgrid").Include(
                "~/scripts/jquery.event.drag.js", // d.bykadorov не развивается с 2012 года, требует jquery 1.7 но нужен для slickgrid, который тоже неплохо было ьы выпилить
                "~/scripts/SlickGrid/slick.core.js",
                "~/scripts/SlickGrid/slick.formatters.js",
                "~/scripts/SlickGrid/slick.editors.js",
                "~/scripts/SlickGrid/slick.dataview.js",
                "~/scripts/SlickGrid/slick.grid.js",
                "~/scripts/SlickGrid/Plugins/slick.rowselectionmodel.js",
                "~/scripts/SlickGrid/Plugins/slick.cellselectionmodel.js",
                "~/scripts/SlickGrid/Plugins/slick.tooltips.js",
                "~/scripts/SlickGrid/Plugins/slick.cellrangedecorator.js",
                "~/scripts/SlickGrid/Plugins/slick.cellrangeselector.js",
                "~/scripts/SlickGrid/Plugins/slick.headerbuttons.js",
                "~/scripts/SlickGrid/Plugins/slick.headermenu.js",
                "~/scripts/SlickGrid/Plugins/slick.rowmovemanager.js",
                "~/scripts/SlickGrid/Plugins/slick.cellcopymanager.js",
                "~/scripts/knockout.slickgrid.js"
            );

            // a.akulin - Задача 6713. Если эти файлы минифицировать, перестает работать часть функционала таблиц.
            // TODO: разобраться в чем дело
            slickGrid.Transforms.Clear();
            bundles.Add(slickGrid);

            bundles.Add(new ScriptBundle("~/bundles/excel-builder").Include(
                "~/scripts/excel-builder.js"
            ));

            bundles.Add(new TemplateBundle("~/bundles/templates").IncludeDirectory(
                "~/Views/Templates", "*.cshtml", true
            ));

            bundles.Add(new ScriptBundle("~/bundles/dxlocalization")
                .Include(
                    "~/Scripts/cldr.js",
                    "~/Scripts/cldr/event.js",
                    "~/Scripts/cldr/supplemental.js",
                    "~/Scripts/globalize.js",
                    "~/Scripts/globalize/message.js",
                    "~/Scripts/globalize/number.js",
                    "~/Scripts/globalize/currency.js",
                    "~/Scripts/globalize/date.js"
                )
            );

            bundles.Add(new ScriptBundle("~/bundles/dxjs").Include(
                "~/Scripts/dx.web.js", 
                "~/Scripts/devextreme-localization/dx.messages.ru.js"
            ));

            bundles.Add(new ScriptBundle("~/bundles/app").IncludeDirectory(
                "~/Scripts/app", "*.js", true
            ));
        }
    }
}
