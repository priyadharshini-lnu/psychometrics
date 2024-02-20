class AddCampaignAssessorAssessmentFactorWeight < ActiveRecord::Migration[7.1]
  def change
    create_table :campaign_assessor_assessment_factor_weights do |t|
      t.references :campaign, null: false, foreign_key: { on_delete: :cascade }
      t.references :assessment, null: false, foreign_key: { on_delete: :cascade }
      t.references :factor, null: false, foreign_key: { on_delete: :cascade }
      t.float :weight, null: false, default: 1.0
    end
  end
end
