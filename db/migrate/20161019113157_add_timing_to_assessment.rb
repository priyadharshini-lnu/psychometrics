class AddTimingToAssessment < ActiveRecord::Migration[5.0]
  def change
    add_column :assessments, :timing, :string
  end
end
