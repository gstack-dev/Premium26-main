import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";
import AppLayout from "./ui/AppLayout";
import PageSpinner from "./ui/PageSpinner";

const PremiumForm = lazy(() => import("./pages/PremiumForm"));
const Success = lazy(() => import("./pages/Success"));
const UploadCv = lazy(() => import("./pages/UploadCv"));
const Pst = lazy(() => import("./pages/Pst"));
const PstComplete = lazy(() => import("./pages/PstComplete"));
const Internships = lazy(() => import("./pages/Internships"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Interview = lazy(() => import("./pages/Interview"));
const Data = lazy(() => import("./pages/Data"));
const Slots = lazy(() => import("./pages/Slots"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Interns = lazy(() => import("./pages/Interns"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: 1,
    },
  },
});

function App() {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    function handleStart() {
      setIsBooting(false);
    }
    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleStart();
    });
    window.addEventListener("mousedown", handleStart);
    
    return () => {
      window.removeEventListener("keydown", handleStart);
      window.removeEventListener("mousedown", handleStart);
    };
  }, []);

  if (isBooting) return <PageSpinner />;

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <BrowserRouter basename="/APEC26_Premium_main">
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<PremiumForm />} />
              <Route path="/success" element={<Success />} />
              <Route path="/upload-cv" element={<UploadCv />} />
              <Route path="/pst" element={<Pst />} />
              <Route path="/pst/complete" element={<PstComplete />} />
              <Route path="/internships" element={<Internships />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/interview" element={<Interview />} />
              <Route path="/data" element={<Data />} />
              <Route path="/slots" element={<Slots />} />
              <Route path="/feedback" element={<Feedback />} />
              //<Route path="/interns" element={<Interns />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
    </QueryClientProvider>
  );
}

export default App;
