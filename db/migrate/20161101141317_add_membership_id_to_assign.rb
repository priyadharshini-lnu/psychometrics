class AddMembershipIdToAssign < ActiveRecord::Migration[5.0]
  def change
    add_reference :assigns, :membership
  end
end
