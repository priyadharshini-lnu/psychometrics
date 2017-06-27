class AddEndLevelToClients < ActiveRecord::Migration[5.0]
  def change
    add_column :clients, :end_level, :boolean, default: false, index: true
    add_index :clients, :end_level

    reversible do |dir|
      dir.up { Client.all.each { |c| c.update_column(:end_level, true) if c.prime_project? || c.deep_project? } }
    end
  end
end
