const test = (data, key_mapping) => {
  const reportData = JSON.parse(data);
  const dataFilteredByKey = reportData.reduce((job, currentJob) => {
    if(job[currentJob.name] === undefined) {
      job[currentJob.name] = { keys: [currentJob['key']] };
    } else {
      const key_config =  key_mapping.find(item => currentJob.name.includes(item.name));
      job[currentJob.name].keys = [...job[currentJob.name].keys, currentJob['key']];
      const keys = currentJob['key'].split('_');

      job[currentJob.name].name = key_config?.name;
      if(key_config?.countKeys.some(item => currentJob.key.startsWith(item))) {
        if(keys.length > 0 && isNumeric(keys[keys.length - 1])) {
          if(job[currentJob.name].runCount !== undefined) {
            job[currentJob.name].runCount =
              job[currentJob.name].runCount < Number(keys[keys.length - 1]) ? Number(keys[keys.length - 1]) : job[currentJob.name].runCount;
            job[currentJob.name].status =
              job[currentJob.name].runCount > Number(keys[keys.length - 1]) ? job[currentJob.name].status : currentJob['status'];
          } else {
            job[currentJob.name].runCount = Number(keys[keys.length - 1]);
          }
        } else if(currentJob['status'] === 'Warning') {
          job[currentJob.name].status =  currentJob['status'];
        }
        job[currentJob.name].timeRun =  job[currentJob.name].timeRun !== undefined ?
          job[currentJob.name].timeRun + Number(currentJob.time) : Number(currentJob.time);
        job[currentJob.name].timeRetry = 6000 * job[currentJob.name].runCount;
        job[currentJob.name].total = job[currentJob.name].timeRun + job[currentJob.name].timeRetry;
      }
    }
    return job;
  }, {});
  console.log('[test] dataFilteredByKey', dataFilteredByKey)
  return buildReportData(dataFilteredByKey, key_mapping);
}

function buildReportData(jobData, key_mapping) {
  const jobs = {
    failed: [],
    success: [],
  }
  const data = [...key_mapping];
  data.forEach((item) => {
    for (const jobName in jobData) {
      if(jobName.includes(item.name)) {
        item.total = item.total !== undefined ? item.total : 0;
        item.jobSuccess = item.jobSuccess !== undefined ? item.jobSuccess : 0;
        item.jobCount = item.jobCount !== undefined ? item.jobCount : 0;
        item.jobCount += 1;
        if(jobData[jobName]?.status === 'Success' && jobData[jobName]?.total) {
          item.total += Number(jobData[jobName]?.total);
          item.jobSuccess += 1;
          item.average = (item.total / item.jobSuccess) / 1000;
          jobs.success.push(jobName);
        }
        if(jobData[jobName]?.status === 'Warning') {
          item.jobFail = item.jobFail !== undefined ? item.jobFail : 0;
          item.jobFail += 1;
          jobs.failed.push(jobName);
        }
        item.passed = item.passed !== undefined ? item.passed : 0;
        item.passed = (item.jobSuccess / item.jobCount) * 100;
      }
    }
  });
  console.log('[buildReportData] data', data);
  console.log('[buildReportData] status', jobs);

  return { data, jobs };
}

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}
