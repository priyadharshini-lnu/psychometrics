# frozen_string_literal: true

class UsersReport < ApplicationRecord
  belongs_to :user, inverse_of: :users_reports
  belongs_to :report
  belongs_to :campaign
  mount_uploader :pdf, PdfUploader

  def threesixty_subject
    campaign.subjects.find_by(user_id: user_id)
  end

  enum status: { not_prepared: 0, generating: 1, failed: 2, prepared: 3 }
end
