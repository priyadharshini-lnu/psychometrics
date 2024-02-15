# frozen_string_literal: true

module PrivatableUploader
  def initialize(*)
    super
    self.fog_directory = Settings.secrets.s3_compatible_storage[:private_bucket]
  end

  def fog_public
    false
  end

  def fog_authenticated_url_expiration
    10.minutes
  end
end
