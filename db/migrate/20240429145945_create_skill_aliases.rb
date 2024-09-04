class CreateSkillAliases < ActiveRecord::Migration[7.1]
  def change
    create_table :skill_aliases do |t|
      t.references :client, null: false, foreign_key: { on_delete: :cascade }
      t.references :skill, null: false, foreign_key: { on_delete: :cascade }
      t.string :name, null: false

      t.timestamps null: false
    end
  end
end
