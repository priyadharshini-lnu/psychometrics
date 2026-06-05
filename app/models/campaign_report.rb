# frozen_string_literal: true

class CampaignReport < ApplicationRecord
  audited

  include ActiveStorageAttachable

  belongs_to :campaign
  belongs_to :report
  belongs_to :report_family
  include Tenantable

  has_one_attachment :bulk_assets_zip,
                     service: Settings.storage.private_storage_service,
                     content_type: %w[application/zip application/x-zip-compressed multipart/x-zip]

  has_one_attachment :bulk_assets_csv,
                     service: Settings.storage.private_storage_service,
                     content_type: %w[text/csv]

  validates :bulk_assets_zip, size: { less_than: 250.megabytes }, if: -> { bulk_assets_zip.attached? }
  validates :bulk_assets_csv, size: { less_than: 4.megabytes }, if: -> { bulk_assets_csv.attached? }

  def attachment_storage_path(attribute_name, filename)
    "private/projects/#{campaign.project.id}/campaigns/#{campaign.id}/" \
      "campaign_report/#{id}/#{attribute_name}/#{filename}"
  end

  def user_reports
    UserReport.where(campaign_id: campaign_id, report_id: report_id)
  end

  def log_attributes
    slice(:campaign_id, :report_id, :report_family_id)
  end

  def effective_default_language
    default_language.presence || report.default_language
  end

  private

  def assign_key_to_blob(action, attribute, filename)
    action.blob.key = attachment_storage_path(attribute, filename)
  end
end
