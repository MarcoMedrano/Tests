using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using Owin;

/// <summary>
/// Summary description for Startup
/// </summary>
public class Startup
{
    public static void Configuration(IAppBuilder app)
    {
        app.Use(async (ctx, next) =>
        {
            Debug.WriteLine("Incoming request " + ctx.Request.Path);
            await next();// calls the next middleware which actually writes hello world
            Debug.WriteLine("Outgoing request " + ctx.Response.Body);
        });
        app.Use(async (ctx, next) => await ctx.Response.WriteAsync("<html><head></head><body>Hello world!</body></header>"));
    }
}