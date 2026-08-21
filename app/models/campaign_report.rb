# frozen_string_literal: true

class CampaignReport < ApplicationRecord
  audited

  attr_accessor :skip_owner_validation

  include ActiveStorageAttachable
  include OwnerCompatibility

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
  validate :campaign_owner_compatibility_with_report_owner,
           if: :validate_campaign_owner_compatibility_with_report_owner?
  validate :campaign_owner_compatibility_with_report_family_owner,
           if: :validate_campaign_owner_compatibility_with_report_family_owner?

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
    default_language.presence || report&.default_language
  end

  private

  def validate_campaign_owner_compatibility_with_report_owner?
    return false if skip_owner_validation == true
    return false if campaign.blank? || report.blank?

    new_record? || will_save_change_to_campaign_id? || will_save_change_to_report_id?
  end

  def campaign_owner_compatibility_with_report_owner
    return if compatible_owner_ids?(campaign.tenant_id, report.owner_id)

    add_owner_compatibility_error(
      :report_id,
      child_resource: :report,
      parent_resource: :campaign
    )
  end

  def validate_campaign_owner_compatibility_with_report_family_owner?
    return false if skip_owner_validation == true
    return false if campaign.blank? || report_family.blank?

    new_record? || will_save_change_to_campaign_id? || will_save_change_to_report_family_id?
  end

  def campaign_owner_compatibility_with_report_family_owner
    return if compatible_owner_ids?(campaign.tenant_id, report_family.tenant_id)

    add_owner_compatibility_error(
      :report_family_id,
      child_resource: :report_bundle,
      parent_resource: :campaign
    )
  end

  def assign_key_to_blob(action, attribute, filename)
    action.blob.key = attachment_storage_path(attribute, filename)
  end
end
