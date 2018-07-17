namespace :aliases do
  desc 'Remove name from agile_scoring and scoring.'
  task remove_name_from_scorings: :environment do
    change_scoring('scoring')
    change_scoring('agile_scoring')
  end

  def change_scoring(scoring_field)
    assigns = Assign.where.not(scoring_field => {})
    ActiveRecord::Base.transaction do
      assigns.find_each do |assign|
        assign.attributes[scoring_field].each do |_k, v|
          v.delete('name')
        end
        assign.save(validate: false)
      end
      puts "Updated #{assigns.count} modules."
    end
  end
end
