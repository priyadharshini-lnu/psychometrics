class AddDisabledToLicenses < ActiveRecord::Migration[5.1]
  def change
    add_column :licenses, :disabled, :boolean, default: false
  end
end
