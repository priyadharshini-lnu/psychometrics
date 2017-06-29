class ChangeRoleForMemberships < ActiveRecord::Migration[5.0]
  def up
    rename_column :memberships, :role, :old_role
    add_column :memberships, :role, :integer, default: 0, null: false

    Membership.all.each do |membership|
      membership.role = Membership.roles[membership.old_role]
      membership.save!
    end
    remove_column :memberships, :old_role
  end

  def down
    raise "No way back"
  end
end
