import { useState, useEffect, useCallback, useRef } from 'react';

type ButtonVariant = 'digit' | 'operator' | 'equals' | 'function' | 'zero';

interface CalcButton {
  label: string;
  value: string;
  variant: ButtonVariant;
  colSpan?: number;
}

const BUTTONS: CalcButton[] = [
  { label: 'C', value: 'clear', variant: 'function' },
  { label: '⌫', value: 'backspace', variant: 'function' },
  { label: '%', value: '%', variant: 'function' },
  { label: '÷', value: '/', variant: 'operator' },

  { label: '7', value: '7', variant: 'digit' },
  { label: '8', value: '8', variant: 'digit' },
  { label: '9', value: '9', variant: 'digit' },
  { label: '×', value: '*', variant: 'operator' },

  { label: '4', value: '4', variant: 'digit' },
  { label: '5', value: '5', variant: 'digit' },
  { label: '6', value: '6', variant: 'digit' },
  { label: '−', value: '-', variant: 'operator' },

  { label: '1', value: '1', variant: 'digit' },
  { label: '2', value: '2', variant: 'digit' },
  { label: '3', value: '3', variant: 'digit' },
  { label: '+', value: '+', variant: 'operator' },

  { label: '0', value: '0', variant: 'zero', colSpan: 2 },
  { label: '.', value: '.', variant: 'digit' },
  { label: '=', value: '=', variant: 'equals' },
];

// Local arithmetic — instant, no network round-trip
function localCalculate(x: number, y: number, op: string): { value: number; isError: boolean } {
  switch (op) {
    case '+': return { value: x + y, isError: false };
    case '-': return { value: x - y, isError: false };
    case '*': return { value: x * y, isError: false };
    case '/':
      if (y === 0) return { value: 0, isError: true };
      return { value: x / y, isError: false };
    default: return { value: 0, isError: true };
  }
}

const OPERATOR_DISPLAY: Record<string, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};

function formatNumber(num: number): string {
  if (!isFinite(num)) return 'Error';
  // Avoid floating point display issues
  const str = num.toPrecision(12);
  const parsed = parseFloat(str);
  // Format with up to 10 significant digits
  if (Math.abs(parsed) >= 1e10 || (Math.abs(parsed) < 1e-6 && parsed !== 0)) {
    return parsed.toExponential(6);
  }
  // Remove trailing zeros after decimal
  return String(parseFloat(parsed.toPrecision(10)));
}

function getButtonStyles(variant: ButtonVariant, isActive: boolean): string {
  const base =
    'relative flex items-center justify-center rounded-2xl font-medium select-none cursor-pointer ' +
    'transition-all duration-150 ease-out active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-calc-amber ' +
    'text-lg sm:text-xl h-14 sm:h-16 ';

  switch (variant) {
    case 'digit':
      return (
        base +
        'bg-calc-btn-digit text-calc-text hover:bg-calc-btn-digit-hover ' +
        'shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)]'
      );
    case 'zero':
      return (
        base +
        'bg-calc-btn-digit text-calc-text hover:bg-calc-btn-digit-hover col-span-2 ' +
        'shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)]'
      );
    case 'function':
      return (
        base +
        'bg-calc-btn-fn text-calc-text-dim hover:bg-calc-btn-fn-hover hover:text-calc-text ' +
        'shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
      );
    case 'operator':
      return (
        base +
        (isActive
          ? 'bg-calc-text text-calc-btn-op shadow-amber-glow scale-95 '
          : 'bg-calc-btn-op text-[oklch(0.12_0.01_260)] hover:bg-calc-btn-op-hover ') +
        'font-bold shadow-[0_2px_12px_rgba(0,0,0,0.3)]'
      );
    case 'equals':
      return (
        base +
        'bg-calc-btn-eq text-[oklch(0.12_0.01_260)] hover:bg-calc-btn-eq-hover font-bold ' +
        'shadow-amber-glow hover:shadow-[0_0_24px_oklch(0.78_0.18_75_/_0.4)]'
      );
    default:
      return base;
  }
}

