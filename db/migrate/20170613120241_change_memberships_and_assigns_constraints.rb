class ChangeMembershipsAndAssignsConstraints < ActiveRecord::Migration[5.0]
  def change
    remove_foreign_key :memberships, :memberships
    add_foreign_key :memberships, :memberships, column: :project_membership_id, on_delete: :cascade

    remove_foreign_key :assigns, :assigns
    add_foreign_key :assigns, :assigns, column: :project_assign_id, on_delete: :cascade
  end
end
