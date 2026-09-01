# frozen_string_literal: true

class TemporaryUpload < ApplicationRecord
  enum :status, { pending: 0, processed: 1 }
  MAX_FILE_SIZE = 100.megabytes

  belongs_to :user

  validates :file_key, presence: true
  validates :filename, presence: true
  validates :content_type, presence: true
  validates :byte_size, presence: true, numericality: { greater_than: 0, less_than_or_equal_to: MAX_FILE_SIZE }
  validates :checksum, format: { with: %r{\A[A-Za-z0-9+/]{22}==\z} }, allow_nil: true
  validates :service_name, presence: true
  validates :bucket, presence: true
  validates :status, presence: true, inclusion: { in: TemporaryUpload.statuses.keys }

  scope :stale, -> { pending.where('created_at < ?', 24.hours.ago) }
end
