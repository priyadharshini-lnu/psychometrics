# frozen_string_literal: true

module Administration
  module Campaigns
    class SmsRecordsController < Administration::Campaigns::BaseController
      def create
        form = SmsRecords::Form.from_params(resource_params).with_context(project:)
        if form.valid?
          sms_record = campaign.sms_records.create(form.attributes.merge(creator: current_user))
          AdminJob.call(:send_sms_invites, {
            campaign_id: params[:new_campaign_id],
            sms_record_id: sms_record.id
          }, current_user)

          head :ok
        else
          render json: { errors: form.errors.messages }, status: 422
        end
      end

      private

      def resource_class
        @resource_class ||= SmsRecord
      end

      def pundit_authorize
        authorize(
          resource || resource_class,
          nil,
          project_id: project.id,
          campaign_id: campaign.id,
          policy_class: Administration::Campaigns::SmsInvitePolicy
        )
      end
    end
  end
end
