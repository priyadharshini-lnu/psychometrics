namespace :communications do
  desc 'Run fetch communications task'
  task proccess: :environment do
    Communications::OnSpecificDatetimeJob.perform_later
    Communications::IfNotStartedJob.perform_later
    Communications::IfNotFinishedJob.perform_later
  end
end
