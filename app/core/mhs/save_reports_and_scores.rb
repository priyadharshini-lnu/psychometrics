# frozen_string_literal: true

module Mhs
  class SaveReportsAndScores < BaseCommand
    private_attr_reader :user_reports, :user_assessment,
                        :retry_count

    def initialize(user_assessment, user_reports, retry_count: 0)
      @user_reports = Array.wrap(user_reports)
      @retry_count = retry_count
      @user_assessment = user_assessment
    end

    def call
      if user_assessment.mhs_user_assessment.observation_item_sets.blank?
        Mhs::GetDataGathering.call!(user_assessment)
      end

      if user_assessment.users_result.external_results.blank?
        Mhs::CreateEvaluator.call!(user_assessment)
      end

      user_reports.each do |user_report|
        user_report.reload
        next if user_report.external_added? || user_report.pdf_exists?

        user_report.update!(status: :generating)

        enrichment_result = get_participant_report(user_report)

        next if enrichment_result.blank? || enrichment_result[:content].blank?

        pdf_io = StringIO.new(enrichment_result[:content])
        filename = enrichment_result[:filename] || "#{user_report.report.name.parameterize}.pdf"

        user_report.attach_pdf!(pdf_io, filename)
        user_report.update!(external_added: true)
      end
    end

    def get_participant_report(user_report)
      result = Mhs::CreateEnrichmentResult.call!(user_assessment, user_report)

      if result.blank? || result[:pdf].blank?
        rerun_save_report_and_score(user_report)
        return nil
      end

      enrichment_id = user_report.report.external_settings['report_id']
      Mhs::GetEnrichmentResult.call(result[:pdf], enrichment_id)[:ok]
    end

    def generate_internal_reports
      ::UsersResults::GenerateReports.call(user_assessment.users_result, user_assessment.user)
    end

    def rerun_save_report_and_score(user_report)
      Mhs::SaveReportsAndScoresJob.set(wait: (2**retry_count).minute).
        perform_later(user_assessment, [user_report], retry_count: retry_count + 1)
    end
  end
end
