# frozen_string_literal: true

module Administration
  module Campaigns
    class TextModuleOverridesController < Administration::Campaigns::BaseController
      before_action :set_resource, only: %i[show destroy download pdf_preview toggle_user_access]
      before_action :find_user_report, only: %i[create update destroy]
      before_action :pundit_authorize

      def create
        form = ::Campaigns::TextModuleOverrides::CreateForm.from_params(params.merge(editor_id: current_user.id))
        if form.valid?
          result = TextModuleOverride.create!(form.attributes)
          audit! :create, result, payload: params.permit!, campaign: campaign
          @user_report.update!(approved: false)
          render json: result
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def update
        form = ::Campaigns::TextModuleOverrides::CreateForm.from_params(params.merge(editor_id: current_user.id))
        if form.valid?
          override = TextModuleOverride.find(params[:id])
          override.update!(form.attributes.merge(approved: false))
          audit! :update, override, payload: params.permit!, campaign: campaign
          @user_report.update!(approved: false)
          render json: override
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def approve
        result = ::Campaigns::TextModuleOverrides::Approve.call!(params, current_user)
        audit! :approve, result, payload: params.permit!, campaign: campaign
        render json: result
      end

      def destroy
        text_overrider = TextModuleOverride.find(params[:id])
        text_overrider.destroy!
        @user_report.update!(approved: false)
        head :ok
      end

      private

      def pundit_authorize
        authorize(
          resource || resource_class,
          nil,
          project_id: campaign.project_id
        )
      end

      def find_user_report
        @user_report = UserReport.find_by!(id: params[:user_report_id])
      end

      def resource_class
        TextModuleOverride
      end
    end
  end
end
