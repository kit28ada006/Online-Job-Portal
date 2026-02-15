import Job from "../models/Job.js";

export const deleteExpiredJobs = async () => {
  await Job.deleteMany({ deadline: { $lt: new Date() } });
};
