class AddColumnsToMemberships < ActiveRecord::Migration[5.0]
  def change
    change_table :memberships do |t|
      t.column :project_membership_id, :integer, index: true
    end

    reversible do |dir|
      dir.up do
        Membership.find_each do |membership|
          next if membership.client.root? || membership.client.project?
          project_membership = Membership.create(client_id: membership.client.project.id, user_id: membership.user_id)
          membership.update_column(:project_membership_id, project_membership.id)
        end
      end
      dir.down do
        Membership.find_each do |membership|
          membership.destroy if membership.client.applicable_level != 'project'
        end
      end
    end
  end
end
