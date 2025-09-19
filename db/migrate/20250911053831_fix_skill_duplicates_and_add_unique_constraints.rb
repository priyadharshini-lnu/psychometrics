# frozen_string_literal: true

class FixSkillDuplicatesAndAddUniqueConstraints < ActiveRecord::Migration[7.1]
  def up
    # Clean up duplicate questions and factors
    execute <<-SQL.squish
      DELETE FROM questions
      WHERE id NOT IN (
        SELECT MAX(id)
        FROM questions
        WHERE skill_id IS NOT NULL
        GROUP BY skill_id
      ) AND skill_id IS NOT NULL;
    SQL

    execute <<-SQL.squish
      DELETE FROM factors
      WHERE id NOT IN (
        SELECT MAX(id)
        FROM factors
        WHERE skill_id IS NOT NULL
        GROUP BY skill_id
      ) AND skill_id IS NOT NULL;
    SQL

    # Remove existing non-unique indexes
    remove_index :questions, :skill_id if index_exists?(:questions, :skill_id)
    remove_index :factors, :skill_id if index_exists?(:factors, :skill_id)

    # Add unique indexes
    add_index :questions, :skill_id, unique: true, where: 'skill_id IS NOT NULL'
    add_index :factors, :skill_id, unique: true, where: 'skill_id IS NOT NULL'
  end

  def down
    remove_index :questions, :skill_id if index_exists?(:questions, :skill_id)
    remove_index :factors, :skill_id if index_exists?(:factors, :skill_id)

    add_index :questions, :skill_id
    add_index :factors, :skill_id
  end
end
