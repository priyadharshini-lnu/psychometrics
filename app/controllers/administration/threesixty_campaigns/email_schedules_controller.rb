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
        render json: threesixty_campaign.email_templates.where(category: ['invitations', 'reminders'])
      end

      private

      def set_resource_class
        @_resource_class ||= ::Threesixty::EmailSchedule
      end
    end
  end
end
