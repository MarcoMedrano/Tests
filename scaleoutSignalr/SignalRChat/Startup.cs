using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Owin;
[assembly: OwinStartup(typeof(SignalRChat.Startup))]
namespace SignalRChat
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // Any connection or hub wire up and configuration should go here
            //GlobalHost.DependencyResolver.UseRedis("ec2-34-238-42-75.compute-1.amazonaws.com", 6379, "connect77", "ChatApp");
            //GlobalHost.DependencyResolver.UseRedis("sosmarco.astutesolutions.org", 6379, "connect77", "ChatApp");
            GlobalHost.DependencyResolver.UseRedis("epcqasosredis.7scqkw.ng.0001.use1.cache.amazonaws.com", 6379, string.Empty, "ChatApp");
            app.MapSignalR();
        }
    }
}