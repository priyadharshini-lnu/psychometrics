class AddProjectConstraintToMemberships < ActiveRecord::Migration[5.0]
  def change
    add_foreign_key :memberships, :memberships, column: :project_membership_id
  end
end
