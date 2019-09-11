# frozen_string_literal: true

class Amend360Relations < ActiveRecord::Migration[5.1]
  def change
    remove_column :participants, :subject_id
    remove_column :participants, :evaluator_id
    add_reference :participants, :subject, foreign_key: { to_table: :users, on_delete: :restrict }
    add_reference :participants, :evaluator, foreign_key: { to_table: :users, on_delete: :restrict }

    remove_column :threesixty_subjects, :campaigns_user_id
    add_reference :threesixty_subjects, :user, foreign_key: { on_delete: :restrict }

    remove_column :assigns, :evaluator_id
    remove_column :assigns, :subject_id

    add_reference :assigns, :evaluator, foreign_key: { to_table: :users, on_delete: :restrict }
    add_reference :assigns, :subject, foreign_key: { to_table: :users, on_delete: :restrict }
  end
end
