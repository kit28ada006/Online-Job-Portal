const JobCard = ({ job }) => {
  const isExpired = new Date(job.deadline) < new Date();

  if (isExpired) return null;

  return (
    <div className="bg-white shadow-lg rounded-xl p-5 hover:scale-105 transition">
      <div className="flex items-center gap-4">
        <img
          src={job.companyLogo}
          alt={job.company}
          className="w-14 h-14 object-contain"
        />
        <div>
          <h2 className="text-xl font-bold">{job.title}</h2>
          <p className="text-gray-500">{job.company}</p>
        </div>
      </div>

      <p className="mt-3 text-gray-600">{job.description}</p>

      <div className="mt-3 flex justify-between text-sm">
        <span>📍 {job.location}</span>
        <span>💰 {job.salary}</span>
      </div>

      <p className="text-red-500 mt-2">
        ⏳ Apply before: {new Date(job.deadline).toLocaleDateString()}
      </p>

      <a
        href={job.applyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-4 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Apply Now
      </a>
    </div>
  );
};

export default JobCard;