# frozen_string_literal: true

class AddUniqueIndexOnParticipantsAndUserResults < ActiveRecord::Migration[5.1]
  def change
    remove_index :threesixty_participants, column: %i[subject_id evaluator_id], unique: true
    remove_index :users_results, column: %i[subject_id evaluator_id], unique: true

    add_index :threesixty_participants, %i[subject_id evaluator_id campaign_id], unique: true,
      name: :participants_subject_evaluator_campaign
    add_index :users_results, %i[subject_id evaluator_id campaign_id], unique: true,
      name: :users_results_subject_evaluator_campaign
  end
end
