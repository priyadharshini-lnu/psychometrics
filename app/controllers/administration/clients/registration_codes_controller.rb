# frozen_string_literal: true

module Administration
  module Clients
    class RegistrationCodesController < Administration::BaseController
      include Administration::Clients

      before_action :ensure_not_root
      before_action :set_resource, only: %i[edit update destroy toggle_status]
      prepend_before_action :set_resource_class
      append_before_action :init_breadcrumbs
      append_before_action :pundit_authorize

      def index
        @_filter_form = client.registration_codes.search(params[:q])
        @_resources = filter_form.result.page(params[:page])
        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def new
        @form = Administration::Clients::RegistrationCodes::SaveForm.new
      end

      def create
        @form = Administration::Clients::RegistrationCodes::SaveForm.
                from_params(params[:resource], end_level_id: client.id)
        if @form.valid?
          Administration::Clients::RegistrationCodes::Create.call!(@form, client)
        else
          render :new
        end
      end

      def edit
        @form = Administration::Clients::RegistrationCodes::SaveForm.
                from_model(resource)
      end

      def update
        @form = Administration::Clients::RegistrationCodes::SaveForm.
                from_params(params[:resource].merge(
                              end_level_id: resource.end_level_id,
                              project_id: resource.project_id,
                              use_count: resource.use_count
                            )).
                with_context(id: resource.id)
        if @form.valid?
          Administration::Clients::RegistrationCodes::Update.call!(@form, resource)
        else
          render :edit
        end
      end

      def destroy
        resource.destroy!
      end

      def toggle_status
        resource.toggle!(:disabled)
      end

      private

      # Set model class
      def set_resource_class
        @_resource_class ||= RegistrationCode # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def i18n
        'clients.registration_codes'
      end

      def init_breadcrumbs
        client_root_breadcrumb
        add_breadcrumb client.client.decorate.display_name, [:administration, client.client, :projects]

        if client.subtenancy?
          add_breadcrumb client.project.decorate.display_name,
                         administration_client_project_campaigns_path(client.client, client.project)
        end

        if client.sub_campaign?
          add_breadcrumb client.parent.decorate.display_name,
                         administration_client_project_campaign_sub_campaigns_path(
                           client.client, client.project, client.parent
                         )
        end
        add_breadcrumb client.decorate.display_name, administration_client_users_path(client)
        add_breadcrumb I18n.t('administration.clients.registration_codes.name'), action: :index
      end
    end
  end
end
