class AddContentVariationIdToSimulationUserAssessment < ActiveRecord::Migration[7.1]
  def change
    add_column :simulation_user_assessments, :content_variation_id, :string
  end
end
