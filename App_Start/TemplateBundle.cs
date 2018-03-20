using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace Mintrans.Mstk.Web
{
    public class TemplateBundle : Bundle
    {
        public class TemplatesBundleTransform : IBundleTransform
        {
            public void Process(BundleContext context, BundleResponse response)
            {
                var strBundleResponse = new StringBuilder();

                var appPath = (context.HttpContext.Request.ApplicationPath ?? "").TrimEnd('/');

                foreach (var file in response.Files)
                {
                    var viewPath = file.IncludedVirtualPath.Replace("\\", "/");
                    var templateName = file.IncludedVirtualPath.Replace("\\", "/").Replace("~/Views/Templates/", $"{appPath}/templates/").Replace(".cshtml", "");

                    strBundleResponse.AppendLine($"define('lib/text!{templateName}', function(){{");

                    var content = GetRazorViewAsString(null, viewPath);
                    content = content
                        .Trim(' ', '\r', '\n')
                        .Replace("'", "\\'")
                        .Replace("\n", "")
                        .Replace("\r", "");

                    content = Regex.Replace(content, "\\s+", " ");

                    strBundleResponse.AppendLine($"return '{content}';");
                    strBundleResponse.AppendLine("});");
                }

                response.Files = new BundleFile[] { };
                response.Content = strBundleResponse.ToString();
                response.ContentType = "text/javascript";
            }

            string GetRazorViewAsString(object model, string filePath)
            {
                using (var st = new StringWriter())
                {
                    var context = new HttpContextWrapper(HttpContext.Current);
                    var routeData = new RouteData();
                    var controllerContext = new ControllerContext(new RequestContext(context, routeData), new FakeController());
                    var razor = new RazorView(controllerContext, filePath, null, false, null);
                    razor.Render(new ViewContext(controllerContext, razor, new ViewDataDictionary(model), new TempDataDictionary(), st), st);
                    return st.ToString();
                }
            }

            public class FakeController : Controller
            {
            }
        }

        public TemplateBundle(string virtualPath)
            : base(virtualPath, new TemplatesBundleTransform())
        {
        }
    }
}