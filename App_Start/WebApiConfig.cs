using System.Globalization;
using Mintrans.Asutk.UnityContainer;
using System.Web.Http;

#pragma warning disable 1591

namespace Mintrans.Mstk.Web
{
    public static class WebApiConfig {
        public static void Register(HttpConfiguration config)
        {
            var container = UnityActivator.GetDefaultContainer();
            config.DependencyResolver = new UnityResolver(container);

            var jsonSettings = config.Formatters.JsonFormatter.SerializerSettings;
            jsonSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
            jsonSettings.Culture = CultureInfo.InvariantCulture;
            jsonSettings.Formatting = Newtonsoft.Json.Formatting.Indented;

            config.MapHttpAttributeRoutes();

            // Все роуты для API задаются атрибутами. Роутинг по шаблону используется только для MVC контроллеров.
            //
            //config.Routes.MapHttpRoute(
            //    name: "DefaultApi",
            //    routeTemplate: "api/{controller}/{id}",
            //    defaults: new { id = RouteParameter.Optional }
            //);
        }
    }
}