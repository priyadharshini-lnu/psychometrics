# frozen_string_literal: true

module Administration
  module Projects
    class IntegrationsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update destroy]

      def index
        integrations = policy_scope(resource_class).where(project_id: project.id)
        render json: integrations, each_serializer: Administration::Projects::IntegrationSerializer
      end

      def create
        form = form_class.from_params(resource_params).with_context(project: project)
        if form.valid?
          integration = project.integrations.create!(form.attributes)
          audit! :create, integration, payload: resource_params.except(:password), project: project
          render json: integration, serializer: ::Administration::Projects::IntegrationSerializer
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def update
        form = form_class.from_params(resource_params).with_context(project: project, integration: resource)
        if form.valid?
          resource.update!(form.attributes)
          audit! :update, resource, payload: resource_params.except(:password), project: project
          render json: resource, serializer: ::Administration::Projects::IntegrationSerializer
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def destroy
        resource.destroy!
        audit! :delete, resource, payload: resource.log_attribute_for_delete, project: project

        render json: resource.id
      end

      private

      def form_class
        @form_class ||= {
          'iiht' => Integrations::IihtForm
        }[resource_params[:name]]
      end

      def resource_class
        @resource_class ||= ::Integration
      end
    end
  end
end
