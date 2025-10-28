import { useState, useEffect } from "react";

function Counter({ theme }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (count === 5) {
      console.log(`Count reached 5! Theme is ${theme}`);
    }
    console.log("counter changed!")
    
  }, [count ,  theme]); // ← مشکل اینجاست

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}

export default Counter