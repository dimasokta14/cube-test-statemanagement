import { useState } from 'react';

function useCounter(){
  const [count, setCount] = useState<number>(0)
  const increment = () => setCount((c) => c + 1)
  return { count, increment }
}

export default useCounter;