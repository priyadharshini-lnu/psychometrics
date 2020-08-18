# frozen_string_literal: true

module Campaigns
  module UserReports
    class Add < BaseCommand
      private_attr_reader :form, :campaign_user

      def initialize(form, campaign_user)
        @form = form
        @campaign_user = campaign_user
      end

      def call
        transaction do
          reports.each do |report|
            Campaigns::Users::AddReport.call!(
              campaign_user,
              report,
              report_family_id: form.report_family_id,
              user_access: user_access_for(report),
              operation: form.operation,
              use_license: use_new_license?(campaign_user.user, report)
            )
          end
        end
        broadcast :ok, nil
      rescue Licenses::NotEnoughError => e
        broadcast :error, { base: e.message }
      end

      private

      def use_new_license?(user, report)
        return true if form.add_and_allow_new_response?

        !Licenses::IsUsedByUser.call!(user, report)
      end

      def reports
        @reports ||= Report.where(id: form.report_ids)
      end

      def user_access_for(report)
        form.report_access.fetch(report.id.to_s, false)
      end
    end
  end
end
