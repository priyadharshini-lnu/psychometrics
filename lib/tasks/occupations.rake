namespace :occupations do
  desc 'Calculates occupations for all completed assigns'
  task calculate: :environment do
    Assign.completed.includes(:project_assign).find_each do |assign|
      assign.assign_with_result.occupations = Assigns::CalculateOccupations.call!(assign.assign_with_result)
      assign.assign_with_result.save
    end
  end
end
