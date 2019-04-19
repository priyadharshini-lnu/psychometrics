class CreateSubjectRelationshipCounters < ActiveRecord::Migration[5.1]
  def change
    create_table :threesixty_evaluators do |t|
      t.belongs_to :campaign, foreign_key: { on_delete: :restrict }
      t.belongs_to :user, foreign_key: { on_delete: :restrict }
      t.integer :role, default: 0
      t.integer :evaluations_count, default: 0
      t.integer :completed_evaluations_count, default: 0
      t.timestamps
    end

    create_table :threesixty_subjects_relationships do |t|
      t.belongs_to :campaign, foreign_key: { on_delete: :restrict }
      t.belongs_to :subject, foreign_key: { to_table: :campaigns_users, on_delete: :restrict }
      t.belongs_to :relationship, foreign_key: { on_delete: :restrict }
      t.integer :completed_evaluators_count, default: 0
      t.integer :approved_evaluators_count, default: 0
      t.timestamps
    end

    add_column :threesixty_subjects, :report_approval_status, :integer, default: 0
    add_column :threesixty_subjects, :evaluators_count, :integer, default: 0
    add_column :threesixty_subjects, :completed_evaluators_count, :integer, default: 0
    change_column :threesixty_options, :participants, :jsonb, default: {}
    change_column :threesixty_options, :messages, :jsonb, default: {}
    change_column :threesixty_options, :reports, :jsonb, default: {}
  end
end
