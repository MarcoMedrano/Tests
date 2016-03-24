using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using MiddleWares.Middlewares;
using Nancy;
using Nancy.Owin;
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

            //inspects the assmbly for all class inheriting from NanacyModule
            //app.UseNancy();
            //app.Map("/nancy", mappedApp => mappedApp.UseNancy());
            app.UseNancy(config => config.PassThroughWhenStatusCodesAre(HttpStatusCode.NotFound));

            app.Use(async (ctx, next) =>
            {
                await ctx.Response.WriteAsync("<html><head></head><body>Hello from Base</body></html>");
            });
        }
    }
}