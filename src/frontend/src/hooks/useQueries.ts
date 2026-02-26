import { useMutation } from '@tanstack/react-query';
import { useActor } from './useActor';

export type Operation = 'add' | 'subtract' | 'multiply' | 'divideSafe';

export interface CalcInput {
  x: number;
  y: number;
  operation: Operation;
}

export interface CalcResult {
  value: number | null;
  isError: boolean;
}

export function useCalculate() {
  const { actor } = useActor();

  return useMutation<CalcResult, Error, CalcInput>({
    mutationFn: async ({ x, y, operation }: CalcInput): Promise<CalcResult> => {
      if (!actor) throw new Error('Actor not initialized');

      switch (operation) {
        case 'add': {
          const value = await actor.add(x, y);
          return { value, isError: false };
        }
        case 'subtract': {
          const value = await actor.subtract(x, y);
          return { value, isError: false };
        }
        case 'multiply': {
          const value = await actor.multiply(x, y);
          return { value, isError: false };
        }
        case 'divideSafe': {
          const value = await actor.divideSafe(x, y);
          if (value === null) {
            return { value: null, isError: true };
          }
          return { value, isError: false };
        }
        default:
          throw new Error('Unknown operation');
      }
    },
  });
}
