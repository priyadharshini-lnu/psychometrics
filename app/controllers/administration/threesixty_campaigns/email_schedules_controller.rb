# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class EmailSchedulesController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[send_test_email destroy download update]
      append_before_action :pundit_authorize

      def index
        skip_policy_scope
        email_schedules = threesixty_campaign.email_schedules.order(created_at: :desc)
        total = email_schedules.count
        email_schedules = email_schedules.page(params[:page])

        recipient_ids = email_schedules.
                        select { |email_schedule| Array.wrap(email_schedule.recipient_ids).length == 1 }.
                        map(&:recipient_ids).flatten

        users_hash = User.where(id: recipient_ids).pluck(:id, :email).to_h

        email_schedules = email_schedules.map do |history|
          ::Threesixty::EmailScheduleSerializer.new(history, users_hash: users_hash).to_h
        end

        render json: { email_schedules: email_schedules, total: total }
      end

      def create
        form = ::Threesixty::EmailScheduleForm.from_params(params[:email_schedule])
        if form.valid?
          email_schedule = threesixty_campaign.email_schedules.create!(form.attributes.merge(auto_triggered: false))
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

      def update
        form = ::Threesixty::EmailScheduleForm.from_params(params[:email_schedule])
        if form.valid?
          resource.update!(form.attributes)
          ::Threesixty::Emails::SendSingleScheduledEmail.call!(resource)
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: :bad_request
        end
      end

      def destroy
        resource.destroy!

        render json: :ok
      end

      def download
        file = ::Threesixty::GenerateMailHistoryCsv.call!(resource)

        respond_to do |format|
          format.csv { send_data file, filename: "mail_history_#{Time.now}.csv" }
        end
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
