class AddSelectedLocaleToAssign < ActiveRecord::Migration[5.1]
  def change
    add_column :assigns, :selected_locale, :string
  end
end
