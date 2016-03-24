using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.Owin;
using AppFunc = System.Func<
                            System.Collections.Generic.IDictionary<string,  object>, 
                            System.Threading.Tasks.Task>;
namespace MiddleWares.Middlewares
{
    public class DebugMiddleware
    {
        private readonly AppFunc next;
        private readonly DebugMiddleWareOptions options;

        public DebugMiddleware(AppFunc next, DebugMiddleWareOptions options)
        {
            this.next = next;
            this.options = options;

            if (options.OnIncomingRequest == null)
                options.OnIncomingRequest = (ctx) => Debug.WriteLine("Incoming request " + ctx.Request.Path);

            if (options.OnOutgoingRequest == null)
                options.OnOutgoingRequest = (ctx) => Debug.WriteLine("Outgoing request " + ctx.Request.Path);
        }

        public async Task Invoke(IDictionary<string, object> environment)
        {
            var ctx = new OwinContext(environment);

            options.OnIncomingRequest.Invoke(ctx);
            await this.next(environment);
            options.OnOutgoingRequest.Invoke(ctx);
        }
    }
}
