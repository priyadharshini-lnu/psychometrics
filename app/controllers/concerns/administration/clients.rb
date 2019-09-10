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
      label = t('administration.breadcrumbs.clients') if current_user.is?(:superadmin)
      label ||= t('administration.breadcrumbs.home')
      add_breadcrumb label, %i[administration root]
    end
  end
end
