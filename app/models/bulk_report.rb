# frozen_string_literal: true

class BulkReport < ApplicationRecord
  include Rails.application.routes.url_helpers
  include ActiveStorageAttachable

  belongs_to :user
  belongs_to :campaign, optional: true
  include Tenantable

  has_many_attachments :files, service: Settings.storage.private_storage_service
  validates :files, content_type: %w[zip]

  def attachment_storage_path(attribute_name, filename)
    "private/bulk_report/#{id}/#{attribute_name}/#{filename}"
  end

  def input_dir
    Rails.root.join('tmp', 'bulk_reports', id.to_s).to_s
  end

  def output_dir
    Rails.root.join('tmp', 'bulk_reports', "compressed_#{id}").to_s
  end

  def expiration_date
    created_at + 6.days
  end

  def public_download_urls
    return [build_download_url] if files.length <= 1

    files.each_with_index.map { |_, i| build_download_url(index: i) }
  end

  def private_download_url(index)
    uri = URI(files[index].url)
    unless uri.host
      uri.host = Settings.domain
      uri.port = Settings.port
    end
    uri.scheme = Settings.protocol
    uri.to_s
  end

  private

  def build_download_url(index: nil)
    client = associated_client

    if use_admin_subdomain?(client)
      download_administration_bulk_report_url(
        id: self,
        host: AdminSubdomain.admin_host_for(client),
        port: Settings.port,
        index: index
      )
    else
      download_administration_bulk_report_url(
        id: self,
        host: Settings.domain,
        subdomain: Settings.subdomain,
        port: Settings.port,
        index: index
      )
    end
  end

  def associated_client
    # Super admins always get root domain URLs
    return nil if user.superadmin?

    # Client admins get their client's subdomain URL
    # Use campaign's client when available, otherwise fall back to sole_admin_client
    campaign&.client || user.sole_admin_client
  end

  def use_admin_subdomain?(client)
    AdminSubdomain.client_admin_sso_enabled? && client.present?
  end
end
