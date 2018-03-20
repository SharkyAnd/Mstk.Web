using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Description;
using Mintrans.Asutk;
using Mintrans.Mstk.Web.Business;
using Mintrans.Mstk.Web.Models;

namespace Mintrans.Mstk.Web.Controllers.Api
{
    /// <summary>
    /// Управление формулой рассчетного показателя
    /// </summary>
    [RoutePrefix("members/{memberId:int}/formula")]
    public class MemberFormulaController : MstkApiControllerBase<MemberFormulaApi>
    {
        public MemberFormulaController(MemberFormulaApi impl)
            : base(impl)
        {
        }

        [HttpGet, Route("")]
        [ResponseType(typeof(MemberFormulaModel))]
        public IHttpActionResult GetFormula([FromUri]int memberId)
        {
            return ExecuteAction(() => Service.GetFormulaForMember(memberId));
        }

        [HttpPost, Route("save")]
        [ResponseType(typeof(MemberFormulaModel))]
        public IHttpActionResult SpdateFormula(MemberFormulaCalculationModel model)
        {
            return ExecuteAction(() => Service.SaveFormula(model));
        }

        [HttpPost, Route("calculate")]
        [ResponseType(typeof(MemberFormulaModel))]
        public IHttpActionResult CalculateFacts([FromBody] MemberFormulaCalculationModel model)
        {
            return ExecuteAction(() => Service.CalculateMemerWithFormula(model));
        }

        [HttpGet, Route("clear")]
        public IHttpActionResult ClearFacts(int memberId)
        {
            return ExecuteAction(() => Service.ClearAllData(memberId));
        }
    }
}