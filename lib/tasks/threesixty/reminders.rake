namespace :reminders do
  desc 'Send email reminders'

  task process: :environment do
    Threesixty::Emails::SendRemindersJob.perform_later
  end
end
