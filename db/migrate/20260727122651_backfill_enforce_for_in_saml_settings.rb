# frozen_string_literal: true

class BackfillEnforceForInSamlSettings < ActiveRecord::Migration[8.0]
  def up
    execute('UPDATE saml_settings SET enforce_for = 1 WHERE enforced = true')
  end

  def down
    # Nothing to do, enforce_for will just be removed by previous migration roll back
  end
end
