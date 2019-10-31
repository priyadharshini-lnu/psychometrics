# frozen_string_literal: true

class AddUniversalLinksEnabledToAssessmentsClients < ActiveRecord::Migration[5.1]
  def change
    add_column :assessments_clients, :enable_universal_links, :boolean, default: false
  end
end
