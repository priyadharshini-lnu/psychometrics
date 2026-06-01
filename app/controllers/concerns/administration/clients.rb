# frozen_string_literal: true

module Administration
  module Clients
    private

    def ensure_not_root
      redirect_to administration_clients_path if client.root?
    end

    def ensure_client
      client || raise(Pundit::NotAuthorizedError)
    end

    def ensure_project
      project || raise(Pundit::NotAuthorizedError)
    end

    def ensure_campaign
      campaign || raise(Pundit::NotAuthorizedError)
    end

    def client_root_breadcrumb
      if Current.client_admin_context?
        add_breadcrumb Current.client.name, nil
      elsif current_user.is?(:superadmin)
        add_breadcrumb t('administration.breadcrumbs.clients'), %i[administration root]
      else
        add_breadcrumb t('administration.breadcrumbs.home'), %i[administration root]
      end
    end
  end
end
