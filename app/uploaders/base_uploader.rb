# frozen_string_literal: true

class BaseUploader < CarrierWave::Uploader::Base
  def download_url
    url(query: { 'response-content-disposition' => 'attachment' })
  end

  def proxy_download_url
    proxy_url(query: { 'response-content-disposition' => 'attachment' })
  end

  def proxy_url(options = {})
    storage_config = Settings.secrets.s3_compatible_storage
    return url(options) unless storage_config[:proxy_endpoint]

    url(options).gsub(storage_config[:endpoint], storage_config[:proxy_endpoint])
  end
end
