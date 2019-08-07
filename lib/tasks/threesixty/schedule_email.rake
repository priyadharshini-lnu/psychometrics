namespace :schedule_email do
  desc 'Send schedule email'
  task process: :environment do
    Threesixty::SendScheduledEmailJob.perform_later
  end
end
