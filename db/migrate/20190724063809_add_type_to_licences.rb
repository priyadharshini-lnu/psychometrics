class AddTypeToLicences < ActiveRecord::Migration[5.1]
  def change
    add_column :licenses, :type, :integer, default: 0
  end
end
