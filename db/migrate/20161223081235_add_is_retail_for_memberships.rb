class AddIsRetailForMemberships < ActiveRecord::Migration[5.0]
  def change
    add_column :memberships, :is_retail, :boolean, default: false
  end
end
