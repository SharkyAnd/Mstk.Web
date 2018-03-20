
using Mintrans.Asutk;
using Mintrans.Asutk.Diagnostics;

namespace Mintrans.Mstk.Web
{
    public class MstkHandleErrorAttribute : System.Web.Mvc.HandleErrorAttribute
    {
        readonly ILogger _log;

        public MstkHandleErrorAttribute(ILogger log)
        {
            _log = log;
        }

        public override void OnException(System.Web.Mvc.ExceptionContext filterContext)
        {
            var wasHandled = filterContext.ExceptionHandled;

            base.OnException(filterContext);

            if (filterContext.Exception is AppSecurityException)
            {
                var ex = filterContext.Exception;
                var log = _log;
                log.Error("{0} \"{1}\", {2}: {3}",
                                  filterContext.HttpContext.Request.HttpMethod,
                                  filterContext.HttpContext.Request.RawUrl,
                                  ex.GetType().FullName,
                                  ex.Message);
                View = "401ErrorPage";
            }

            if (filterContext.ExceptionHandled && !wasHandled)
            {
                var ex = filterContext.Exception;
                var shouldLog = true;
                var shouldLogStack = true;
                var log = _log;
                if (ex is AbortException)
                {
                    shouldLog = false;
                }
                else if (ex is BusinessException)
                {
                    shouldLogStack = false;
                }
                View = "Error";
                if (shouldLog)
                {
                    if (shouldLogStack)
                    {
                        log.Error(ex, "{0} \"{1}\"",
                                  filterContext.HttpContext.Request.HttpMethod,
                                  filterContext.HttpContext.Request.RawUrl);
                    }
                    else
                    {
                        log.Error("{0} \"{1}\", {2}: {3}",
                                  filterContext.HttpContext.Request.HttpMethod,
                                  filterContext.HttpContext.Request.RawUrl,
                                  ex.GetType().FullName,
                                  ex.Message);
                    }
                }
            }
        }


    }
}