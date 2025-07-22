import { Link, useLocation } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const RegisterSuccessPage = () => {
  const location = useLocation();
  const { email, name } = location.state || {};

  return (
    <div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-xl border border-gray-200 sm:px-10">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Account Created Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              Welcome to Research Hub, {name || "researcher"}! Your account has
              been created and you're ready to start collaborating.
            </p>

            {email && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Account Email:</strong> {email}
                </p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              What's Next?
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Complete your profile with research interests and skills
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Join or create research groups in your field
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Start collaborating on research papers and projects
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Track your research milestones and progress
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Continue to Login
            </Link>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Need to register another account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Need help getting started?{" "}
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  View our getting started guide
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccessPage;
