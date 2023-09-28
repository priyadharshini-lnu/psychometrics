# frozen_string_literal: true

module Threesixty
  class SubjectSerializer < ActiveModel::Serializer
    attributes :id, :status, :report_status, :evaluators, :evaluations, :permissions

    has_one :user, serializer: UserSerializer
    def status
      Threesixty::Participants::GetStatus.call!(
        object,
        @instance_options[:nomination_requirement],
        counters,
        @instance_options[:subject_evaluator_counters]&.dig(object.user_id, :all) || {}
      )
    end

    def report_status
      Threesixty::Participants::GetReportStatus.call!(
        object,
        @instance_options[:option],
        @instance_options[:subject_evaluator_counters]&.dig(object.user_id, :completed) || {}
      )
    end

    def evaluations
      "#{counters[:completed_evaluations]} / #{counters[:total_evaluations]}"
    end

    def evaluators
      "#{counters[:completed_evaluators]} / #{counters[:total_evaluators]}"
    end

    def counters
      @instance_options[:counters][object.user_id]
    end

    def permissions
      GetPermissionsHash.call!(
        Administration::Threesixty::SubjectPolicy,
        current_user,
        object,
        [
          %w[login spoof],
          'edit_user',
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

    private

    def current_user
      @instance_options[:current_user]
    end

    def current_project_id
      @instance_options[:project_id]
    end

    def campaign_id
      @instance_options[:campaign_id]
    end
  end
end
