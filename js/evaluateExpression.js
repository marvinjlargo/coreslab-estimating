/**
 * Expression Evaluator Module
 * 
 * This module provides functionality to safely evaluate arithmetic expressions
 * entered by users in the calculator inputs.
 * 
 * @author Marvin J. Largo
 */

/**
 * Evaluates a string containing an arithmetic expression.
 * Supports basic operations: addition (+), subtraction (-), multiplication (*), and division (/).
 * 
 * @param {string} input - The arithmetic expression to evaluate
 * @returns {number} The result of the evaluation, or NaN if the expression is invalid
 * 
 * @example
 * evaluateExpression("24+6")  // returns 30
 * evaluateExpression("100*1.2")  // returns 120
 * evaluateExpression("invalid")  // returns NaN
 */
export function evaluateExpression(input) {
  if (typeof input !== 'string') return NaN;
  const expr = input.trim();
  if (!expr) return NaN;
  
  // Remove any whitespace
  const cleanExpr = expr.replace(/\s+/g, '');
  
  // Validate the expression
  if (!/^[0-9+\-*/().]*$/.test(cleanExpr)) return NaN;
  
  try {
    // Split the expression into numbers and operators
    const tokens = cleanExpr.match(/(\d+\.?\d*)|([+\-*/()])/g);
    if (!tokens) return NaN;
    
    // Convert to numbers where possible
    const parsedTokens = tokens.map(token => {
      const num = parseFloat(token);
      return isNaN(num) ? token : num;
    });
    
    // Simple evaluation for basic arithmetic
    let result = parsedTokens[0];
    for (let i = 1; i < parsedTokens.length; i += 2) {
      const operator = parsedTokens[i];
      const operand = parsedTokens[i + 1];
      
      if (typeof operand !== 'number') return NaN;
      
      switch (operator) {
        case '+': result += operand; break;
        case '-': result -= operand; break;
        case '*': result *= operand; break;
        case '/': result /= operand; break;
        default: return NaN;
      }
    }
    
    return Number.isFinite(result) ? result : NaN;
  } catch {
    return NaN;
  }
}
