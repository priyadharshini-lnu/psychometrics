module Features
  module Helpers
    module Users
      def create_subclient_user(subclient, opts = {})
        visit administration_client_users_path(subclient.id)
        click_on t('administration.users.index.add')
        within '#new_resource' do
          fill_in 'resource_email', with: opts[:email]
          fill_in 'resource_first_name', with: opts[:first_name]
          fill_in 'resource_last_name', with: opts[:last_name]
          click_on t('administration.create')
        end
        wait_for_ajax
        User.last
      end

      def edit_user_privileges(client, membership)
        visit edit_administration_client_user_path(client, membership)
        find('#resource_user_attributes_grants_norms_view', visible: false).trigger('click')
        find('#resource_user_attributes_grants_norms_manage', visible: false).trigger('click')
        find('#resource_user_attributes_grants_dimensions_view', visible: false).trigger('click')
        click_on t('administration.update')
      end
    end
  end
end
