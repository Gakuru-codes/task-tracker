import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import API_BASE from "@/api/axios";

// context
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

const LoginForm = ({ className, ...props }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("All fields are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Find user by email
      const response = await API_BASE.get(`/users?email=${formData.email}`);

      if (response.data.length === 0) {
        setError("User not found. Please check your email or sign up.");
        setIsLoading(false);
        return;
      }

      const user = response.data[0];

      // Check if account is active
      if (!user.isActive) {
        setError("Account is deactivated. Please contact support.");
        setIsLoading(false);
        return;
      }

      // Verify password
      if (user.password !== formData.password) {
        setError("Invalid password. Please try again.");
        setIsLoading(false);
        return;
      }

      // Login successful
      setSuccess("Login successful! Redirecting...");

      // Store user data in localStorage
      const userSession = {
        id: user.id,
        email: user.email,
        username: user.username,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("user", JSON.stringify(userSession));
      localStorage.setItem("isAuthenticated", "true");

      // Clear form
      setFormData({ email: "", password: "" });

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800">
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      type="button"
                      disabled={isLoading}
                    >
                      Login with Google
                    </Button>
                  </div>
                </div>

                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/auth/register"
                    className="underline underline-offset-4"
                  >
                    Sign up
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
