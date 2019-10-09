# frozen_string_literal: true

class RenameSecondFactorEnabledInClients < ActiveRecord::Migration[5.1]
  def change
    rename_column :clients, :second_factor_enabled, :two_factor_enabled
  end
end
