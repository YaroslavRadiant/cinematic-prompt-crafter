import { BrowserRouter, Route, Routes } from "react-router-dom"; // Используем React Router DOM
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { HomePage } from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { TabProvider } from "@/context/TabContext";
import AuthProvider, { useAuth } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TabProvider>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <div>Dashboard</div>
                  </ProtectedRoute>
                }
              />
              {/* Страница 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </TabProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
