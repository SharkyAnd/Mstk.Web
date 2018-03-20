using System;
using System.Net;

namespace Mintrans.Mstk.Web.Models
{
    public class OperationResult
    {
        public int StatusCode { get; set; }
        public bool Success
        {
            get { return StatusCode == (int)HttpStatusCode.OK; }
        }
        public string StatusText { get; set; }

        public object Content { get; set; }

        public OperationResult(int statusCode, string statusText)
        {
            StatusCode = statusCode;
            StatusText = statusText;
        }

        public OperationResult(HttpStatusCode statusCode, string statusText)
            : this((int)statusCode, statusText)
        {
        }

        public OperationResult()
            : this(HttpStatusCode.OK, String.Empty)
        {
        }

        public OperationResult(object content)
            : this()
        {
            this.Content = content;
        }
    }
}