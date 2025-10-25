import { useState, useEffect } from "react";

export default function Name() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // ❌ stale closure: `count` is always 0
      console.log(count);
      setCount(count + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [count]); // Empty dependency array!
  
  return <div>{count/60}</div>;
}
