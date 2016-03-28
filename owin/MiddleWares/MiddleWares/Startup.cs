using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Http;
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

            var httpConf = new HttpConfiguration();
            httpConf.MapHttpAttributeRoutes();
            app.UseWebApi(httpConf);

            //inspects the assembly for all class inheriting from NanacyModule
            //app.UseNancy();
            //app.Map("/nancy", mappedApp => mappedApp.UseNancy());
            app.UseNancy(config => config.PassThroughWhenStatusCodesAre(HttpStatusCode.NotFound));

            //Need to comment this to pass to MVC
            //app.Use(async (ctx, next) =>
            //{
            //    await ctx.Response.WriteAsync("<html><head></head><body>Hello from Base</body></html>");
            //});
        }
    }
}