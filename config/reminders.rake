namespace :reminders do
  desc 'Send email reminders'

  task proccess: :environment do
    Threesixty::Emails::SendRemindersJob.perform_later
  end
end
