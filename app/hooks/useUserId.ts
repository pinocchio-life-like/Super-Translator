import { useEffect, useState } from "react";
import axios from "../utils/axios";

export const useUserId = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get("/api/users/me");
        setUserId(response.data.id);
      } catch (error) {
        console.error("Error fetching user id:", error);
      }
    };

    fetchUserId();
  }, []);

  return userId;
};
