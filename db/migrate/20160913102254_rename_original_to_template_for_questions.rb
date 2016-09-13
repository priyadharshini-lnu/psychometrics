class RenameOriginalToTemplateForQuestions < ActiveRecord::Migration[5.0]
  def change
    rename_column :questions, :original_id, :template_id
    rename_column :blocks, :original_id, :template_id
  end
end
