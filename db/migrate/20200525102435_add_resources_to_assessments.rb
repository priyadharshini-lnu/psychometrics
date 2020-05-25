class AddResourcesToAssessments < ActiveRecord::Migration[5.1]
  def change
    add_column :assessments, :resources, :json
  end
end
