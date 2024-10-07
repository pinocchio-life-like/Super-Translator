import { useState, useEffect } from "react";

export const useFormHeight = (ref: React.RefObject<HTMLDivElement>) => {
  const [formHeight, setFormHeight] = useState<number>(0);

  useEffect(() => {
    if (ref.current) {
      setFormHeight(ref.current.offsetHeight);
    }
  }, [ref]);

  return formHeight;
};
