
using Mintrans.Asutk;
using Mintrans.Asutk.Diagnostics;
using Mintrans.Mstk.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Mintrans.Mstk.Web.Business;

namespace Mintrans.Mstk.Web.Controllers.Api
{
    public class MstkApiControllerBase : ApiController
    {
        readonly List<IDisposable> _disposables = new List<IDisposable>();
        readonly Lazy<ILogger> _log = ServiceLocator.Resolve<Lazy<ILogger>>("MSTK.WEB");

        protected ILogger Log => _log.Value;

        protected ISecurityContext SecurityContext => SecurityManager.CurrentContext;

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                foreach (var d in _disposables)
                {
                    try
                    {
                        d.Dispose();
                    }
                    catch (ObjectDisposedException)
                    {
                    }
                }
                _disposables.Clear();
            }
            base.Dispose(disposing);
        }

        protected override void Initialize(System.Web.Http.Controllers.HttpControllerContext controllerContext)
        {
            base.Initialize(controllerContext);

            var c = Request.Headers.GetCookies(MstkControllerBase.EffectiveRoleCookieName).FirstOrDefault();
            if (c != null)
            {
                var effectiveRole = c[MstkControllerBase.EffectiveRoleCookieName].Value;
                SecurityContext.SelectRole(effectiveRole);
            }
        }

        protected void RegisterForDispose(IDisposable disposable)
        {
            if (disposable == null) throw new ArgumentNullException(nameof(disposable));
            _disposables.Add(disposable);
        }

        protected IHttpActionResult ExecuteAction(Func<object> action)
        {
            OperationResult result;
            try
            {
                var data = action();
                result = new OperationResult(data);
            }
            catch (ApplicationException ex)
            {
                Log.Warn(ex);
                result = new OperationResult(HttpStatusCode.BadRequest, ex.Message);
            }
            catch (NotImplementedException ex)
            {
                Log.Warn(ex);
                result = new OperationResult(HttpStatusCode.NotImplemented, "Запрошенная функциональность пока не реализована.");
            }
            catch (NotSupportedException ex)
            {
                Log.Warn(ex);
                result = new OperationResult(HttpStatusCode.NotImplemented, "Запрошенная функциональность не поддерживается.");
            }
            catch (Exception ex)
            {
                Log.Error(ex);
                result = new OperationResult(HttpStatusCode.InternalServerError, Resources.UnexpectedErrorInAction);
            }
            return Ok(result);
        }

        protected IHttpActionResult ExecuteAction(Action action)
        {
            return ExecuteAction(() =>
            {
                action();
                return true;
            });
        }
        public string GetRootUrl(HttpRequestMessage request)
        {
            return request.GetRequestContext().VirtualPathRoot;
        }
        //protected void RequireAdminAccess()
        //{
        //    if (!SecurityContext.IsAdmin)
        //        throw new AppSecurityException("Недостаточно прав для выполнения запрошенного действия.");
        //}
    }

    public abstract class MstkApiControllerBase<TApiService> : MstkApiControllerBase where TApiService : BusinessServiceApi
    {
        protected TApiService Service { get; }

        protected MstkApiControllerBase(TApiService service)
        {
            Service = service;
            RegisterForDispose(Service);
        }
    }
}
