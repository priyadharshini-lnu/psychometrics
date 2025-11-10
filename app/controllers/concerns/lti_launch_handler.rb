# frozen_string_literal: true

module LtiLaunchHandler
  extend ActiveSupport::Concern

  class_methods do
    def lti_launch(action_name, integration:, permit_params:)
      define_method(action_name) do
        permitted_params = instance_exec(params, &permit_params)
        context = default_lti_launch_context.merge(integration: integration, params: permitted_params)

        result = ::Lti::StartLaunch.call(context)

        if result[:ok]
          launch_data = result[:ok]
          render json: launch_data, status: :ok
        else
          render json: { error: result[:error] }, status: :unprocessable_entity
        end
      end
    end
  end

  private

  def default_lti_launch_context
    {
      project: @current_project,
      current_user: current_user,
      meta: meta_data
    }.compact
  end

  def meta_data
    {}
  end
end
