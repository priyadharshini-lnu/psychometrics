module Administration
  module Clients
    class CampaignsController < Administration::ClientsController
      before_action :ensure_client

      def index
        @filter_form = policy_scope(@resource_class).campaigns_of(client.id).includes(:license_usages).search(params[:q])
        @filter_form.disabled_true ||= false
        @resources = @filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def i18n
        'clients.campaigns'
      end

      private

      def init_breadcrumbs
        add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
        add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
        add_breadcrumb client.decorate.display_name, { action: :index }
      end

      def ensure_client
        client || raise(Pundit::NotAuthorizedError)
      end
    end
  end
end
