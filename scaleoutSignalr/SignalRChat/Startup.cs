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
            GlobalHost.DependencyResolver.UseRedis("redisServer", 6379, "password", "ChatApp");
            app.MapSignalR();
        }
    }
}