class CreateAssessmentsClientsJoinTable < ActiveRecord::Migration[5.0]
  def change
    create_table :assessments_clients, id: false do |t|
      t.integer :assessment_id
      t.integer :client_id
    end
    add_index :assessments_clients, [:assessment_id, :client_id]
  end
end
