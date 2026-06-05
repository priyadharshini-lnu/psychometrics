# frozen_string_literal: true

class MicrositeUserAssessment < ApplicationRecord
  audited

  belongs_to :user_assessment

  include Tenantable

  tenant_source :user_assessment

  enum :registration_status, { pending: 0, registered: 1, failed: 2 }

  before_destroy :cancel_on_microsite

  delegate :user_reports, :subject, to: :user_assessment

  private

  def cancel_on_microsite
    return unless registered? && participant_id.present?

    Microsite::CancelParticipantJob.perform_later(
      participant_id: participant_id,
      project_id: user_assessment.project.id
    )
  end
end
