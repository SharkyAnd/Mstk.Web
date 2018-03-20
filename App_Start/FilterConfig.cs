using System.Web.Mvc;
using Mintrans.Asutk;
using Mintrans.Asutk.Diagnostics;

namespace Mintrans.Mstk.Web
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new MstkHandleErrorAttribute(ServiceLocator.Resolve<ILogger>()));
        }
    }
}