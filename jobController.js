import Job from "../models/Job.js";

export const createJob = async (req, res) => {
  const job = new Job(req.body);
  await job.save();
  res.json(job);
};

export const getJobs = async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
};