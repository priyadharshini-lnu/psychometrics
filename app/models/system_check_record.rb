# frozen_string_literal: true

class SystemCheckRecord < ApplicationRecord
  include ActiveStorageAttachable

  belongs_to :system_check_session
  include Tenantable

  tenant_source :system_check_session
  has_one :user, through: :system_check_session

  has_one_attachment :media, service: Settings.storage.private_storage_service

  enum :check_type, { browser: 'browser', network: 'network', video: 'video', audio: 'audio' }

  validates :check_type, presence: true
  validates :passed, inclusion: { in: [true, false] }

  before_save :set_finished_at, if: :passed_changed_to_true?

  scope :passed, -> { where(passed: true) }
  scope :failed, -> { where(passed: false) }
  scope :by_check_type, ->(type) { where(check_type: type) }
  scope :completed, -> { where.not(finished_at: nil) }
  scope :in_progress, -> { where(finished_at: nil) }

  def attachment_storage_path(_, filename)
    user_id = system_check_session.user_id

    "private/system_check_videos/users/#{user_id}/sessions/" \
      "#{system_check_session_id}/#{id}/#{check_type}/#{filename}"
  end

  def media_url
    return unless media.attached?

    media.url(expires_in: 1.hour)
  end

  def meets_network_requirements?(minimum_download_speed:, minimum_upload_speed:)
    return false unless network?

    download_speed = data&.dig('download_speed_mbps').to_f
    upload_speed = data&.dig('upload_speed_mbps').to_f

    download_speed >= minimum_download_speed && upload_speed >= minimum_upload_speed
  end

  private

  def passed_changed_to_true?
    passed? && passed_changed?
  end

  def set_finished_at
    self.finished_at = Time.zone.now
  end
end
