require 'tty-progressbar'

namespace :occupations do
  desc 'Calculates occupations for all completed assigns'
  task calculate: :environment do
    assigns = Assign.where("occupations = '[]'").where.not(results: nil).completed
    bar = TTY::ProgressBar.new("Updating [:bar] :current/:total :eta", total: assigns.count)
    assigns.includes(:project_assign).find_each do |assign|
      assign.assign_with_result.occupations = Assigns::CalculateOccupations.call!(assign.assign_with_result)
      assign.assign_with_result.save
      bar.advance(1)
    end
  end
end
