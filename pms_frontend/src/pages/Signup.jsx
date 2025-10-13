import React from 'react';
import SignupForm from '../components/auth/SignupForm';

const Signup = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4 py-8">
      <SignupForm />
    </div>
  );
};

export default Signup;