# frozen_string_literal: true

class AddLastAccessedAtToOracleCredential < ActiveRecord::Migration[7.1]
  def change
    add_column :oracle_credentials, :last_accessed_at, :datetime
  end
end
