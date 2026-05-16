import { createContext, useState, useEffect, useContext } from "react";
import type { academicYear, user } from "@/types";

interface AuthContextType {
  user: user | null;
  setUser: React.Dispatch<React.SetStateAction<user | null>>;
  loading: boolean;
  year: academicYear | null;
  setYear: React.Dispatch<React.SetStateAction<academicYear | null>>;
  logout: () => void;
  lmsToken: string | null;
  setLmsToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: false,
  year: null,
  setYear: () => {},
  logout: () => {},
  lmsToken: null,
  setLmsToken: () => {},
});

const MOCK_YEAR: academicYear = {
  _id: "y1",
  name: "2024-2025",
  fromYear: new Date("2024-09-01"),
  toYear: new Date("2025-06-30"),
  isCurrent: true,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser]   = useState<user | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear]   = useState<academicYear | null>(null);
  const [lmsToken, _setLmsToken] = useState<string | null>(
    () => localStorage.getItem("lms_token")
  );

  const setLmsToken = (token: string | null) => {
    if (token) {
      localStorage.setItem("lms_token", token);
    } else {
      localStorage.removeItem("lms_token");
    }
    _setLmsToken(token);
  };

  useEffect(() => {
    try {
      const storedUser  = localStorage.getItem("edunexus_user");
      const storedToken = localStorage.getItem("lms_token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setYear(MOCK_YEAR);
        _setLmsToken(storedToken);
      } else {
        localStorage.removeItem("edunexus_user");
        localStorage.removeItem("lms_token");
      }
    } catch {
      localStorage.removeItem("edunexus_user");
      localStorage.removeItem("lms_token");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("edunexus_user");
    localStorage.removeItem("lms_token");
    setUser(null);
    setYear(null);
    _setLmsToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, year, setYear, logout, lmsToken, setLmsToken }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
