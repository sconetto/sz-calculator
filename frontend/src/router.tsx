import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CalculatorPage } from "@/pages/calculator-page";

// The application's router defines what components render at which paths.
const router = createBrowserRouter([
  {
    path: "/",
    element: <CalculatorPage />,
  },
]);

/**
 * AppRouter wraps the `RouterProvider` provided by react-router-dom,
 * rendering the correct page based on the current URL.
 */
export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
