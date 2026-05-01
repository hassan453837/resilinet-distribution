import React, { useEffect, useState } from 'react';

export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-mono text-sm tracking-wider text-muted-foreground">
      {time.toLocaleTimeString('en-US', { hour12: false })}
    </div>
  );
}
