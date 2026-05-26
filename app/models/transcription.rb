# frozen_string_literal: true

class Transcription < ApplicationRecord
  belongs_to :transcribable, polymorphic: true

  include Tenantable

  tenant_source :transcribable

  enum :status, {
    not_requested: 0,
    pending: 1,
    processing: 2,
    completed: 3,
    failed: 4
  }

  validates :transcribable_id, uniqueness: { scope: :transcribable_type }

  after_commit :trigger_ai_scoring_if_ready, on: %i[create update], if: -> { saved_change_to_status? && completed? }

  private

  def trigger_ai_scoring_if_ready
    return unless transcribable.is_a?(MediaResponse)

    transcribable.users_result&.trigger_ai_scoring
  end
end
