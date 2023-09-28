# frozen_string_literal: true

module Administration
  module Campaigns
    class TextModuleOverridesController < Administration::Campaigns::BaseController
      before_action :set_resource, only: %i[show destroy download pdf_preview toggle_user_access disapprove]
      before_action :find_user_report, only: %i[create update destroy]
      before_action :pundit_authorize

      def create
        form = ::Campaigns::TextModuleOverrides::CreateForm.from_params(params.merge(editor_id: current_user.id))
        if form.valid?
          result = TextModuleOverride.create!(form.attributes)
          audit! :create, result, payload: params, campaign: campaign
          create_event(@user_report, 'created_text', { module: result.module_id, content: result.content })
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
          audit! :update, override, payload: params, campaign: campaign
          create_event(@user_report, 'updated_text', { module: override.module_id, content: override.content })
          render json: override
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      def approve
        result = ::Campaigns::TextModuleOverrides::Approve.call!(params, current_user)
        audit! :approve, result, payload: params, campaign: campaign
        create_event(result.user_report, 'approved_text', { module: result.module_id })
        render json: result
      end

      def disapprove
        text_overrider = TextModuleOverride.find(params[:id])
        text_overrider.update(approved: false)
        audit! :disapprove, text_overrider, payload: params, campaign: campaign
        create_event(text_overrider.user_report, 'disapproved_text', { module: text_overrider.module_id })
        render json: text_overrider
      end

      def destroy
        text_overrider = TextModuleOverride.find(params[:id])
        text_overrider.destroy!
        create_event(text_overrider.user_report, 'removed_text',
                     { module: text_overrider.module_id, content: text_overrider.content })
        head :ok
      end

      private

      def create_event(resource, event, details)
        UserReportEvent.create!(
          user_report_id: resource.id,
          initiator_id: current_user.id,
          event_type: event,
          details: details
        )
      end

      def pundit_authorize
        authorize(
          resource || resource_class,
          nil,
          project_id: campaign.project_id,
          user_report_id: params[:user_report_id]
        )
      end

      def find_user_report
        @user_report = UserReport.find(params[:user_report_id])
      end

      def resource_class
        TextModuleOverride
      end
    end
  end
end
