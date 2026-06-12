# frozen_string_literal: true

class RenameClientIdToTenantIdInSessionsAndClientSsoSettings < ActiveRecord::Migration[8.0]
  def change
    if column_exists?(:sessions, :client_id)
      rename_column :sessions, :client_id, :tenant_id

      if index_exists?(:sessions, :tenant_id, name: 'index_sessions_on_client_id')
        rename_index :sessions, 'index_sessions_on_client_id', 'index_sessions_on_tenant_id'
      end

      if index_exists?(:sessions, %i[user_id tenant_id impersonator_id], name: 'idx_sessions_user_client_impersonator')
        rename_index :sessions, 'idx_sessions_user_client_impersonator', 'idx_sessions_user_tenant_impersonator'
      end
    end

    if column_exists?(:client_sso_settings, :client_id)
      rename_column :client_sso_settings, :client_id, :tenant_id

      if index_exists?(:client_sso_settings, :tenant_id, name: 'index_client_sso_settings_on_client_id')
        rename_index :client_sso_settings, 'index_client_sso_settings_on_client_id',
                     'index_client_sso_settings_on_tenant_id'
      end
    end
  end
end
