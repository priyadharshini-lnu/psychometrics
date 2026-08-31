# frozen_string_literal: true

class TemporaryUpload < ApplicationRecord
  enum :status, { pending: 0, processed: 1 }
  MAX_FILE_SIZE = 100.megabytes
  MAX_SVG_FILE_SIZE = 5.megabytes

  belongs_to :user

  validates :file_key, presence: true
  validates :filename, presence: true
  validates :content_type, presence: true
  validates :byte_size, presence: true, numericality: { greater_than: 0 }
  validates :byte_size, numericality: { less_than_or_equal_to: MAX_SVG_FILE_SIZE }, if: :svg_file?
  validates :byte_size, numericality: { less_than_or_equal_to: MAX_FILE_SIZE }, unless: :svg_file?
  validates :checksum, format: { with: %r{\A[A-Za-z0-9+/]{22}==\z} }, allow_nil: true
  validates :service_name, presence: true
  validates :bucket, presence: true
  validates :status, presence: true, inclusion: { in: TemporaryUpload.statuses.keys }

  scope :stale, -> { pending.where('created_at < ?', 24.hours.ago) }

  def self.svg_file?(filename:, content_type:)
    content_type.to_s == 'image/svg+xml' || File.extname(filename.to_s).casecmp('.svg').zero?
  end

  private

  def svg_file?
    self.class.svg_file?(filename: filename, content_type: content_type)
  end
end
