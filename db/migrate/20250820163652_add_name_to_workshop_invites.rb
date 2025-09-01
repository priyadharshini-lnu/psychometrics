# frozen_string_literal: true

class AddNameToWorkshopInvites < ActiveRecord::Migration[7.1]
  def change
    add_column :workshop_invites, :name, :string
  end
end
