# frozen_string_literal: true

module Administration
  module Clients
    class SubCampaignsController < Administration::ClientsController
      include Administration::Clients
      before_action :ensure_client

      def index
        @_filter_form = policy_scope(resource_class).
                        sub_campaigns_of(client.id).
                        includes(
                          :assessments_clients,
                          :assessments,
                          :creator,
                          :modifier
                        )
                        .search(params[:q])

        filter_form.disabled_true ||= false
        @_resources = filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def i18n
        'clients.sub_campaigns'
      end

      private

      def init_breadcrumbs
        client_root_breadcrumb
        add_breadcrumb client.decorate.display_name, action: :index
      end
    end
  end
end
