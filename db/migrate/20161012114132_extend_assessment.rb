class ExtendAssessment < ActiveRecord::Migration[5.0]
  def change
    add_reference :questions, :assessment
    add_column :assessments, :description, :text
  end
end
