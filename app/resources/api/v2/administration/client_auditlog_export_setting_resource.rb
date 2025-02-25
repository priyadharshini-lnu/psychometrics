# frozen_string_literal: true

class Api::V2::Administration::ClientAuditlogExportSettingResource < Api::V2::Administration::BaseResource
  attributes :description, :destination_type, :active, :s3_access_key_id, :s3_secret_access_key,
             :s3_bucket_name, :s3_bucket_folder, :s3_region, :s3_endpoint, :platform_error

  has_one :client

  exclude_links [:self]

  # TODO: (atanych): can we avoid that?
  def s3_secret_access_key
    return '<FILTERED>' if @model.s3_secret_access_key.present?

    nil
  end

  def platform_error
    platform_exception = PlatformException.
                         where('updated_at >= ? AND consecutive_failure_count > 0', @model.updated_at).
                         find_by(resource: @model)

    meta = platform_exception&.meta
    meta ? "#{meta['exception_class']}: #{meta['error_message']}" : nil
  end
end
