# frozen_string_literal: true

class Transcription < ApplicationRecord
  belongs_to :transcribable, polymorphic: true

  validates :text, presence: true
  validates :transcribable_id, uniqueness: { scope: :transcribable_type }
end
