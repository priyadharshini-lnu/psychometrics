# frozen_string_literal: true

class UserReport < ApplicationRecord
  belongs_to :user, inverse_of: :user_reports
  belongs_to :report
  belongs_to :norm
  belongs_to :campaign
  belongs_to :report_family
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

  def user_results
    UserReports::GetUserResultsQuery.new(self).query
  end

  def generatable?
    completed_assessment_ids = user_results.pluck(:assessment_id)

    report.assessment_ids.all? { |id| completed_assessment_ids.include?(id) }
  end
end
