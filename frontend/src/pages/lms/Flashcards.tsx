/**
 * Flashcards page — redirects to Study Hub.
 * The real flashcard experience lives in StudyDocument (/lms/study/:id).
 */
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function Flashcards() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/lms/study", { replace: true }); }, []);
  return null;
}
