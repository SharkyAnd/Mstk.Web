using System;
using System.Collections.Generic;
using System.IdentityModel.Services;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Mintrans.Mstk.Web
{
    /// <summary>
    ///     <c>HttpModule</c> to support CORS.
    /// </summary>
    public class CorsOptionsModule : IHttpModule
    {
        #region IHttpModule Members
        public void Dispose()
        {
            //clean-up code here.
        }

        public void Init(HttpApplication context)
        {
            context.BeginRequest += HandleRequest;
            context.EndRequest += HandleEndRequest;

            FederatedAuthentication.WSFederationAuthenticationModule.AuthorizationFailed += (s, ev) =>
            {
                if (HttpContext.Current.Request.RequestContext.HttpContext.Request.IsAjaxRequest())
                {
                    ev.RedirectToIdentityProvider = false;
                }
            };
        }

        private void HandleEndRequest(object sender, EventArgs e)
        {
            string origin = HttpContext.Current.Request.Headers["Origin"];

            if (string.IsNullOrEmpty(origin))
            {
                return;
            }

            if (HttpContext.Current.Request.HttpMethod == "POST" && HttpContext.Current.Request.Url.OriginalString.IndexOf(".svc") < 0)
            {
                HttpContext.Current.Response.AddHeader("Access-Control-Allow-Origin", origin);
            }
        }

        private void HandleRequest(object sender, EventArgs e)
        {

            if (HttpContext.Current.Request.HttpMethod == "OPTIONS")
            {
                HttpContext.Current.Response.End();
            }
        }

        #endregion
    }
}