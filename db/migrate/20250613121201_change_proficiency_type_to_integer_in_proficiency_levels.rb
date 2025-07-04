# frozen_string_literal: true

class ChangeProficiencyTypeToIntegerInProficiencyLevels < ActiveRecord::Migration[7.1]
  def up
    change_column :proficiency_levels, :proficiency_type, :integer, using: 'proficiency_type::integer'
  end

  def down
    change_column :proficiency_levels, :proficiency_type, :string
  end
end
