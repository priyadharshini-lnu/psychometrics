module Administration
  module Clients
    class ReportsController < Administration::ReportsController
      prepend_before_action :set_client
      append_before_action :init_breadcrumbs

      # GET /administration/resources
      def index
        @filterrific = initialize_filterrific(
          @client.reports,
          params[:filterrific],
          select_options: {
            with_assessment_category: ['all', *Assessment.options_for_with_category]
          }
        ) || return
        @resources = @filterrific.find.preload(:assessment).page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      private

      def init_breadcrumbs
        add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
        add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
        add_breadcrumb @client.decorate.display_name, '#'
        add_breadcrumb I18n.t('administration.breadcrumbs.reports'), { action: :index }
      end

      def set_client
        @client = policy_scope(Client).enabled.find(params[:client_id])
      end
    end
  end
end
