# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class EmailSchedulesController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[send_test_email]
      append_before_action :pundit_authorize

      def create
        form = ::Threesixty::EmailScheduleForm.from_params(params[:email_schedule])
        if form.valid?
          email_schedule = threesixty_campaign.email_schedules.create!(form.attributes)
          ::Threesixty::Emails::SendSingleScheduledEmail.call!(email_schedule)
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: :bad_request
        end
      end

      def show
        email_schedule = threesixty_campaign.email_schedules.find(params[:id])

        recipients = ActiveModel::SerializableResource.
                     new(email_schedule.recipients, each_serializer: UserSerializer).
                     serializable_hash

        render json: { email_schedule: email_schedule, recipients: recipients }
      end

      def schedulable_templates
        email_schedules = threesixty_campaign.email_templates.where(schedulable: true).to_a
        email_schedules.prepend(
          id: 'custom_message',
          name: 'custom_message',
          from: current_user.decorate.display_name,
          content: '',
          reply_to_email: current_user.email
        )
        render json: email_schedules
      end

      def recipient_by_criteria
        users = ::Threesixty::Emails::RecipientByCriteria.call!(
          threesixty_campaign: threesixty_campaign,
          email_name: params[:email_name],
          recipient_criteria: params[:recipient_criteria]
        )

        render json: users, each_serializer: UserSerializer
      end

      private

      def set_resource_class
        @_resource_class ||= ::Threesixty::EmailSchedule # rubocop:disable Naming/MemoizedInstanceVariableName
      end
    end
  end
end
