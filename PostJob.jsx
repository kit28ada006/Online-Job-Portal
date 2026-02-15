import axios from "axios";
import { useState } from "react";

export default function PostJob() {
  const [job, setJob] = useState({});

  const postJob = async () => {
    await axios.post("http://localhost:5000/api/jobs", job);
    alert("Job Posted");
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="bg-white p-6 rounded shadow w-[500px]">
        <h2 className="text-2xl font-bold mb-4">Post a Job</h2>
        <input className="w-full border p-2 mb-2" placeholder="Job Title"
          onChange={e => setJob({ ...job, title: e.target.value })} />
        <input className="w-full border p-2 mb-2" placeholder="Company"
          onChange={e => setJob({ ...job, company: e.target.value })} />
        <input className="w-full border p-2 mb-2" placeholder="Location"
          onChange={e => setJob({ ...job, location: e.target.value })} />
        <textarea className="w-full border p-2 mb-3" placeholder="Description"
          onChange={e => setJob({ ...job, description: e.target.value })} />
        <button onClick={postJob}
          className="bg-indigo-600 text-white px-4 py-2 rounded w-full">
          Post Job
        </button>
      </div>
    </div>
  );
}