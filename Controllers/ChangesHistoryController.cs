using Mintrans.Mstk.Data;
using Mintrans.Mstk.Data.Models;
using Mintrans.Mstk.Web.Business;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Mintrans.Mstk.Web.Controllers
{
    public class ChangesHistoryController : MstkControllerBase
    {
        private readonly ActionLogApi _actionLogApi;
        private readonly ExportApi _exportApi;
        private readonly IUserService _userService;
        public ChangesHistoryController(ActionLogApi api, ExportApi exportApi, UserService userService)
        {
            _actionLogApi = api;
            _exportApi = exportApi;
            _userService = userService;
            RegisterForDispose(_actionLogApi);
            RegisterForDispose(_exportApi);
            RegisterForDispose(_userService);
        }

        public ActionResult ActionLog()
        {
            return View(SecurityContext);
        }

        public ActionResult AutomationLog()
        {
            return View(SecurityContext);
        }

        public ActionResult PortfolioLog()
        {
            return View(SecurityContext);
        }

        public ActionResult ListActionLogs(ListRequest request)
        {
            var data = _actionLogApi.GetLogs(request);
            foreach (var item in data.Data)
            {
                item.ObjectLink = GetRootUrl(Request) + item.ObjectLink;
            }
            return ExecuteGetAction(() => data);
        }
        public ActionResult ExportLogsToExcel(List<DxColumnDefinition> columns, ListRequest request)
        {
            RootUrl = Request.Url.GetLeftPart(UriPartial.Authority) + Url.Content("~/");
            var data = _actionLogApi.GetLogs(request);
            foreach (var item in data.Data)
            {
                item.ObjectLink = GetRootUrl(Request) + item.ObjectLink;
            }

            var fileId = _exportApi.ExportListToExcel(data.Data, columns, "Действия пользователей");

            return ExecuteGetAction(() => fileId);
        }
        public ActionResult GetAutomationLogs(ListRequest request)
        {
            RootUrl = Request.Url.GetLeftPart(UriPartial.Authority) + Url.Content("~/");
            var data = _actionLogApi.GetAutomationLogs(request);
            foreach (var item in data.Data)
            {
                item.ObjectLink = GetRootUrl(Request) + item.ObjectLink;
            }
            return ExecuteGetAction(() => data);
        }
        public ActionResult ExportAutoLogsToExcel(List<DxColumnDefinition> columns, ListRequest request)
        {
            RootUrl = Request.Url.GetLeftPart(UriPartial.Authority) + Url.Content("~/");
            var data = _actionLogApi.GetAutomationLogs(request);
            foreach (var item in data.Data)
            {
                item.ObjectLink = GetRootUrl(Request) + item.ObjectLink;
            }

            var fileId = _exportApi.ExportListToExcel(data.Data, columns, "Автоматические загрузки");

            return ExecuteGetAction(() => fileId);
        }

        public ActionResult ListPortfolioLogs(ListRequest request)
        {
            RootUrl = Request.Url.GetLeftPart(UriPartial.Authority) + Url.Content("~/");
            var data = _actionLogApi.GetPortfolioLogs(request);
            var users = _userService.GetManagers();
            foreach (var item in data.Data)
            {
                var user = users.Where(u => u.Login == item.Owner).FirstOrDefault();
                //item.ObjectLink = GetRootUrl(Request) + item.ObjectLink;
                item.Owner = user?.Name ?? item.Owner;
                item.OwnerOrgName = user?.Organization;
            }
            return ExecuteGetAction(() => data);
        }

        public ActionResult ExportPortfolioLogs(List<DxColumnDefinition> columns, ListRequest request)
        {
            RootUrl = Request.Url.GetLeftPart(UriPartial.Authority) + Url.Content("~/");
            var data = _actionLogApi.GetPortfolioLogs(request);
            var users = _userService.GetManagers();
            foreach (var item in data.Data)
            {
                //item.ObjectLink = GetRootUrl(Request) + item.ObjectLink;
                item.Owner = users.Where(u => u.Login == item.Owner).FirstOrDefault()?.Name ?? item.Owner;
            }

            var fileId = _exportApi.ExportListToExcel(data.Data, columns, "Мониторинг портфеля Руководителя");

            return ExecuteGetAction(() => fileId);
        }
        public ActionResult GetActionLogColumnHandbook(string fieldName, ListRequest options)
        {
            return ExecuteGetAction(() => _actionLogApi.GetActionLogColumnHandbook(fieldName, options));
        }

        public ActionResult GetAutomationLogColumnHandbook(string fieldName, ListRequest options)
        {
            return ExecuteGetAction(() => _actionLogApi.GetAutomationLogColumnHandbook(fieldName, options));
        }

        public ActionResult GetPortfolioLogColumnHandbooks(string fieldName, ListRequest options)
        {
            return ExecuteGetAction(() => _actionLogApi.GetPortfolioLogColumnHandbook(fieldName, options));
        }
    }
}