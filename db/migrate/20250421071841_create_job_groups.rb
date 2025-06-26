# frozen_string_literal: true

class CreateJobGroups < ActiveRecord::Migration[7.1]
  def change
    create_table :job_groups do |t|
      t.references :project, null: true, foreign_key: { to_table: :clients }
      t.string :name, null: false
      t.string :ancestry, index: true
      t.integer :ancestry_depth, default: 0

      t.timestamps
    end

    add_index :job_groups, %i[project_id name], unique: true
  end
end
