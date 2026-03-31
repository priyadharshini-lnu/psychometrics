# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::DirectUploadsController, type: :request do
  let(:superadmin) { create(:superadmin) }
  let!(:api_key) { create(:api_key, user: superadmin) }
  let(:authorization) { "Basic #{Base64.strict_encode64("#{api_key.key}:#{api_key.token}")}" }

  before do
    sign_in(superadmin)
    allow(Settings.secrets.s3_compatible_storage).to receive(:[]).with(:public_bucket).and_return('test-bucket')
    allow(Settings.secrets.s3_compatible_storage).to receive(:[]).with(:provider).and_return('aws')
  end

  describe 'POST /api/v2/administration/direct_uploads' do
    let(:params) do
      {
        files: [
          {
            filename: 'test.png',
            content_type: 'image/png',
            byte_size: 1024,
            checksum: 'MDEyMzQ1Njc4OWFiY2RlZg=='
          }
        ]
      }
    end

    it 'creates a TemporaryUpload and returns presigned url for each file' do
      expect do
        post '/api/v2/administration/direct_uploads',
             params: params,
             headers: { 'Authorization' => authorization },
             as: :json
      end.to change(TemporaryUpload, :count).by(1)

      expect(response).to have_http_status(:created)

      json_response = JSON.parse(response.body)
      expect(json_response).to be_an(Array)
      expect(json_response.length).to eq(1)

      upload_response = json_response.first
      expect(upload_response).to have_key('presigned_url')
      expect(upload_response['file_key']).to match(%r{tmp/uploads/.+/test\.png})

      upload = TemporaryUpload.last
      expect(upload.filename).to eq('test.png')
      expect(upload.status).to eq('pending')
      expect(upload.checksum).to eq('MDEyMzQ1Njc4OWFiY2RlZg==')
      expect(upload_response['temporary_upload_id']).to eq(upload.id)
    end
  end
end
