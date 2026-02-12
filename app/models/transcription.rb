# frozen_string_literal: true

class Transcription < ApplicationRecord
  belongs_to :transcribable, polymorphic: true

  enum :status, {
    not_requested: 0,
    pending: 1,
    processing: 2,
    completed: 3,
    failed: 4
  }

  validates :transcribable_id, uniqueness: { scope: :transcribable_type }
end
