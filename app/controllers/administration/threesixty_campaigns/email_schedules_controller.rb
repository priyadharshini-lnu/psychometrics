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
          ::Threesixty::EmailSchedule.create!(form.attributes)
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: :bad_request
        end
      end

      def schedulable_templates
        # render json: threesixty_campaign.email_schedules
        render json: [
          {
            id: 1,
            name: 'subject_invite',
            from: 'The Talent Enterprise1',
            reply_to_email: 'no1@cc.com',
            subject: 'Subject1',
            content: 'Content1',
            scheduled_date: Time.now,
          },
          {
            id: 2,
            name: 'evaluator_invite',
            from: 'The Talent Enterprise2',
            reply_to_email: 'no2@cc.com',
            subject: 'Subject2',
            content: 'Content2',
            scheduled_date: Time.now,
            recipient_criteria: [
              {
                field: 'Name or Email',
                comparator: 'starts_with',
                value: 'rohan',
              },
              {
                comparator: 'has_relationship',
                value: 'Peer',
              },
              {
                field: 'datasheet.gender',
                comparator: 'equal',
                value: 'male',
              },
            ],
          },
        ]
      end

      private

      def set_resource_class
        @_resource_class ||= ::Threesixty::EmailSchedule
      end
    end
  end
end
