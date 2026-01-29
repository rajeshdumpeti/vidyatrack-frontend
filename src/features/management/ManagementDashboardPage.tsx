import { LayoutGrid, Users, GraduationCap, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function ManagementDashboardPage() {
  const steps = [
    {
      title: "Setup Academic Structure",
      desc: "Define your Classes and Sections for the current session.",
      link: "/management/classes",
      icon: <LayoutGrid className="h-6 w-6 text-purple-600" />,
      color: "bg-purple-50",
    },
    {
      title: "Onboard Staff",
      desc: "Create accounts for the Principal and your Teaching staff.",
      link: "/management/teachers/new",
      icon: <Users className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-50",
    },
    {
      title: "Student Enrollment",
      desc: "Register students and assign them to their respective sections.",
      link: "/management/students",
      icon: <GraduationCap className="h-6 w-6 text-green-600" />,
      color: "bg-green-50",
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Management Dashboard
        </h1>
        <p className="text-gray-500">
          Welcome to Vidyatrack. Complete the steps below to initialize your
          school.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <Link
            key={step.title}
            to={step.link}
            className="group p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div
              className={`${step.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              {step.icon}
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-600 rounded-2xl text-white flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Pilot Status: Active</h2>
          <p className="text-blue-100 text-sm">
            You are currently in the initial setup phase for the 2026 session.
          </p>
        </div>
        <ClipboardCheck className="h-12 w-12 text-blue-400 opacity-50" />
      </div>
    </div>
  );
}
