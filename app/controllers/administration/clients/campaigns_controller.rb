module Administration
  module Clients
    class CampaignsController < Administration::ClientsController
      def index
        @filter_form = policy_scope(client).campaigns.includes(:parent, :license_usages).search(params[:q])
        @filter_form.archived
        @filter_form.archived_true ||= false
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
    end
  end
end
