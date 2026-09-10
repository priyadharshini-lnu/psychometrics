# frozen_string_literal: true

class BulkReportJob < ApplicationRecord
  include Rails.application.routes.url_helpers

  belongs_to :project, class_name: 'Client', optional: true
  belongs_to :admin_job_record, optional: true
  belongs_to :bulk_report, optional: true
  belongs_to :created_by, class_name: 'User'

  include Tenantable

  tenant_source :project

  def self.ransackable_attributes(_auth_object = nil)
    %w[id created_at]
  end

  def project_bulk_report_job?
    admin_job_record&.project_bulk_download_reports?
  end

  def project_bulk_report_job_url
    path = "/admin/projects/#{project_id}/bulk_reports/#{id}"
    client = associated_client

    if use_admin_subdomain?(client)
      "#{Settings.protocol}://#{AdminSubdomain.admin_host_for(client)}:#{Settings.port}#{path}"
    else
      "#{Settings.protocol}://#{Settings.domain}:#{Settings.port}#{path}"
    end
  end

  private

  def associated_client
    return nil if created_by.superadmin?

    project.client
  end

  def use_admin_subdomain?(client)
    AdminSubdomain.client_admin_sso_enabled? && client.present?
  end
end
