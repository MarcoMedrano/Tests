using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Owin;
using Nancy;
using Nancy.Owin;

namespace MiddleWares.Modules
{
    public class NancyDemoModule : NancyModule
    {
        public NancyDemoModule()
        {
            Get["/nancy"] = x =>
            {
                var env = Context.GetOwinEnvironment();
                OwinContext ctx =  new OwinContext(env);
                return "Hello from Nancy! you requested " + ctx.Request.Path;
            };
        }
    }
}
