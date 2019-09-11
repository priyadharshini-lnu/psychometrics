# frozen_string_literal: true

class AddUniquenessIndexToParticipantsAndUserResults < ActiveRecord::Migration[5.1]
  def change
    add_index :participants, %i[subject_id evaluator_id], unique: true
    add_index :users_results, %i[subject_id evaluator_id], unique: true
  end
end
