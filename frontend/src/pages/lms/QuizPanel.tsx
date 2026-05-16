/**
 * Quiz panel — redirects to Study Hub.
 * The real quiz experience lives in StudyDocument (/lms/study/:id).
 */
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function QuizPanel() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/lms/study", { replace: true }); }, []);
  return null;
}
