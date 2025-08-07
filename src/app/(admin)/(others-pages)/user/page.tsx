"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">User Table</h1>
      {data.map((user) => (
        <div key={user.id} className="mb-2 p-2 border rounded">
          <p>
            <strong>ID:</strong> {user.id}
          </p>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
        </div>
      ))}
    </div>
  );
}
