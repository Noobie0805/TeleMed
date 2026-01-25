import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function DoctorPending() {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <div>
      <h2>Doctor registration submitted</h2>
      <p>
        {email ? (
          <>
            Your account <strong>{email}</strong> is pending admin verification.
          </>
        ) : (
          <>Your account is pending admin verification.</>
        )}
      </p>
      <p>
        Once approved, you can <Link to="/login">log in</Link>.
      </p>
    </div>
  );
}

