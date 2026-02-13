# frozen_string_literal: true

module Api
  class V2::Administration::WritingAssistantsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction

    def assist
      result_generator = ::AI::WritingAssistance::ResultGenerator.new(
        user: current_user,
        text: assist_params[:text],
        operations: assist_params[:operations],
        user_locale: assist_params[:user_locale]
      )

      result_generator.
        on(:ok) do |response|
        render json: response, status: :ok
      end.
        on(:error) do |error|
          jsonapi_render_errors [{ detail: error }], status: :unprocessable_entity
        end.
        call
    end

    private

    def assist_params
      params.require(:data).require(:attributes).permit(
        :text,
        :user_locale,
        operations: [:type, { options: {} }]
      )
    end

    def pundit_authorize
      authorize(
        nil,
        nil,
        policy_class: Api::Administration::WritingAssistantPolicy
      )
    end
  end
end
