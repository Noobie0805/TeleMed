import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div>
      <h2>Page not found</h2>
      <p>
        Go back <Link to="/">home</Link>.
      </p>
    </div>
  );
}

