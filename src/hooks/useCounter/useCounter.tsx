import { useState } from 'react';

export type count = number;

function useCounter(){
  const [count, setCount] = useState<count>(0)
  const increment = () => setCount((c) => c + 1)
  return { count, increment }
}

export default useCounter;