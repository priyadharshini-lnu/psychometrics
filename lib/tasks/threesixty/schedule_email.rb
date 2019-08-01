namespace :schedule_email do
  desc 'Send schedule email'
  task proccess: :environment do
    Threesixty::SendScheduledEmailJob.perform_later
  end
end
