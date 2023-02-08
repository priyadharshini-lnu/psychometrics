class CreatePearsonAssessment < ActiveRecord::Migration[6.1]
  def change
    create_table :pearson_assessments do |t|
      t.string :product_id, uniq: true, null: false
      t.string :title, null: false
      t.jsonb :norms
      t.jsonb :languages
    end
    DeploymentTask.add('Run Pearson::LoadAssessmentsToTable.call!')
  end
end
