class AddFlowToAssessment < ActiveRecord::Migration[5.0]
  def change
    add_column :assessments, :flow, :json
  end
end
