# frozen_string_literal: true

class CampaignsUsersReport < ApplicationRecord
  belongs_to :user, inverse_of: :campaigns_users_reports
  belongs_to :report
  belongs_to :norm
  belongs_to :campaign
  has_one :project, through: :campaign
  has_one :threesixty_campaign, through: :campaign

  mount_uploader :pdf, PdfUploader

  def threesixty_subject
    campaign.subjects.find_by(user_id: user_id)
  end

  enum status: { not_prepared: 0, generating: 1, failed: 2, prepared: 3 }

  def pdf_exists?
    pdf.file.present?
  end
end
