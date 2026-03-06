# frozen_string_literal: true

class FaasNotificationsController < ActionController::Base
  skip_before_action :verify_authenticity_token
  before_action :log_subscription_confirmation_details

  def url_to_pdf
    Faas::NotificationHandlers::UrlToPdf.call!(get_message)

    head :ok
  end

  def zip_s3_files
    Faas::NotificationHandlers::ZipS3Files.call!(get_message)

    head :ok
  end

  def extract_and_upload
    Faas::NotificationHandlers::ProcessCampaignReportBulkAssets.call!(get_message)

    head :ok
  end

  def media_to_transcription
    Faas::NotificationHandlers::MediaToTranscription.call!(get_message)

    head :ok
  end

  private

  def log_subscription_confirmation_details
    if %w[SubscriptionConfirmation UnsubscribeConfirmation].include?(request.headers['x-amz-sns-message-type'])
      Rails.logger.info('SNS subscription/unsubcription details')
      Rails.logger.info(JSON.parse(request.raw_post))
      head :ok
    end
  end

  def get_message
    hash, = JWT.decode(request.raw_post, Settings.secrets.faas[:signing_secret], 'HS256')
    hash['data']
  end
end
