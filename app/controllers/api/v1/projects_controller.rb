# frozen_string_literal: true

module Api
  module V1
    class ProjectsController < Api::V1::BaseController
      def create
        form = Api::V1::Projects::CreateForm.from_params(params)
        if form.valid?
          normalized_params = ::Projects::NormalizeAPIRequest.call!(project_params)
          project = ::Projects::Create.call!(normalized_params, current_user)
          WebhookSubscriptions::Save.call!(project, project_params[:webhook])
          render json: project, serializer: Api::V1::ProjectSerializer
        else
          render_validation_errors(form)
        end
      end

      def update
        form = Api::V1::Projects::UpdateForm.from_params(params)
        if form.valid?
          normalized_params = ::Projects::NormalizeAPIRequest.call!(project_params)
          project.update!(normalized_params)
          WebhookSubscriptions::Save.call!(project, project_params[:webhook])
          render json: project, serializer: Api::V1::ProjectSerializer
        else
          render_validation_errors(form)
        end
      end

      def project_params
        params.permit(
          :name, :subdomain, :client_reference, :data_processing_consent, :enable_strong_password, :enable_2factor_auth,
          :project_logo, :partner_logo, :background_image, :background_color, :login_box_position, :client_id,
          :webhook, locales: []
        )
      end
    end
  end
end
