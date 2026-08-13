# frozen_string_literal: true

class AddDomainEnforcementToClientSsoSettings < ActiveRecord::Migration[8.0]
  def up
    change_table :client_sso_settings, bulk: true do |t|
      t.integer :enforce_for, default: 0, null: false
      t.text :enforced_domains, array: true, default: []
    end

    execute <<-SQL.squish
      UPDATE client_sso_settings SET enforce_for = 1 WHERE sso_enforced = true;
    SQL
  end

  def down
    change_table :client_sso_settings, bulk: true do |t|
      t.remove :enforced_domains
      t.remove :enforce_for
    end
  end
end
