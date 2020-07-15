# frozen_string_literal: true

module Campaigns
  module Reports
    class Add < BaseCommand
      private_attr_reader :form, :campaign

      def initialize(form, campaign)
        @form = form
        @campaign = campaign
      end

      def call
        transaction do
          reports.each do |report|
            create_campaigns_report(report)
          end
        end
        broadcast :ok, nil
      rescue Licenses::NotEnoughError => e
        broadcast :error, { base: e.message }
      end

      private

      def create_campaigns_report(report)
        return if existing_report_ids.include?(report.id)

        campaign.campaigns_reports.create!(
          report: report, user_access: user_access_for(report), report_family_id: form.report_family_id
        )

        report.assessments.each do |assessment|
          campaign.campaigns_assessments.find_or_create_by!(assessment: assessment)
        end

        return if form.operation == 'skip_existing'

        add_user_report(report)
      end

      def add_user_report(report)
        campaign.campaigns_users.each do |campaigns_user|
          Campaigns::Users::AddReport.call!(
            campaigns_user,
            report,
            user_access: user_access_for(report),
            operation: form.operation,
            use_license: use_new_license?(campaigns_user.user, report)
          )
        end
      end

      def use_new_license?(user, report)
        return true if form.operation == 'add_and_allow_new_response'

        !Licenses::IsUsedByUser.call!(user, report)
      end

      def existing_report_ids
        @existing_report_ids ||= campaign.campaigns_reports.pluck(:report_id)
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
