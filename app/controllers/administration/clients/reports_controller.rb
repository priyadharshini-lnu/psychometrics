module Administration
  module Clients
    class ReportsController < Administration::ReportsController
      prepend_before_action :set_client

      private

      def init_breadcrumbs
        add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
        add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
        add_breadcrumb @client.decorate.display_name, '#'
        add_breadcrumb I18n.t('administration.breadcrumbs.reports'), { action: :index }
      end

      def set_client
        @client = policy_scope(Client).find(params[:client_id])
      end
    end
  end
end
