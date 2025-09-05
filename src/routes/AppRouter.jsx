// src/routes/AppRouter.jsx
import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
  useLocation,
} from "react-router-dom";


// Layout
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";


// Public pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";
import AtsScanner from "@/features/ats/AtsScanner"; // ensure file name casing
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


// Legal pages
import {
  TermsAndConditions,
  Privacy,
  RefundPolicy,
  PlacementAssistance,
  Disclaimer,
  ShippingAndDelivery,
  // If you created a dedicated legal Contact page, import it via the index as below:
  // Contact as LegalContact,
} from "@/pages/Legal";


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


// Programs – resources
import LearningRoadmaps from "@/pages/Programs/Resources/LearningRoadmaps";
import NotesCheats from "@/pages/Programs/Resources/NotesCheats";


// Protected
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard/Dashboard";


// Old extra pages that were protected
import Friends from "@/pages/Dashboard/Friends";
import Profile from "@/pages/Dashboard/Profile";
import AdminAccess from "@/pages/Dashboard/AdminAccess";
import Exam from "@/pages/Dashboard/Exam";
import Result from "@/pages/Dashboard/Result";
import Courses from "@/pages/Dashboard/Courses";


function RootLayout() {
  const { pathname } = useLocation();
  // Hide Navbar/Footer and prevent page scroll on exam routes
  const isExam = pathname.startsWith("/exam");


  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${
        isExam ? "overflow-hidden" : ""
      }`}
    >
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


const router = createBrowserRouter(
  [
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


        // Auth – Forgot / Reset / Verify
        { path: "/forgot-password", element: <ForgotPassword /> },
        { path: "/reset-password/:token", element: <ResetPassword /> },
        { path: "/verify-otp", element: <VerifyLoginOtp /> },


        // Programs (granular public pages)
        { path: "/courses/learn", element: <LearnCourses /> },
        { path: "/courses/campus", element: <CampusBootcamps /> },
        { path: "/courses/cohorts", element: <LiveCohorts /> },
        { path: "/courses/cloud", element: <CloudCertConcierge /> },


        { path: "/mentor", element: <MentorReview /> },


        { path: "/workshops/online", element: <OnlineWorkshops /> },
        { path: "/workshops/campus", element: <OnCampusWorkshops /> },


        { path: "/community/projects", element: <ProjectsAssistance /> },
        { path: "/community/hackathons", element: <Hackathons /> },


        { path: "/mock-interviews/one-one", element: <OneOnOneMock /> },
        { path: "/mock-interviews/question-bank", element: <QuestionBank /> },
        { path: "/mock_interviews/one-one", element: <OneOne /> }, // keep existing alt path


        // Cloud cert plans (as requested)
        { path: "/cloud/cert-concierge", element: <CloudCertPlans /> },


        { path: "/resources/roadmaps", element: <LearningRoadmaps /> },
        { path: "/resources/notes", element: <NotesCheats /> },


        // -------- Legal routes --------
        { path: "/legal/terms", element: <TermsAndConditions /> },
        { path: "/legal/privacy-policy", element: <Privacy /> },
        { path: "/legal/refund-policy", element: <RefundPolicy /> },
        { path: "/legal/placement-assistance", element: <PlacementAssistance /> },
        { path: "/legal/disclaimer", element: <Disclaimer /> },
        { path: "/legal/shipping-delivery", element: <ShippingAndDelivery /> },
        // If you built a dedicated legal Contact page, uncomment the next line:
        // { path: "/legal/contact", element: <LegalContact /> },


        // Protected group
        {
          element: <ProtectedRoute />,
          children: [
            { path: "/dashboard", element: <Dashboard /> },
            { path: "/courses", element: <Courses /> }, // in-app courses
            { path: "/friends", element: <Friends /> },
            { path: "/profile", element: <Profile /> },
            { path: "/admin/access", element: <AdminAccess /> },


            // Exam routes (Navbar/Footer hidden by RootLayout when path startsWith("/exam"))
            { path: "/exam", element: <Exam /> },
            { path: "/exam/:id", element: <Exam /> },
            { path: "/result", element: <Result /> },
            { path: "/1", element: <Roadmap /> },
          ],
        },


        // 404 fallback
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
  {
    // basename: import.meta.env.BASE_URL,
  }
);


export default function AppRouter() {
  return <RouterProvider router={router} />;
}








