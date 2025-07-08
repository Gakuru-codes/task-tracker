import React, { useEffect, useState } from "react";
import Datatable from "@/components/data-table";

import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [initialAuthCheck, setInitialAuthCheck] = useState(false);

  useEffect(() => {
    if (initialAuthCheck && !isAuthenticated) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, navigate, initialAuthCheck]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialAuthCheck(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // loader
  if (!initialAuthCheck) {
    return (
      <div className="min-h-screen w-full bg-[#F3F6FE] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-[#F3F6FE]">
      {/* navbar */}
      <div className=" bg-white py-6 shadow-sm">
        <div className="w-full flex items-center justify-between mx-auto max-w-5xl">
          <div className="">
            <h1 className="text-3xl font-medium mb-1">
              Welcome back {user?.username}
            </h1>
            <p className="text-base text-gray-400 dark:text-gray-600">
              Here's a list of your tasks for this month.
            </p>
          </div>

          <Button onClick={logout}>Logout</Button>
        </div>
      </div>

      {/*  */}
      <div className="w-full mx-auto max-w-5xl p-6 bg-white rounded-lg shadow-md mt-6">
        <Datatable />
      </div>
    </div>
  );
};

export default Dashboard;
