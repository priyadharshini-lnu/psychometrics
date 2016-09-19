class AddRulesToAssessment < ActiveRecord::Migration[5.0]
  def change
    add_column :assessments, :norm_rules, :json
  end
end
