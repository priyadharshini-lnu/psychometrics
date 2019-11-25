# frozen_string_literal: true

module Administration
  module Clients
    class CampaignsController < Administration::ClientsController
      include Administration::Clients
      before_action :ensure_client

      def index
        @filter_term = params.dig(:q, :filterable_fields)
        @_filter_form = policy_scope(resource_class).
                        campaigns_of(client.id).
                        includes(:reports, :creator, :modifier).
                        ransack(params[:q])

        filter_form.disabled_true ||= false
        @_resources = filter_form.result.page(params[:page])

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
        client_root_breadcrumb
        add_breadcrumb client.decorate.display_name, action: :index
      end
    end
  end
end
