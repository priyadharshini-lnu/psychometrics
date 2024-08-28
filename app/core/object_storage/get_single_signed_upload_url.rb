# frozen_string_literal: true

module ObjectStorage
  class GetSingleSignedUploadUrl < BaseCommand
    private_attr_reader :model, :field, :file_name

    def initialize(model, field, file_name)
      @model = model
      @field = field
      @file_name = file_name
    end

    def call
      asset_key = model.send(field).key.gsub('${filename}', file_name)
      storage_config = Rails.application.secrets.s3_compatible_storage
      signer = Aws::S3::Presigner.new
      url = signer.presigned_url(
        :put_object,
        bucket: Rails.application.secrets.s3_compatible_storage[:private_bucket],
        key: asset_key,
        expires_in: 1800,
        use_accelerate_endpoint: Settings.aws.s3.accelerated
      )
      if storage_config[:proxy_endpoint]
        url = url.gsub(storage_config[:endpoint], storage_config[:proxy_endpoint])
      end

      broadcast :ok, { url: url, media_id: model.id, asset_key: asset_key }
    end
  end
end
