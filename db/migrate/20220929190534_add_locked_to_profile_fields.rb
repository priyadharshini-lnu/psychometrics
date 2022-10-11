class AddLockedToProfileFields < ActiveRecord::Migration[6.1]
  def change
    add_column :profile_fields, :locked, :boolean
  end
end
