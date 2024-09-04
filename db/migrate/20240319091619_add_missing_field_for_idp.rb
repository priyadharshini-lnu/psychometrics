class AddMissingFieldForIdp < ActiveRecord::Migration[7.1]
  def change
    add_reference :idp_template_skills, :factor, foreign_key: { on_delete: :restrict }
    add_column :idp_template_skills, :assessment_score_type, :integer, default: 0, null: false
    add_column :development_actions, :image, :string
  end
end
