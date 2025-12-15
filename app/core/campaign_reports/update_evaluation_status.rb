# frozen_string_literal: true

module CampaignReports
  class UpdateEvaluationStatus < BaseCommand
    private_attr_reader :subject, :status, :updated_by

    def initialize(subject, status, updated_by)
      @subject = subject
      @status = status
      @updated_by = updated_by
    end

    def call
      return broadcast :ok if subject.evaluation_status == status

      attributes = { evaluation_status: status }
      attributes[:evaluation_status_updated_by] = updated_by if updated_by

      subject.update!(attributes)
      broadcast :ok
    rescue StandardError => e
      broadcast :error, [{ base: e.message }]
    end
  end
end
