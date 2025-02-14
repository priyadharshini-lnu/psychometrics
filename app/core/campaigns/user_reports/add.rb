# frozen_string_literal: true

module Campaigns
  module UserReports
    class Add < BaseCommand
      private_attr_reader :form, :campaign_user, :current_user

      def initialize(form, campaign_user, current_user)
        @form = form
        @campaign_user = campaign_user
        @current_user = current_user
      end

      def call
        transaction do
          reports.each do |report|
            Campaigns::Users::AddReport.call!(
              campaign_user,
              report,
              current_user: current_user,
              report_family_id: report_family_id_for(report),
              user_access: user_access_for(report),
              operation: form.operation,
              assessments: get_assessments_for(report),
              norm_ids: form.assessments || []
            )
          end
        end
        broadcast :ok, nil
      rescue Hogan::Exceptions::NewAssessmentResponseNotAllowed, Licenses::NotEnoughError => e
        broadcast :error, { base: e.message }
      end

      private

      def reports
        @reports ||= Report.where(id: form.report_ids)
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
