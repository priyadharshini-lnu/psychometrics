# frozen_string_literal: true

require 'rails_helper'

describe LambdaNotificationsController, type: :controller do
  describe 'POST url_to_pdf' do
    it 'calls Lambdas::NotificationHandlers::UrlToPdf and returns 200 status response' do
      some_data = { 'id' => 1 }
      expect(Lambdas::NotificationHandlers::UrlToPdf).to receive(:call!).with(some_data)

      post :url_to_pdf, body: encode_lambda_message(some_data)

      expect(response.status).to eq(200)
    end
  end

  describe 'POST zip_s3_files' do
    it 'calls Lambdas::NotificationHandlers::ZipS3Files and returns 200 status response' do
      some_data = { 'id' => 1 }
      expect(Lambdas::NotificationHandlers::ZipS3Files).to receive(:call!).with(some_data)

      post :zip_s3_files, body: encode_lambda_message(some_data)

      expect(response.status).to eq(200)
    end
  end

  private

  def encode_lambda_message(message)
    seceret = Settings.secrets.aws.dig(:lambda, :signing_secret)
    JWT.encode({ data: message }, seceret, 'HS256')
  end
end
