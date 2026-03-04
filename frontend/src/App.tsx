import { AppRouter } from "./router";
import { ErrorBoundary } from "./components/error-boundary";

/**
 * App is the root React component, rendering the application router.
 * Wraps the router in an ErrorBoundary to catch uncaught errors.
 */
function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;
