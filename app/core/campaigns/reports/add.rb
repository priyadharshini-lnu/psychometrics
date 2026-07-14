# frozen_string_literal: true

module Campaigns
  module Reports
    class Add < BaseCommand
      private_attr_reader :form, :campaign, :current_user, :job_record, :responses

      def initialize(form, campaign, current_user, job_record = nil)
        @form = form
        @campaign = campaign
        @current_user = current_user
        @job_record = job_record
        @responses = { error_messages: [] }
      end

      def call
        transaction do
          job_record&.update(total_tasks: total_count)
          reports.each do |report|
            create_campaign_report(report)
          end
        end
        broadcast :ok, responses: responses
      rescue Licenses::NotEnoughError => e
        broadcast :error, { base: e.message }
      end

      private

      def create_campaign_report(report)
        return if existing_report_ids.include?(report.id)

        campaign_report = campaign.campaign_reports.create!(
          report: report, user_access: user_access_for(report), report_family_id: report_family_id_for(report)
        )
        AuditLogModule.audit!(
          :create, campaign_report,
          payload: form.attributes,
          user: current_user
        )

        unless report.data_only?
          get_assessments_for(report).each do |assessment|
            assessment_params = form.assessment_map[assessment.id] || {}
            attrs = { assessment: assessment, norm_id: assessment_params[:norm_id] }
            attrs[:external_norm_id] = assessment.external_settings[:norm_id] if assessment.has_external_norm?
            attrs[:mettl_schedule_record_id] = default_mettl_schedule_record_id(assessment) if assessment.mettl?
            attrs[:external_config] = default_config_for_simulation(assessment) if assessment.simulation?
            attrs[:occupation_condition_set_id] = default_config_for_occupation_condition_set(assessment)

            campaign_assessment = campaign.campaign_assessments.
                                  create_with(attrs).find_or_create_by!(assessment: assessment)
            AuditLogModule.audit!(
              :create, campaign_assessment, payload: campaign_assessment.log_attributes, user: current_user
            )
          end
        end

        return if form.operation == 'skip_existing'

        add_user_report(report)
      end

      def add_user_report(report)
        campaign.campaign_users.each do |campaign_user|
          Campaigns::Users::AddReport.call!(
            campaign_user,
            report,
            current_user: current_user,
            report_family_id: report_family_id_for(report),
            user_access: user_access_for(report),
            operation: form.operation,
            assessments: report.assessments,
            pdf_options: {
              low_priority: true
            }
          )

          job_record&.increment_completed_tasks!
        rescue Hogan::Exceptions::NewAssessmentResponseNotAllowed => e
          responses[:error_messages] << e.short_message
          next
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
        assessments = if form.assessments.blank?
                        report.assessments
                      else
                        report.assessments.select { |a| form.assessment_ids.include?(a.id) }
                      end

        assessments.reject { |a| Assessment::NON_USER_ASSESSMENT_CATEGORY.include?(a.category) }
      end

      def default_mettl_schedule_record_id(assessment)
        MettlScheduleRecord.parent_schedules.find_by(assessment_id: assessment.id)&.id
      end

      def default_config_for_simulation(assessment)
        simulation_settings = assessment.simulation_settings

        if simulation_settings && simulation_settings[:default_content_variation_id]
          return { 'content_variation_id' => simulation_settings[:default_content_variation_id] }.to_json
        end

        nil
      end

      def default_config_for_occupation_condition_set(assessment)
        dimension = assessment.dimension

        if dimension.occupations_enabled? && dimension.default_occupation_condition_set_id
          dimension.default_occupation_condition_set_id
        end
      end

      def total_count
        campaign.campaign_users.count * reports.count
      end
    end
  end
end
