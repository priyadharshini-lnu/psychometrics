# frozen_string_literal: true

class RemoveUnusedFieldsFromTextOverrides < ActiveRecord::Migration[5.2]
  def change
    remove_reference :text_module_overrides, :reports_modules
    remove_reference :text_module_overrides, :foreign_key
    add_foreign_key :text_module_overrides, :reports_modules, column: :module_id, on_delete: :cascade
    add_foreign_key :text_module_overrides, :users, column: :editor_id
  end
end
