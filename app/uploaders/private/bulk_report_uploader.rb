# frozen_string_literal: true

module Private
  class BulkReportUploader < CarrierWave::Uploader::Base
    include PrivatableUploader

    delegate :store_dir, to: :model

    def extension_whitelist
      %w[zip]
    end
  end
end
