# frozen_string_literal: true

class AddSpoofedByIdToUsers < ActiveRecord::Migration[8.0]
  def change
    add_reference :users, :spoofed_by, foreign_key: { to_table: :users }, null: true
  end
end
