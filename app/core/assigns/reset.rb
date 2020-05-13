# frozen_string_literal: true

module Assigns
  class Reset < BaseCommand
    def initialize(assign)
      @assign_with_result = assign.assign_with_result
      @original_or_self = assign.original_or_self
    end

    def call
      transaction do
        remove_reports if assign_with_result.completed?
        reset_assign
        remove_media_responses
      end

      broadcast :ok
    end

    private

    attr_reader :assign_with_result, :original_or_self

    def remove_media_responses
      MediaResponse.where(assign_id: assign_with_result.id).destroy_all
    end

    def reset_assign
      assign_with_result.update_attributes(
        results: {},
        scoring: {},
        embedded_data: {},
        status: Assign.statuses[:not_started],
        completed_at: nil,
        step: 0,
        started_at: nil,
        norm_data: {},
        agile_scoring: {},
        occupations: [],
        expiry_date: nil,
        last_activity_at: nil,
        meta_data: {},
        additional_time: nil,
        current_element: nil,
        current_page: nil
      )
    end

    def remove_reports
      original_or_self.assigns_reports.update(remove_pdf: true, generating: false)
    end
  end
end
