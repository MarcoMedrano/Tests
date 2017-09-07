using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CalculatorLibrary
{
    public class Calculator
    {
        public Calculator()
        {
            this.Operands = new List<int>();
        }

        public List<int> Operands { get; set; }

        public Operator CurrentOperator { get; set; }
        public void AddOperand(int operand)
        {
            this.Operands.Add(operand);
        }

        public void SetOperator(string operatorAsString)
        {
            this.CurrentOperator = (Operator)Enum.Parse(typeof(Operator), operatorAsString, true);
        }

        public int Calculate()
        {
            return this.Operands[0] + this.Operands[1];
        }
    }

    public enum Operator
    {
        Add
    }
}
