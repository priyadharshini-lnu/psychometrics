namespace :communications do
  desc 'Run fetch communications task'
  task proccess: :environment do
    Communications::OtherTypeJob.perform_later
  end
end
