class CreateThreesixtyInstructionTemplates < ActiveRecord::Migration[5.1]
  def change
    create_table :threesixty_instruction_templates do |t|
      t.belongs_to :threesixty_campaign, foreign_key: { on_delete: :restrict }, index: { name: :threesixty_instruction_templates_cam_id }
      t.string :name, null: false
      t.text :content
      t.boolean :enabled, default: true

      t.timestamps
    end
  end
end
