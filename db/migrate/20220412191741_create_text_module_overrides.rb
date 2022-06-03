# frozen_string_literal: true

class CreateTextModuleOverrides < ActiveRecord::Migration[5.2]
  def change
    create_table :text_module_overrides do |t|
      t.integer :module_id
      t.integer :user_report_id
      t.integer :editor_id
      t.text :content
      t.boolean :approved, default: false

      t.references :reports_modules, foreign_key: { on_delete: :cascade }
      t.references :user_report, foreign_key: { on_delete: :cascade }
      t.references :editor, :foreign_key

      t.timestamps
    end
  end
end
