class CreateAssessmentsClientsJoinTable < ActiveRecord::Migration[5.1]
  def change
    create_join_table :assessments, :clients do |t|
      t.index [:client_id, :assessment_id]
    end
  end
end
