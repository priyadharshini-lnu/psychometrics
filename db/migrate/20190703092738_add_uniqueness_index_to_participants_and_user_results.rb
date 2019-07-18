class AddUniquenessIndexToParticipantsAndUserResults < ActiveRecord::Migration[5.1]
  def change
    add_index :participants, [:subject_id, :evaluator_id], unique: true
    add_index :users_results, [:subject_id, :evaluator_id], unique: true
  end
end
