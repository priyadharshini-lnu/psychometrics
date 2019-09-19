# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class MailHistoriesController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[update download]
      append_before_action :pundit_authorize

      def index
        skip_policy_scope
        render json: threesixty_campaign.email_schedules.order(created_at: :desc),
          each_serializer: ::Threesixty::MailHistorySerializer
      end

      def download
        file = ::Threesixty::GenerateMailHistoryCsv.call!(resource)

        respond_to do |format|
          format.csv { send_data file, filename: "mail_history_#{Time.now}.csv" }
        end
      end

      private

      def set_resource_class
        @_resource_class ||= ::Threesixty::EmailSchedule # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def set_resource
        @_resource = policy_scope(resource_class).find(params[:mail_history_id])
      end
    end
  end
end
