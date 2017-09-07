using CalculatorLibrary;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TechTalk.SpecFlow;

namespace FirstSpecFlow.StepDefinitions
{
    [Binding]
    public sealed class StepDefinition1
    {
        private Calculator calculator = new Calculator();

        [Given(@"I have entered (.*) into the calculator")]
        public void GivenIHaveEnteredIntoTheCalculator(int p0)
        {
            calculator.AddOperand(p0);
        }

        [When(@"I press add")]
        public void WhenIPressAdd()
        {
            calculator.SetOperator("Add");
        }

        [When(@"I press multiply")]
        public void WhenIPressMultiply()
        {
            ScenarioContext.Current.Pending();
        }


        [Then(@"the result should be (.*) on the screen")]
        public void ThenTheResultShouldBeOnTheScreen(int p0)
        {
            int res = calculator.Calculate();


            Assert.AreEqual(p0, res);
        }

    }
}
