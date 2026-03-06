# frozen_string_literal: true

require 'rails_helper'

describe FaasNotificationsController, type: :controller do
  describe 'POST url_to_pdf' do
    it 'calls Faas::NotificationHandlers::UrlToPdf and returns 200 status response' do
      some_data = { 'id' => 1 }
      expect(Faas::NotificationHandlers::UrlToPdf).to receive(:call!).with(some_data)

      post :url_to_pdf, body: encode_faas_message(some_data)

      expect(response.status).to eq(200)
    end
  end

  describe 'POST zip_s3_files' do
    it 'calls Faas::NotificationHandlers::ZipS3Files and returns 200 status response' do
      some_data = { 'id' => 1 }
      expect(Faas::NotificationHandlers::ZipS3Files).to receive(:call!).with(some_data)

      post :zip_s3_files, body: encode_faas_message(some_data)

      expect(response.status).to eq(200)
    end
  end

  describe 'POST extract_and_upload' do
    it 'calls Faas::NotificationHandlers::ProcessCampaignReportBulkAssets and returns 200 status response' do
      some_data = { 'id' => 1 }
      expect(Faas::NotificationHandlers::ProcessCampaignReportBulkAssets).to receive(:call!).with(some_data)

      post :extract_and_upload, body: encode_faas_message(some_data)

      expect(response.status).to eq(200)
    end
  end

  private

  def encode_faas_message(message)
    seceret = Settings.secrets.faas[:signing_secret]
    JWT.encode({ data: message }, seceret, 'HS256')
  end
end
