import { useEffect, useId } from 'react';

// Shared state for all instances of the hook
const lockStack = new Set<string>();

/**
 * Robust scroll lock that handles multiple concurrent calls using a unique ID stack.
 * Ensures that the scroll is only unlocked when ALL components have released their lock.
 */
export function useScrollLock(lock: boolean) {
  const id = useId();

  useEffect(() => {
    if (lock) {
      lockStack.add(id);
      
      if (lockStack.size === 1) {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      }
      
      return () => {
        lockStack.delete(id);
        if (lockStack.size === 0) {
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
        }
      };
    }
  }, [lock, id]);
}
