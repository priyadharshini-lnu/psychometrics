class CreateNominationRequirements < ActiveRecord::Migration[5.1]
  def change
    create_table :threesixty_nomination_requirements do |t|
      t.belongs_to :threesixty_campaign, foreign_key: { on_delete: :restrict }, index: { name: :threesixty_nomination_requirements_cam_id }
      t.jsonb :subject_conditions, default: []
      t.jsonb :conditions, default: []
      t.timestamps
    end
  end
end
