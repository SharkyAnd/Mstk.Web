using System.Web.Mvc;
using System.Web.Routing;

namespace Mintrans.Mstk.Web
{
    public static class UrlHelperExtensions
    {
        public static string ApplicationRoot(this UrlHelper helper)
        {
            return helper.Content("~/");
        }

        public static string Image(this UrlHelper helper, string imageName)
        {
            return helper.Content("~/Images/" + imageName);
        }

        public static string Script(this UrlHelper helper, string scriptRelativePath)
        {
            return helper.Content("~/scripts/" + scriptRelativePath);
        }

        public static string Css(this UrlHelper helper, string cssRelativePath)
        {
            return helper.Content("~/content/" + cssRelativePath);
        }

        public static string RequestUrl(this UrlHelper helper, RequestContext context)
        {
            if (context != null)
                return context.HttpContext.Request.Url.ToString();

            return null;
        }
    }
}