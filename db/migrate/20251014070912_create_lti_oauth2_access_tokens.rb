# frozen_string_literal: true

class CreateLtiOauth2AccessTokens < ActiveRecord::Migration[7.1]
  def change
    create_table :lti_oauth2_access_tokens do |t|
      t.string :token_hash, null: false, index: { unique: true }
      t.references :project, foreign_key: { to_table: :clients, on_delete: :cascade }
      t.string :integration_id
      t.string :scope
      t.datetime :expires_at, null: false
      t.datetime :last_used_at
      t.boolean :revoked, default: false

      t.timestamps
    end

    add_index :lti_oauth2_access_tokens, :expires_at
    add_index :lti_oauth2_access_tokens, :integration_id
    add_index :lti_oauth2_access_tokens, %i[project_id expires_at]
  end
end
