# frozen_string_literal: true

class IdpReportPdf < ApplicationRecord
  include ActiveStorageAttachable

  belongs_to :user_idp_plan
  include Tenantable

  tenant_source :user_idp_plan

  has_one_attachment :pdf_file,
                     service: Settings.storage.private_storage_service,
                     content_type: %w[application/pdf]

  def attachment_storage_path(attribute_name, filename)
    "private/projects/#{user_idp_plan.campaign.project_id}/idp_reports/#{user_idp_plan_id}/#{locale}/idp_report_pdf/#{id}/#{attribute_name}/#{filename}" # rubocop:disable Layout/LineLength
  end

  def set_generated_timestamps
    self.last_generated_at = Time.zone.now
    self.first_generated_at ||= Time.zone.now
  end
end
