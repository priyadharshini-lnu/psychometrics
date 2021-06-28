# frozen_string_literal: true

class AddIndexToMembership < ActiveRecord::Migration[5.2]
  def change
    add_index :memberships, :client_id
  end
end
