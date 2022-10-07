# frozen_string_literal: true

class CronJobsLoader
  SCHEDULE_FILE = 'config/schedule.yml'

  def self.load_jobs
    Sidekiq::Cron::Job.load_from_hash(YAML.load_file(SCHEDULE_FILE))
  end
end
