# frozen_string_literal: true

module Threesixty
  class SubjectSerializer < Panko::Serializer
    attributes :id, :status, :report_status, :report_status_message, :evaluators, :evaluations, :permissions,
               :user_report_id, :report_download_url, :available_report_languages, :evaluation_marked_done_by

    has_one :user, serializer: SubjectUserSerializer

    def status
      Threesixty::Participants::GetStatus.call!(
        object,
        context[:nomination_requirement],
        counters,
        context[:subject_evaluator_counters]&.dig(object.user_id, :all) || {}
      )
    end

    def user_report_id
      object.user_report&.id
    end

    def report_status
      status = get_report_status_result
      status == 'available' && !report_file_exists? ? 'not_available' : status
    end

    def report_status_message
      get_report_status_result
    end

    def evaluations
      "#{counters[:completed_evaluations]} / #{counters[:total_evaluations]}"
    end

    def evaluators
      "#{counters[:completed_evaluators]} / #{counters[:total_evaluators]}"
    end

    def counters
      context[:counters][object.user_id]
    end

    def permissions
      GetPermissionsHash.call!(
        Administration::Threesixty::SubjectPolicy,
        current_user,
        object,
        [
          %w[login spoof],
          'edit_user',
          'reset_password',
          'view_report',
          'download_report',
          'view_responses',
          'approve_report',
          'remove_report_approval',
          'release_report',
          'hold_report',
          'remove_report_hold_release',
          'mark_as_done',
          'unmark_as_done',
          'remove_subject',
          'remove_from_campaign',
          'regenerate_report'
        ],
        {
          project_id: current_project_id,
          campaign_id: campaign_id
        }
      )
    end

    def report_download_url
      campaign = ::Threesixty::Campaign.find_by(campaign_id: campaign_id)
      campaign_report = campaign&.campaign_report
      return {} unless campaign_report

      expected_locales = [campaign_report.default_language, *campaign_report.available_languages].uniq
      user_report = object.user_reports.find_by(campaign_id: campaign_id)
      expected_locales.index_with do |locale|
        user_report&.pdf_download_url(locale: locale)
      end
    end

    def available_report_languages
      user_report = object.user_reports.find_by(campaign_id: campaign_id)
      return [] unless user_report

      if user_report.association(:user_report_pdfs).loaded?
        user_report.user_report_pdfs.map(&:locale).uniq
      else
        user_report.user_report_pdfs.pluck(:locale).uniq
      end
    end

    def evaluation_marked_done_by
      marked_by_user = object.evaluation_marked_done_by
      return nil unless marked_by_user

      marked_by_user.email
    end

    private

    def get_report_status_result
      Threesixty::Participants::GetReportStatus.call!(
        object,
        context[:option],
        context[:subject_evaluator_counters]&.dig(object.user_id, :completed) || {}
      )
    end

    def current_user
      context[:current_user]
    end

    def current_project_id
      context[:project_id]
    end

    def campaign_id
      context[:campaign_id]
    end

    def report_file_exists?
      object.user_report&.pdf_exists?
    end
  end
end
