import { RouterProvider } from "react-router";
import { router } from "@/pages/routes/router";

export default function App() {
  return <RouterProvider router={router} />;
}