export default function Calculator() {
  const [expression, setExpression] = useState('');
  const [displayValue, setDisplayValue] = useState('0');
  const [operand1, setOperand1] = useState<string>('');
  const [operator, setOperator] = useState<string>('');
  const [waitingForOperand2, setWaitingForOperand2] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [activeOperator, setActiveOperator] = useState<string>('');
  const displayRef = useRef<HTMLDivElement>(null);

  const clearAll = useCallback(() => {
    setExpression('');
    setDisplayValue('0');
    setOperand1('');
    setOperator('');
    setWaitingForOperand2(false);
    setErrorMessage('');
    setJustEvaluated(false);
    setActiveOperator('');
  }, []);

  const handleDigit = useCallback(
    (digit: string) => {
      if (errorMessage) {
        clearAll();
        setDisplayValue(digit === '.' ? '0.' : digit);
        setExpression(digit === '.' ? '0.' : digit);
        return;
      }

      if (justEvaluated && !waitingForOperand2) {
        // Start fresh after evaluation
        if (digit === '.') {
          setDisplayValue('0.');
          setExpression('0.');
        } else {
          setDisplayValue(digit);
          setExpression(digit);
        }
        setOperand1('');
        setOperator('');
        setJustEvaluated(false);
        return;
      }

      if (waitingForOperand2) {
        if (digit === '.') {
          setDisplayValue('0.');
          setExpression(expression + '0.');
        } else {
          setDisplayValue(digit);
          setExpression(expression + digit);
        }
        setWaitingForOperand2(false);
        return;
      }

      // Prevent multiple decimals
      if (digit === '.' && displayValue.includes('.')) return;
      // Prevent leading zeros
      if (digit !== '.' && displayValue === '0' && digit !== '0') {
        setDisplayValue(digit);
        setExpression(expression.slice(0, -1) + digit);
        return;
      }
      if (displayValue === '0' && digit === '0') return;

      const newDisplay = displayValue === '0' && digit !== '.' ? digit : displayValue + digit;
      setDisplayValue(newDisplay);
      setExpression(expression + digit);
    },
    [displayValue, expression, errorMessage, justEvaluated, waitingForOperand2, clearAll]
  );

  const handleOperator = useCallback(
    (op: string) => {
      if (errorMessage) return;

      setActiveOperator(op);
      setJustEvaluated(false);

      if (operand1 && operator && !waitingForOperand2) {
        // Chain operations: evaluate current then set new operator
        const x = parseFloat(operand1);
        const y = parseFloat(displayValue);
        const result = localCalculate(x, y, operator);
        if (result.isError) {
          setErrorMessage('Error: Division by zero');
          setActiveOperator('');
          return;
        }
        const resultStr = formatNumber(result.value);
        setDisplayValue(resultStr);
        setOperand1(resultStr);
        setOperator(op);
        setExpression(resultStr + ' ' + OPERATOR_DISPLAY[op] + ' ');
        setWaitingForOperand2(true);
      } else {
        setOperand1(displayValue);
        setOperator(op);
        setExpression(displayValue + ' ' + OPERATOR_DISPLAY[op] + ' ');
        setWaitingForOperand2(true);
      }
    },
    [displayValue, errorMessage, operand1, operator, waitingForOperand2]
  );

  const handleEquals = useCallback(() => {
    if (errorMessage || !operand1 || !operator) return;
    if (waitingForOperand2) return; // No second operand yet

    const x = parseFloat(operand1);
    const y = parseFloat(displayValue);
    const fullExpression = operand1 + ' ' + OPERATOR_DISPLAY[operator] + ' ' + displayValue;
    const result = localCalculate(x, y, operator);

    if (result.isError) {
      setErrorMessage('Error: Division by zero');
      setActiveOperator('');
      return;
    }
    const resultStr = formatNumber(result.value);
    setDisplayValue(resultStr);
    setExpression(fullExpression + ' =');
    setOperand1('');
    setOperator('');
    setWaitingForOperand2(false);
    setJustEvaluated(true);
    setActiveOperator('');
  }, [displayValue, errorMessage, operand1, operator, waitingForOperand2]);

  const handleBackspace = useCallback(() => {
    if (errorMessage) {
      clearAll();
      return;
    }
    if (justEvaluated) {
      clearAll();
      return;
    }
    if (waitingForOperand2) return;

    if (displayValue.length <= 1 || (displayValue.length === 2 && displayValue.startsWith('-'))) {
      setDisplayValue('0');
      setExpression(expression.slice(0, -displayValue.length) || '');
    } else {
      const newDisplay = displayValue.slice(0, -1);
      setDisplayValue(newDisplay);
      setExpression(expression.slice(0, -1));
    }
  }, [displayValue, expression, errorMessage, justEvaluated, waitingForOperand2, clearAll]);

  const handlePercent = useCallback(() => {
    if (errorMessage) return;
    const val = parseFloat(displayValue);
    if (isNaN(val)) return;
    const result = val / 100;
    const resultStr = formatNumber(result);
    setDisplayValue(resultStr);
    if (waitingForOperand2) {
      setExpression(operand1 + ' ' + OPERATOR_DISPLAY[operator] + ' ' + resultStr);
    } else {
      setExpression(resultStr);
    }
  }, [displayValue, errorMessage, waitingForOperand2, operand1, operator]);

  const handleButton = useCallback(
    (value: string) => {
      if (value === 'clear') {
        clearAll();
      } else if (value === 'backspace') {
        handleBackspace();
      } else if (value === '%') {
        handlePercent();
      } else if (value === '=') {
        handleEquals();
      } else if (['+', '-', '*', '/'].includes(value)) {
        handleOperator(value);
      } else {
        handleDigit(value);
      }
    },
    [clearAll, handleBackspace, handlePercent, handleEquals, handleOperator, handleDigit]
  );

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for calculator keys to avoid page scroll etc.
      if (['Enter', '=', 'Escape', 'Backspace', 'Delete'].includes(e.key) ||
          /^[0-9+\-*/.%]$/.test(e.key)) {
        e.preventDefault();
      }

      if (e.key >= '0' && e.key <= '9') {
        handleButton(e.key);
      } else if (e.key === '.') {
        handleButton('.');
      } else if (e.key === '+') {
        handleButton('+');
      } else if (e.key === '-') {
        handleButton('-');
      } else if (e.key === '*') {
        handleButton('*');
      } else if (e.key === '/') {
        handleButton('/');
      } else if (e.key === '%') {
        handleButton('%');
      } else if (e.key === 'Enter' || e.key === '=') {
        handleButton('=');
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleButton('backspace');
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleButton('clear');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleButton]);

  // Auto-scroll display to end when display value changes
  useEffect(() => {
    const el = displayRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  });

  const displayText = errorMessage || displayValue;
  const isError = !!errorMessage;

  return (
    <div className="min-h-dvh bg-calc-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center pt-8 pb-4 px-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/calculator-icon.dim_128x128.png"
            alt="Calculator"
            className="w-10 h-10 rounded-xl"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            <h1 className="text-calc-text font-bold text-xl tracking-tight leading-none">
              Calc<span className="text-calc-amber">.</span>
            </h1>
            <p className="text-calc-text-dim text-xs font-mono mt-0.5">Modern Calculator</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center px-4 pb-8">
        <div
          className="w-full max-w-sm bg-calc-card rounded-3xl shadow-calc overflow-hidden"
          style={{ border: '1px solid oklch(0.28 0.015 260)' }}
        >
          {/* Display */}
          <div className="bg-calc-display px-5 pt-5 pb-4">
            {/* Expression line */}
            <div
              className="text-calc-text-dim text-sm font-mono text-right min-h-[1.25rem] overflow-x-auto whitespace-nowrap scrollbar-none"
              style={{ scrollbarWidth: 'none' }}
            >
              {expression || '\u00A0'}
            </div>

            {/* Main value */}
            <div
              ref={displayRef}
              className={`
                font-mono font-bold text-right mt-1 overflow-x-auto whitespace-nowrap
                transition-all duration-200 ease-out
                ${isError
                  ? 'text-destructive text-xl'
                  : displayText.length > 12
                  ? 'text-2xl'
                  : displayText.length > 8
                  ? 'text-3xl'
                  : 'text-4xl sm:text-5xl'
                }
                opacity-100
              `}
              style={{ scrollbarWidth: 'none', color: isError ? 'oklch(0.62 0.22 25)' : 'oklch(0.94 0.01 260)' }}
            >
              {displayText}
            </div>

            {/* Keyboard hint */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-calc-text-dim text-xs font-mono opacity-50">
                ⌨ keyboard supported
              </span>

            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'oklch(0.28 0.015 260)' }} />

          {/* Button Grid */}
          <div className="p-4 grid grid-cols-4 gap-2.5">
            {BUTTONS.map((btn) => (
              <button
                type="button"
                key={btn.value + btn.label}
                onClick={() => handleButton(btn.value)}
                className={`
                  ${getButtonStyles(btn.variant, activeOperator === btn.value)}
                  ${btn.colSpan === 2 ? 'col-span-2' : ''}
                `}
                aria-label={btn.label}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 px-4">
        <p className="text-calc-text-dim text-xs font-mono">
          Built with{' '}
          <span className="text-calc-amber" role="img" aria-label="love">♥</span>
          {' '}using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'modern-calculator')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-calc-amber hover:underline transition-opacity hover:opacity-80"
          >
            caffeine.ai
          </a>
          {' '}· © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
