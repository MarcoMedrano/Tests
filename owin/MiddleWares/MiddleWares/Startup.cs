using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using MiddleWares.Middlewares;
using Owin;

namespace MiddleWares
{
    public class Startup
    {
        public static void Configuration(IAppBuilder app)
        {
            app.Use<DebugMiddleware>(new DebugMiddleWareOptions
            {
                OnIncomingRequest = (ctx) =>
                {
                    var watch = new Stopwatch();
                    watch.Start();
                    ctx.Environment["stopwatch"] = watch;
                },

                OnOutgoingRequest = (ctx) =>
                {
                    var watch = (Stopwatch) ctx.Environment["stopwatch"];
                    watch.Stop();
                    Debug.WriteLine("Request took " + watch.ElapsedMilliseconds + " ms");
                }
            });
            app.Use(async (ctx, next) =>
            {
                await ctx.Response.WriteAsync("<html><head></head><body>Hello</body></html>");
            });
        }
    }
}