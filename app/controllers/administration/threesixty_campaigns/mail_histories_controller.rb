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
        Threesixty::GenerateMailHistoryCsv.call!(resource)
      end

      private

      def set_resource_class
        @_resource_class ||= ::Threesixty::EmailSchedule # rubocop:disable Naming/MemoizedInstanceVariableName
      end
    end
  end
end
