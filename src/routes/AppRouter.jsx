// src/routes/AppRouter.jsx
import React from "react";
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
  useLocation,
} from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

// Public pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";
import AtsScanner from "@/features/ats/AtsScanner";
import ResumeBuilder from "@/features/resumeBuild/Resumebuilder";
import LiveWorkshops from "@/pages/Programs/Workshops/LiveWorkshops";
import Roadmap from "@/components/1";

// Auth pages
import Login from "@/pages/Login/Login";
import Signup from "@/pages/Login/Signup";
import AccountCreated from "@/pages/Login/AccountCreated";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import VerifyLoginOtp from "@/pages/auth/VerifyLoginOtp";

// Programs – courses
import LearnCourses from "@/pages/Programs/Courses/LearnCourses";
import LiveCohorts from "@/pages/Programs/Courses/LiveCohorts";
import CampusBootcamps from "@/pages/Programs/Courses/CampusBootcamps";
import CloudCertConcierge from "@/pages/Programs/Courses/CloudCertConcierge";
import CloudCertPlans from "@/pages/Programs/Courses/cloudplan";

// Programs – resume
import MentorReview from "@/pages/Programs/Resume/MentorReview";

// Programs – workshops
import OnlineWorkshops from "@/pages/Programs/Workshops/OnlineWorkshops";
import OnCampusWorkshops from "@/pages/Programs/Workshops/OnCampusWorkshops";

// Programs – community
import ProjectsAssistance from "@/pages/Programs/Community/ProjectsAssistance";
import Hackathons from "@/pages/Programs/Community/Hackathons";

// Programs – mock interviews
import OneOnOneMock from "@/pages/Programs/Mock_Interviews/OneOnOneMock";
import QuestionBank from "@/pages/Programs/Mock_Interviews/QuestionBank";
import OneOne from "@/pages/Programs/Mock_Interviews/OneOne";

// Protected
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard/Dashboard";
import Friends from "@/pages/Dashboard/Friends";
import Profile from "@/pages/Dashboard/Profile";
import AdminAccess from "@/pages/Dashboard/AdminAccess";
import Exam from "@/pages/Dashboard/Exam";
import Result from "@/pages/Dashboard/Result";
import Courses from "@/pages/Dashboard/Courses";

function RootLayout() {
  const { pathname } = useLocation();
  const isExam = pathname.startsWith("/exam");

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${isExam ? "overflow-hidden" : ""}`}>
      {!isExam && <ScrollToTop />}
      {!isExam && <ScrollRestoration />}
      {!isExam && <Navbar />}

      <div className="flex-1">
        <Outlet />
      </div>

      {!isExam && <Footer />}
    </div>
  );
}

const routes = [
  {
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      // Public
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/account-created", element: <AccountCreated /> },
      { path: "/ats-scanner", element: <AtsScanner /> },
      { path: "/resume", element: <ResumeBuilder /> },
      { path: "/workshops/live", element: <LiveWorkshops /> },

      // Forgot / Reset (support param and query)
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
      { path: "/reset-password/:token", element: <ResetPassword /> },
      { path: "/verify-otp", element: <VerifyLoginOtp /> },

      // Programs
      { path: "/courses/learn", element: <LearnCourses /> },
      { path: "/courses/campus", element: <CampusBootcamps /> },
      { path: "/courses/cohorts", element: <LiveCohorts /> },
      { path: "/courses/cloud", element: <CloudCertConcierge /> },
      { path: "/cloud/cert-concierge", element: <CloudCertPlans /> },

      { path: "/mentor", element: <MentorReview /> },

      { path: "/workshops/online", element: <OnlineWorkshops /> },
      { path: "/workshops/campus", element: <OnCampusWorkshops /> },

      { path: "/community/projects", element: <ProjectsAssistance /> },
      { path: "/community/hackathons", element: <Hackathons /> },

      { path: "/mock-interviews/one-one", element: <OneOnOneMock /> },
      { path: "/mock-interviews/question-bank", element: <QuestionBank /> },
      { path: "/mock_interviews/one-one", element: <OneOne /> },

      // Protected group
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/courses", element: <Courses /> },
          { path: "/friends", element: <Friends /> },
          { path: "/profile", element: <Profile /> },
          { path: "/admin/access", element: <AdminAccess /> },
          { path: "/exam", element: <Exam /> },
          { path: "/exam/:id", element: <Exam /> },
          { path: "/result", element: <Result /> },
          { path: "/1", element: <Roadmap /> },
        ],
      },

      // 404
      { path: "*", element: <NotFound /> },
    ],
  },
];

// Normal site (pretty URLs)
const browserRouter = createBrowserRouter(routes);

// Hash-only fallback router for reset password
const resetHashRouter = createHashRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/reset-password", element: <ResetPassword /> },
      { path: "/reset-password/:token", element: <ResetPassword /> },
      // Optional: you can add a redirect for empty hash to home
      { path: "*", element: <ResetPassword /> },
    ],
  },
]);

export default function AppRouter() {
  // If a link uses the hash form (#/reset-password...), use the hash router.
  const isResetHash = typeof window !== "undefined" && window.location.hash.startsWith("#/reset-password");
  return <RouterProvider router={isResetHash ? resetHashRouter : browserRouter} />;
}
