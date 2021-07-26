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
            create_campaign_report(report)
          end
        end
        broadcast :ok, nil
      rescue Licenses::NotEnoughError => e
        broadcast :error, { base: e.message }
      end

      private

      def create_campaign_report(report)
        return if existing_report_ids.include?(report.id)

        campaign.campaign_reports.create!(
          report: report, user_access: user_access_for(report), report_family_id: report_family_id_for(report)
        )

        get_assessments_for(report).each do |assessment|
          assessment_params = form.assessment_map[assessment.id] || {}
          attrs = { assessment: assessment, norm_id: assessment_params[:norm_id] }
          attrs[:saville_norm_id] = assessment.saville_norm_id if assessment.saville?
          campaign.campaign_assessments.find_or_create_by!(attrs)
        end

        return if form.operation == 'skip_existing'

        add_user_report(report)
      end

      def add_user_report(report)
        campaign.campaign_users.each do |campaign_user|
          Campaigns::Users::AddReport.call!(
            campaign_user,
            report,
            report_family_id: report_family_id_for(report),
            user_access: user_access_for(report),
            operation: form.operation,
            assessments: report.assessments
          )
        end
      end

      def existing_report_ids
        @existing_report_ids ||= campaign.campaign_reports.pluck(:report_id)
      end

      def reports
        @reports ||= Report.where(id: form.report_ids).includes(:assessments)
      end

      def user_access_for(report)
        report_params = form.report_map[report.id] || {}
        report_params[:user_access] || form.report_access.fetch(report.id.to_s, false)
      end

      def report_family_id_for(report)
        report_params = form.report_map[report.id] || {}
        report_params[:report_bundle_id] || form.report_family_id
      end

      def get_assessments_for(report)
        return report.assessments if form.assessments.blank?

        report.assessments.select { |a| form.assessment_ids.include?(a.id) }
      end
    end
  end
end
