class AddSecondFactorEnabledToClients < ActiveRecord::Migration[5.1]
  def change
    add_column :clients, :second_factor_enabled, :boolean, default: false
  end
end
