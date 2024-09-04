# frozen_string_literal: true

class LambdaNotificationsController < ActionController::Base
  skip_before_action :verify_authenticity_token
  before_action :log_subscription_confirmation_details

  def url_to_pdf
    Lambdas::NotificationHandlers::UrlToPdf.call!(get_message)

    head :ok
  end

  def zip_s3_files
    Lambdas::NotificationHandlers::ZipS3Files.call!(get_message)

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
    hash, = JWT.decode(request.raw_post, Settings.secrets.aws.dig(:lambda, :signing_secret), 'HS256')
    hash['data']
  end
end
