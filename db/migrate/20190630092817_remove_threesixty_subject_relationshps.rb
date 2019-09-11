# frozen_string_literal: true

class RemoveThreesixtySubjectRelationshps < ActiveRecord::Migration[5.1]
  def change
    drop_table :threesixty_subjects_relationships
  end
end
