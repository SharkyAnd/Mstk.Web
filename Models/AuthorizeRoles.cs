using System;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Mintrans.Asutk;


namespace Mintrans.Mstk.Web.Models
{
    public class AuthorizeRoles : AuthorizeAttribute
    {
		readonly Lazy<ISecurityContext> _securityContext = ServiceLocator.Resolve<Lazy<ISecurityContext>>();

		public AuthorizeRoles(params string[] roleKeys)
        {
            var roles = roleKeys.Select(roleKey => ConfigurationManager.AppSettings[roleKey]).ToList();
            Roles = string.Join(",", roles);
        }

		//return true if the user is authorized; otherwise, false.
		protected override bool AuthorizeCore(HttpContextBase httpContext)
		{
			return Roles.Split(',').Intersect(_securityContext.Value.AllRoles.Select(s => s.Trim())).Any();
		}
    }

    public class Role
    {
        public const string Operator = "OperatorRole";
        public const string Analyst = "AnalystRole";
        public const string Manager = "ManagerRole";
	    public const string Admin = "AdminRole";
    }
}