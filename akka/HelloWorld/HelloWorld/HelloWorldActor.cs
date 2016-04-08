using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HelloWorld
{
    using Akka.Actor;
    class HelloWorldActor : UntypedActor
    {
        protected override void OnReceive(object message)
        {
            switch (message.ToString())
            {
                case "Greet":
                    Console.WriteLine("Hello World");
                    break;
                default:
                    Console.WriteLine($"This actor {nameof(HelloWorldActor)} cant handle this message " + message);
                    this.Unhandled(message);
                    break;
            }
        }
    }
}
