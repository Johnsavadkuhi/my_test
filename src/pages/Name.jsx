

import { useState, useEffect } from "react";

export default function Count() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log(count);
      setCount(count + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []); 
  
  return <div>{count}</div>;
}
