if Rails.env.development?
  CarrierWave.configure do |config|
    config.storage = :file
    config.asset_host = ActionController::Base.asset_host
  end
else
  CarrierWave.configure do |config|
    config.storage = :aws
    config.aws_bucket = Rails.application.secrets.directory
    config.aws_acl = 'public-read'

    config.aws_attributes = {
        expires: 1.week.from_now.httpdate,
        cache_control: 'max-age=604800'
    }

    config.aws_credentials = {
        access_key_id: Rails.application.secrets.access_key_id,
        secret_access_key: Rails.application.secrets.secret_access_key,
        region: Rails.application.secrets.region
    }
  end
end
