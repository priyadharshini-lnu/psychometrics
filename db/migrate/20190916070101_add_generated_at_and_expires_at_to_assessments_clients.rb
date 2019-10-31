# frozen_string_literal: true

class AddGeneratedAtAndExpiresAtToAssessmentsClients < ActiveRecord::Migration[5.1]
  def change
    add_column :assessments_clients, :key_generated_at, :datetime
    add_column :assessments_clients, :key_expires_at, :datetime
  end
end
