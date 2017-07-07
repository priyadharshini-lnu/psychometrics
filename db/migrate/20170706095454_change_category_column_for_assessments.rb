class ChangeCategoryColumnForAssessments < ActiveRecord::Migration[5.0]
  def up
    change_column :assessments, :category, :string, default: nil
    execute 'DROP TYPE assessment_categories;'
  end

  def down
    raise 'No way back'
  end
end
