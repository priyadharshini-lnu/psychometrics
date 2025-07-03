# frozen_string_literal: true

module Idp
  class BulkGenerate < BaseCommand
    include Rails.application.routes.url_helpers

    private_attr_reader :user_idp_plans, :current_user, :bulk_report, :job_record

    def initialize(current_user:, job_record:, user_idp_plans: nil)
      @user_idp_plans = user_idp_plans
      @current_user = current_user
      @job_record = job_record
    end

    def call
      if user_idp_plans.empty?
        return broadcast :ok, { error_messages: [I18n.t('administration.bulk_reports.reports_unavailable')] }
      end

      user_idp_plans.each do |user_idp_plan|
        UserReports::GenerateIdpReportPdf.call(
          user_idp_plan, current_user,
          admin_job_record_id: job_record.id,
          lang: job_record.data['lang'],
          include_reflective_questions: job_record.data['include_reflective_questions'] || false,
          update_record: false
        )
      end

      broadcast :ok
    end
  end
end
