# frozen_string_literal: true

class UserReport < ApplicationRecord
  belongs_to :user, inverse_of: :user_reports
  belongs_to :report
  belongs_to :norm
  belongs_to :campaign
  has_one :project, through: :campaign
  has_one :threesixty_campaign, through: :campaign

  delegate :client, to: :campaign

  mount_base64_uploader :pdf, PdfUploader, file_name: proc { 'report' }

  def threesixty_subject
    campaign.subjects.find_by(user_id: user_id)
  end

  enum status: { not_prepared: 0, generating: 1, failed: 2, prepared: 3 }

  def pdf_exists?
    pdf.file.present?
  end
end
