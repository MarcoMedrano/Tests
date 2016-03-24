using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Owin;

namespace MiddleWares.Middlewares
{
    public class DebugMiddleWareOptions
    {
        public Action<IOwinContext> OnIncomingRequest { get; set; }

        public Action<IOwinContext> OnOutgoingRequest { get; set; }
    }
}
