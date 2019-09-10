# frozen_string_literal: true

module Administration
  module Clients
    class DatasheetRowsController < Administration::BaseController
      include Administration::Clients
      prepend_before_action :set_resource_class
      before_action :ensure_project
      before_action :set_resource, only: %i[destroy]
      append_before_action :init_breadcrumbs, except: %i[new create]
      append_before_action :pundit_authorize

      def index
        @_filter_form = policy_scope(resource_class).search(params[:q])
        @_resources = filter_form.
                      result.
                      joins(:datasheet).
                      where(datasheets: { project_id: project.id }).
                      page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def new
        @form = ::Datasheets::DatasheetForm.new
      end

      def create
        @form = ::Datasheets::DatasheetForm.from_params(params)
        ::Datasheets::ParseFile.call(@form, project) do
          on(:invalid) { render :new }
        end
      end

      def destroy
        resource.destroy
      end

      def i18n
        'clients.datasheet_rows'
      end

      private

      def set_resource_class
        @_resource_class ||= ::DatasheetRow # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def set_resource
        @_resource = policy_scope(resource_class).find(params[:id])
      end

      def init_breadcrumbs
        client_root_breadcrumb
        add_breadcrumb client.client.decorate.display_name, [:administration, client.client, :projects]
        if client.subtenancy?
          add_breadcrumb(
            client.project.decorate.display_name,
            administration_client_project_campaigns_path(client.client, client.project)
          )
        end
        add_breadcrumb t('administration.breadcrumbs.datasheets'), action: :index
      end
    end
  end
end
