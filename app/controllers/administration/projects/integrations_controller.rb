# frozen_string_literal: true

module Administration
  module Projects
    class IntegrationsController < Administration::Projects::BaseController
      before_action :set_resource, only: %i[update destroy]

      def index
        integrations = policy_scope(resource_class).where(project_id: project.id)
        render json: Panko::ArraySerializer.new(
          integrations,
          each_serializer: ::Administration::Projects::IntegrationSerializer
        ).to_a
      end

      def create
        form = form_class.from_params(resource_params).with_context(project: project)
        if form.valid?
          integration = project.integrations.create!(form.attributes)
          audit! :create, integration, payload: resource_params.except(:password), project: project
          render json: ::Administration::Projects::IntegrationSerializer.new.serialize(integration)
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def load_mettl_assessments
        Mettl::FetchSingleProjectAssessmentsJob.perform_later(params[:project_id])
        render json: { message: I18n.t('administration.integrations.load_mettl_success') }, status: :ok
      end

      def update
        form = form_class.from_params(resource_params).with_context(project: project, integration: resource)
        if form.valid?
          resource.update!(form.attributes)
          audit! :update, resource, payload: resource_params.except(:password), project: project
          render json: ::Administration::Projects::IntegrationSerializer.new.serialize(resource)
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
          'iiht' => Integrations::IihtForm,
          'hogan' => Integrations::HoganForm,
          'mettl' => Integrations::MettlForm
        }[resource_params[:name]]
      end

      def resource_class
        @resource_class ||= ::Integration
      end
    end
  end
end
