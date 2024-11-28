# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class EmailSchedulesController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[send_test_email destroy download update]
      append_before_action :pundit_authorize

      def index
        skip_policy_scope
        email_schedules = threesixty_campaign.email_schedules.includes(:template).order(created_at: :desc)
        total = email_schedules.count
        email_schedules = email_schedules.page(params[:page])

        recipient_ids = email_schedules.
                        select { |email_schedule| Array.wrap(email_schedule.recipient_ids).length == 1 }.
                        map(&:recipient_ids).flatten

        users_hash = User.where(id: recipient_ids).pluck(:id, :email).to_h

        email_schedules = Panko::ArraySerializer.new(
          email_schedules,
          each_serializer: ::Threesixty::EmailScheduleSerializer,
          context: {
            users_hash: users_hash
          }
        ).to_a

        render json: { email_schedules: email_schedules, total: total }
      end

      def create
        template_id = params[:email_schedule][:id]
        template = threesixty_campaign.email_templates.find_by(id: template_id)

        form = ::Threesixty::EmailScheduleForm.from_params(params[:email_schedule])
        if form.valid?
          threesixty_campaign.email_schedules.create!(
            form.attributes.merge(auto_triggered: false, template: template)
          )
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: 400
        end
      end

      def show
        email_schedule = threesixty_campaign.email_schedules.find(params[:id])

        recipients = Panko::ArraySerializer.
                     new(email_schedule.recipients, each_serializer: UserSerializer).
                     as_json

        render json: { email_schedule: email_schedule, recipients: recipients }
      end

      def update
        form = ::Threesixty::EmailScheduleForm.from_params(params[:email_schedule])
        if form.valid?
          resource.update!(form.attributes)
          ::Threesixty::Emails::SendSingleScheduledEmail.call!(resource)
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: 400
        end
      end

      def destroy
        resource.destroy!

        render json: :ok
      end

      def download
        file = ::Threesixty::GenerateMailHistoryCsv.call!(resource)

        respond_to do |format|
          format.csv { send_data file, filename: "mail_history_#{Time.zone.now}.csv" }
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

        render json: Panko::ArraySerializer.new(
          users,
          each_serializer: UserSerializer
        ).to_a
      end

      private

      def set_resource_class
        @_resource_class ||= ::Threesixty::EmailSchedule # rubocop:disable Naming/MemoizedInstanceVariableName
      end
    end
  end
end
