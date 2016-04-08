using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelloWorld
{
    using Akka.Actor;

    class Program
    {
        static void Main(string[] args)
        {
            var actorSystem = ActorSystem.Create("HelloWorlActorSystem");
            var helloActor = Props.Create<HelloWorldActor>();

            var actorRef = actorSystem.ActorOf(helloActor, nameof(HelloWorldActor));
            actorRef.Tell("Greet");
            actorRef.Tell("!@#$");

            Console.ReadKey();
            actorSystem.Shutdown();
        }
    }
}
