using Mintrans.Mstk.Web.Business;
using Mintrans.Mstk.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Mintrans.Mstk.Web.Controllers.Api
{
    /// <summary>
    /// Аналитика
    /// </summary>
    [RoutePrefix("analytics")]
    public class AnalyticsApiController : MstkApiControllerBase<AnalyticsApi>
    {
        public AnalyticsApiController(AnalyticsApi service) : base(service)
        {
        }

        /// <summary>
        /// Возвращает список отчетов для вкладки Аналитика
        /// </summary>
        /// <returns>Список отчетов</returns>
        [HttpGet, Route("reportTypes")]
        public IHttpActionResult GetReportTypes()
        {
            return ExecuteAction(() => Service.GetReportTypes());
        }

        /// <summary>
        /// Возвращает файл с отфильтрованными показателями
        /// </summary>
        /// <param name="request">Модель запроса</param>
        /// <returns>Идентификатор файла</returns>
        [HttpPost, Route("report")]
        public IHttpActionResult CreateReport(FilteredMembersRequest request)
        {
            return ExecuteAction(() => Service.CreateReport(request));
        }

        /// <summary>
        /// Возвращает список сформированных отчетов
        /// </summary>
        /// <returns>Список отчетов</returns>
        [HttpPost, Route("statistics")]
        public IHttpActionResult GetStatistics()
        {
            return ExecuteAction(() => Service.GetStatistics());
        }
    }
}
