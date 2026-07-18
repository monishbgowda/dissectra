const path = require('path');
const fs = require('fs/promises');

const JOBS_FILE = path.join(__dirname, '..', 'storage', 'model-jobs.json');
let jobsCache;

async function readJobs() {
  try {
    const raw = await fs.readFile(JOBS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeJobs(jobs) {
  await fs.mkdir(path.dirname(JOBS_FILE), { recursive: true });
  await fs.writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf8');
  jobsCache = jobs;
  return jobs;
}

async function ensureJobs() {
  if (jobsCache) return jobsCache;
  jobsCache = await readJobs();
  return jobsCache;
}

async function getJob(jobId) {
  const jobs = await ensureJobs();
  return jobs.find(item => item.jobId === jobId);
}

async function createJob(job) {
  const jobs = await ensureJobs();
  jobs.push(job);
  await writeJobs(jobs);
  return job;
}

async function updateJob(jobId, patch) {
  const jobs = await ensureJobs();
  const item = jobs.find(job => job.jobId === jobId);
  if (!item) return null;
  Object.assign(item, patch, { updatedAt: new Date().toISOString() });
  await writeJobs(jobs);
  return item;
}

module.exports = { getJob, createJob, updateJob };
