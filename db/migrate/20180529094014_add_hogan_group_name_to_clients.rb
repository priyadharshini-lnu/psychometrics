# frozen_string_literal: true

class AddHoganGroupNameToClients < ActiveRecord::Migration[5.1]
  def change
    add_column :clients, :hogan_group_name, :string

    reversible do |dir|
      dir.up do
        Client.find_each do |client|
          client.update_column(:hogan_group_name, client.set_hogan_group_name) if client.project?
        end
      end
    end
  end
end
