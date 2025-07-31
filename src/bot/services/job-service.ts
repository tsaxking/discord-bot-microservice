import parser from 'cron-parser';
import { DateTime } from 'luxon';
import schedule from 'node-schedule';
import { createRequire } from 'node:module';

import { Logger } from './index.js';
import { Job } from '../jobs/index.js';
import { attempt } from 'ts-utils/check';

const require = createRequire(import.meta.url);
let Logs = require('../../lang/logs.json');

export class JobService {
    constructor(private jobs: Job[]) {}

    public start() {
        return attempt(() => {
            for (let job of this.jobs) {
                let jobSchedule = job.runOnce
                    ? parser
                        .parse(job.schedule, {
                            currentDate: DateTime.now()
                                .plus({ seconds: job.initialDelaySecs })
                                .toJSDate(),
                        })
                        .next()
                        .toDate()
                    : {
                        start: DateTime.now().plus({ seconds: job.initialDelaySecs }).toJSDate(),
                        rule: job.schedule,
                    };

                schedule.scheduleJob(jobSchedule, async () => {
                    try {
                        if (job.log) {
                            Logger.info(Logs.info.jobRun.replaceAll('{JOB}', job.name));
                        }

                        await job.run();

                        if (job.log) {
                            Logger.info(Logs.info.jobCompleted.replaceAll('{JOB}', job.name));
                        }
                    } catch (error) {
                        Logger.error(Logs.error.job.replaceAll('{JOB}', job.name), error);
                    }
                });
                Logger.info(
                    Logs.info.jobScheduled
                        .replaceAll('{JOB}', job.name)
                        .replaceAll('{SCHEDULE}', job.schedule)
                );
            }
        });
    }
}
