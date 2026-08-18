# frozen_string_literal: true

module Api
  module V1
    class ProjectsController < Api::V1::BaseController
      skip_before_action :ensure_project, only: %i[create index]
      DESIGN_ATTRIBUTES = %i[logo background secondary_logo login_box_position background_color
                             logo_alt_text secondary_logo_alt_text].freeze
      SECURITY_SETTINGS = %i[enforce_strong_password tfa_enabled].freeze

      def index
        client = Client.find_by(id: params[:client_id])

        projects = client.projects
        render json: Panko::ArraySerializer.new(
          projects,
          each_serializer: Api::V1::ProjectSerializer
        ).to_a
      end

      def show
        render json: Api::V1::ProjectSerializer.new.serialize(project)
      end

      def create
        form = Api::V1::Projects::CreateForm.from_params(params)
        if form.valid?
          normalized_params = ::Projects::NormalizeApiRequest.call!(project_params)
          project = ::Projects::Create.call!(normalized_params.except(*DESIGN_ATTRIBUTES), current_user)
          project.design_setting.update!(normalized_params.slice(*DESIGN_ATTRIBUTES))
          WebhookSubscriptions::Save.call!(project, project_params[:webhook])
          audit! :api_create, project, payload: params, project: project
          render json: Api::V1::ProjectSerializer.new.serialize(project)
        else
          render_validation_errors(form)
        end
      end

      def update
        form = Api::V1::Projects::UpdateForm.from_params(params).with_context(project: project)
        if form.valid?
          normalized_params = ::Projects::NormalizeApiRequest.call!(project_params)
          Mobility.with_locale(params[:locale]) if params[:locale].present?
          project.update!(normalized_params.except(*DESIGN_ATTRIBUTES, *SECURITY_SETTINGS))
          project.design_setting.update!(normalized_params.slice(*DESIGN_ATTRIBUTES))
          project.security_setting.update!(normalized_params.slice(SECURITY_SETTINGS))
          WebhookSubscriptions::Save.call!(project, project_params[:webhook])
          audit! :api_update, project, payload: params, project: project
          render json: Api::V1::ProjectSerializer.new.serialize(project)
        else
          render_validation_errors(form)
        end
      end

      private

      def project_id
        params[:id]
      end

      def pundit_authorize
        if project_params[:client_id].present? && !Client.exists?(id: project_params[:client_id])
          raise Api::Errors::ResourceNotFound, "Client with id=#{params[:client_id]} is not found"
        end

        authorize(
          @project || Client,
          nil,
          policy_class: ::Administration::ProjectPolicy,
          project_id: @project&.id || project_params[:client_id]
        )
      end

      def project_params
        params.permit(
          :name, :subdomain, :client_reference, :data_processing_consent, :enable_strong_password, :enable_2factor_auth,
          :project_logo, :partner_logo, :background_image, :background_color, :login_box_position, :logo_alt_text,
          :secondary_logo_alt_text, :client_id, :webhook, :campaign_dashboard_instructions, :locale, locales: []
        )
      end
    end
  end
end
