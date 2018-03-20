using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Mintrans.Asutk;

#pragma warning disable 1591

namespace Mintrans.Mstk.Web.Models
{
    public static class WebModelExtensions
    {
        #region Menu extenders
        public static bool MatchesLocation(this MenuItem item, string location)
        {
            return (item.Url != null && item.Url.EqualsIgnoreCase(location))
                   || (item.Item != null && item.Item.Any(child => child.MatchesLocation(location)));
        }

        public static bool IsEmpty(this Menu menu)
            => menu == null
            || menu.Item.IsEmpty();

        public static bool IsEmpty(this MenuItem[] items)
            => items == null
            || items.All(item => item.IsEmpty());

        public static bool IsEmpty(this MenuItem item)
            => item == null
            || item.Title == "-";
        #endregion

        public static IList<DimMemberValueModel> DecodeDimMembers(string dimMembers)
        {
            var result = new List<DimMemberValueModel>();
            if (!string.IsNullOrWhiteSpace(dimMembers))
            {
                var pairs = from x in dimMembers.Split(';')
                            let p = x.Split('=')
                            where p.Length > 1
                            select p;

                result.AddRange(pairs.Select(p => new DimMemberValueModel()
                {
                    DimensionID = int.Parse(p[0], CultureInfo.InvariantCulture),
                    DimMemberID = int.Parse(p[1], CultureInfo.InvariantCulture)
                }));
            }
            return result;
        }
    }
}