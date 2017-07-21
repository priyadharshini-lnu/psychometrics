namespace :communications do
  desc 'Run fetch communications task'
  task proccess: :environment do
    Communications::IfNotFinishedJob.perform_later
    Communications::IfNotStartedJob.perform_later
    Communications::OnSpecificDatetimeJob.perform_later
  end
end
