class PaperclipToCarrierwaveMigrate < ActiveRecord::Migration[5.0]
  def change
    rename_column :clients, :logo_file_name, :logo
    remove_column :clients, :logo_file_size
    remove_column :clients, :logo_content_type
    remove_column :clients, :logo_updated_at
  end
end
