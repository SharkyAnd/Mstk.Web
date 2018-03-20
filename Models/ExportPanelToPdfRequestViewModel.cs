using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Mintrans.Mstk.Web.Models
{
    public class ExportPanelToPdfRequestViewModel
    {
        /// <summary>
        /// Заголовок панели
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Описание панели
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Виджеты на панели
        /// </summary>
        public List<ExportToPdfRequestViewModel> Widgets { get; set; }

        /// <summary>
        /// Файл стилей для виджетов панели
        /// </summary>
        public string PanelWidgetsStyle { get; set; }
    }

    public class ExportToPdfRequestViewModel
    {
        public string Title { get; set; }
        public string PeriodTitle { get; set; }
        public string UnitNameTitle { get; set; }
        public List<int> MemberIds { get; set; }
        public List<int> DimMemberIds { get; set; }
        public List<int> ComparingDimMemberIds { get; set; }
        public int DimensionId { get; set; }
        public int PeriodId { get; set; }
        public string Svg { get; set; }
        [AllowHtml]
        public string Html { get; set; }
        public int? ChartWidth { get; set; }
        public int? ChartHeight { get; set; }
        public string Css { get; set; }
        public WidgetType WidgetType { get; set; }
        public WidgetTableDataModel Data { get; set; }
        public string Type { get; set; }
    }

    public static class RequestExtensions
    {
        public static ExportWidgetToPdfRequest ToDto(this ExportToPdfRequestViewModel model)
        {
            return new ExportWidgetToPdfRequest
            {
                ChartHeight = model.ChartHeight,
                ChartWidth = model.ChartWidth,
                ComparingDimMemberIds = model.ComparingDimMemberIds,
                Css = model.Css,
                Data = model.Data,
                DimensionId = model.DimensionId,
                DimMemberIds = model.DimMemberIds,
                Html = model.Html,
                MemberIds = model.MemberIds,
                PeriodId = model.PeriodId,
                PeriodTitle = model.PeriodTitle,
                Svg = model.Svg,
                Title = model.Title,
                UnitNameTitle = model.UnitNameTitle,
                WidgetType = model.WidgetType,
                Type = model.Type
            };
        }

        public static ExportPanelToPdfRequest ToDto(this ExportPanelToPdfRequestViewModel model)
        {
            return new ExportPanelToPdfRequest
            {
                Description = model.Description,
                PanelWidgetsStyle = model.PanelWidgetsStyle,
                Title = model.Title,
                Widgets = model.Widgets.Select(w => w.ToDto()).ToList()
            };
        }
    }
}