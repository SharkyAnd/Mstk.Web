using System;
using System.IdentityModel.Services;
using System.IdentityModel.Tokens;
using System.Security.Claims;
using System.Web;
using System.Web.Helpers;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

using Mintrans.Asutk;
using Mintrans.Asutk.Diagnostics;


namespace Mintrans.Mstk.Web
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : HttpApplication
    {
        readonly ILogger _log = ServiceLocator.Resolve<ILogger>();

        protected void Application_Start()
        {
            _log.Info("Application starting");

            //http://blogs.msdn.com/b/distributedservices/archive/2013/10/01/claims-aware-mvc4-app-using-wif-identity-and-access-tool-in-net-4-5.aspx
            //п.18
            AntiForgeryConfig.UniqueClaimTypeIdentifier = ClaimTypes.NameIdentifier;

            AreaRegistration.RegisterAllAreas();

            ViewEngines.Engines.Clear();
            ViewEngines.Engines.Add(new RazorViewEngine());

            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            FederatedAuthentication.SessionAuthenticationModule.SessionSecurityTokenReceived +=
                SessionAuthenticationModule_SessionSecurityTokenReceived;
        }

        void SessionAuthenticationModule_SessionSecurityTokenReceived(object sender, SessionSecurityTokenReceivedEventArgs e)
        {
            var now = DateTime.UtcNow;
            SessionSecurityToken token = e.SessionToken;
            var httpContext = new HttpContextWrapper(this.Context);

            if (now > token.ValidTo
                && (httpContext.Request.IsAjaxRequest() || httpContext.Request.HttpMethod == "POST"))
            {
                var sessionAuthModule = (SessionAuthenticationModule)sender;
                e.SessionToken = sessionAuthModule.CreateSessionSecurityToken(token.ClaimsPrincipal,
                                                                              token.Context,
                                                                              now,
                                                                              now.AddMinutes(2),
                                                                              token.IsPersistent);
                e.ReissueCookie = true;
            }
        }

        protected void Application_Error(object sender, EventArgs e)
        {
            //Exception exc = Server.GetLastError();
            //_log.Error("Error: " + exc);
            //Response.ClearContent();
            ////Response.Redirect("MainErrorPage.html");
            //Response.Write("<div style='padding: 40px 120px;'><h1 class='primary text-danger'>Ошибка</h1><h4>Произошла ошибка. Подробная информация записана в файл журнала.</h4></div>");
            //Server.ClearError();
        }

        protected void Application_BeginRequest(Object sender, EventArgs e)
        {
            var context = HttpContext.Current;
            context.Items["AjaxRequest"] = context.Request.Headers["X-Requested-With"] == "XMLHttpRequest";
        }

        protected void Application_EndRequest(Object sender, EventArgs e)
        {
            var context = HttpContext.Current;

            if (context.Response.Status.Substring(0, 3).Equals("401") 
                && context.Request.RequestContext.HttpContext.Request.IsAjaxRequest() == false)
            {
                var dataAction = (bool?)context.Items["DataAction"] ?? false;
                if (!dataAction)
                {
                    var sc = SecurityManager.CurrentContext;
                    var req = context.Request;

                    var uri = new UriBuilder(req.Url)
                    {
                        Path = String.Format("{0}/AccessDenied", (req.ApplicationPath ?? String.Empty).TrimEnd('/'))
                    };
                    var errorUrl = uri.ToString();
                    context.Response.ClearContent();
                    context.Response.Redirect(errorUrl, true);
                }
            }

        }

    }
}