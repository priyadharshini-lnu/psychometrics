# frozen_string_literal: true

class AddAlreadyInvitedToMemberships < ActiveRecord::Migration[5.0]
  def up
    add_column :memberships, :already_invited, :boolean, default: false, null: false
    Membership.joins(:original_membership).update_all(already_invited: true)
    Membership.joins(:client).
      where(clients: { end_level: true,
                       ancestry_depth: Client::HIERARCHY_LEVEL[:project] }).
      update_all(already_invited: true)
  end

  def down
    remove_column :memberships, :already_invited, :boolean, default: false, null: false
  end
end
