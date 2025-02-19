# frozen_string_literal: true

module Hogan
  class SaveReportsAndScores < BaseCommand
    private_attr_reader :user_reports, :hogan_assessment_id,
                        :retry_count

    def initialize(user_reports, retry_count: 0)
      @user_reports = Array.wrap(user_reports)
      @retry_count = retry_count
    end

    def call
      Hogan::AddReports.call!(user_reports.reject(&:external_added?))
      all_reports_to_generate.each do |user_report|
        next unless user_report.reload.external_added?

        unless user_report.pdf?
          participant_report = get_participant_report(user_report)
          next rerun_save_report_and_score(user_report) if participant_report.blank?

          user_report.update!(status: :generating)
          user_report.attach_pdf!(
            participant_report, "#{user_report.report.name.parameterize}.pdf"
          )
        end

        user_report.user_results.where("external_results::text = '{}'").each do |user_result|
          add_external_results(user_result, user_report)
        end
      end
    end

    def all_reports_to_generate
      other_package_reports = user_reports.flat_map do |user_report|
        user_report.other_reports_in_same_package.select { |ur| ur.generatable? && !ur.prepared? }
      end

      [*user_reports, *other_package_reports].uniq
    end

    def add_external_results(user_result, user_report)
      credentials = hogan_credential(user_report)

      HoganLog.create!(
        log_type: 'BeforeGetParticipantScore',
        participant_id: credentials.participant_id,
        group: credentials.hogan_group_name,
        call_stack: caller,
        meta: {
          hogan_report_ids: user_reports.pluck(:id)
        }
      )
      participant_score = get_participant_score(user_result, user_report)
      return rerun_save_report_and_score(user_report) if participant_score.blank?

      user_result.update!(external_results: participant_score)
      user_result.user_reports(:internal).where(status: :not_prepared).each do |ur|
        UserReports::GenerateAndSavePdfJob.perform_later(ur, user_result.user)
      end
    end

    def get_participant_score(user_result, user_report)
      credentials = hogan_credential(user_report)

      Services::Hogan::Api::Json::ParticipantScore.call!(
        group: credentials.hogan_group_name,
        participant_id: credentials.participant_id,
        assessment_id: user_result.assessment.external_settings[:assessment_id],
        norm_id: hogan_norm_id(user_result, user_report),
        provider: credentials.provider
      )
    end

    def get_participant_report(user_report)
      credentials = hogan_credential(user_report)

      Services::Hogan::Api::Json::ParticipantReport.call!(
        group: credentials.hogan_group_name,
        report_id: user_report.report.external_settings[:report_id],
        participant_id: credentials.participant_id,
        provider: credentials.provider
      )
    end

    def hogan_norm_id(user_result, user_report)
      norm_from_report = user_result.user_reports(:hogan).first&.report&.external_settings&.dig('norm_id')

      return norm_from_report if norm_from_report.present? && norm_from_report != HoganCredential::DEFAULT_NORM

      credentials = hogan_credential(user_report)
      credentials.norm
    end

    def rerun_save_report_and_score(user_report)
      Hogan::SaveReportsAndScoresJob.set(wait: (2**retry_count).minute).
        perform_later(user_report, retry_count: retry_count + 1)
    end

    def hogan_credential(user_report)
      @hogan_credential ||= {}
      @hogan_credential[user_report.id] ||= user_report.hogan_credential
    end
  end
end
