# frozen_string_literal: true

class CronJobsLoader
  SCHEDULE_FILE = 'config/schedule.yml'

  def self.load_jobs
    schedule = YAML.load_file(SCHEDULE_FILE)
    Sidekiq::Cron::Job.load_from_hash(schedule)

    scheduled_job_names = schedule.keys.map(&:to_s)
    jobs_to_remove = Sidekiq::Cron::Job.all.reject do |job|
      scheduled_job_names.include?(job.name.to_s)
    end

    jobs_to_remove.each(&:destroy)
  end
end
