using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TechTalk.SpecFlow;

namespace CalculatorTests.stepDefinitions
{
    [Binding]
    public sealed class Addition
    {
        // For additional details on SpecFlow step definitions see http://go.specflow.org/doc-stepdef
        private UIMap calculator = new UIMap();

        [Given(@"I have opened the calculator")]
        public void GivenIHaveOpenedTheCalculator()
        {
            this.calculator.OpenCalculator();
        }

        [Given("I have entered (.*) into the calculator")]
        public void GivenIHaveEnteredSomethingIntoTheCalculator(int number)
        {
            switch (number)
            {
                case 1:
                    this.calculator.Press1();
                    break;
                case 2:
                    this.calculator.Press2();
                    break;
                case 3:
                    this.calculator.Press3();
                    break;
                case 4:
                    this.calculator.Press4();
                    break;
                case 5:
                    this.calculator.Press5();
                    break;
                default:
                    break;
            }
        }

        [Given(@"I press add")]
        public void GivenIPressAdd()
        {
            this.calculator.PressAdd();
        }

        [When(@"I press equals")]
        public void WhenIPressEquals()
        {
            this.calculator.PressEquals();
        }


        [Then("the result should be (.*) on the screen")]
        public void ThenTheResultShouldBe(int result)
        {
            Assert.AreEqual(result.ToString(), this.calculator.UICalculatorWindow.UIItem0Window.UIItem0Text.DisplayText);
        }
    }
}
