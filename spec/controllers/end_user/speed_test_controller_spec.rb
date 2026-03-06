# frozen_string_literal: true

require 'rails_helper'

describe EndUser::SpeedTestController, type: :controller do
  let(:user) { create(:user, :with_project_membership) }
  let(:project) { user.project }
  let(:s3_response) { { url: 'https://s3.example.com/test', size: 5_000_000, key: 'test/key.bin' } }

  before do
    allow(GetProjectBySubdomain).to receive(:call!).and_return(project)
    login_user(user)
  end

  describe 'GET #download' do
    it 'returns binary data with correct headers' do
      get :download, params: { size: 2048 }

      expect(response).to have_http_status(:ok)
      expect(response.headers['Content-Type']).to eq('application/octet-stream')
      expect(response.headers['Content-Length']).to eq('2048')
      expect(response.headers['Cache-Control']).to include('no-store')
    end

    it 'clamps size to minimum when too small' do
      get :download, params: { size: 100 }

      expect(response.headers['X-Test-Size']).to eq(SpeedTest::Config::MIN_SIZE.to_s)
    end

    it 'clamps size to maximum when too large' do
      get :download, params: { size: 100_000_000 }

      expect(response.headers['X-Test-Size']).to eq(SpeedTest::Config::MAX_SIZE.to_s)
    end
  end

  describe 'POST #upload' do
    it 'returns bytes received' do
      post :upload, body: 'x' * 1000

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['bytes_received']).to eq(1000)
    end
  end

  describe 'GET #ping' do
    it 'returns timestamp and server time in ISO8601 format' do
      get :ping

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['timestamp']).to be_a(Integer)
      expect { Time.iso8601(json['server_time']) }.not_to raise_error
    end
  end

  describe 'S3 URL endpoints' do
    describe 'GET #s3_download_url' do
      before { allow(SpeedTest::S3TestUrls).to receive(:download_url).and_return(s3_response) }

      it 'returns S3 presigned URL data' do
        get :s3_download_url

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['url']).to eq(s3_response[:url])
      end

      it 'returns service unavailable on S3 error' do
        allow(SpeedTest::S3TestUrls).to receive(:download_url).and_raise(StandardError.new('S3 error'))

        get :s3_download_url

        expect(response).to have_http_status(:service_unavailable)
        expect(response.parsed_body['error']).to eq('S3 error')
      end
    end

    describe 'GET #s3_upload_url' do
      before { allow(SpeedTest::S3TestUrls).to receive(:upload_url).and_return(s3_response) }

      it 'returns S3 presigned URL for upload' do
        get :s3_upload_url

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['url']).to eq(s3_response[:url])
      end

      it 'returns service unavailable on S3 error' do
        allow(SpeedTest::S3TestUrls).to receive(:upload_url).and_raise(StandardError.new('S3 error'))

        get :s3_upload_url

        expect(response).to have_http_status(:service_unavailable)
      end
    end

    describe 'GET #s3_ping_url' do
      before { allow(SpeedTest::S3TestUrls).to receive(:ping_url).and_return(s3_response) }

      it 'returns S3 presigned URL for ping' do
        get :s3_ping_url

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['url']).to eq(s3_response[:url])
      end

      it 'returns service unavailable on S3 error' do
        allow(SpeedTest::S3TestUrls).to receive(:ping_url).and_raise(StandardError.new('S3 error'))

        get :s3_ping_url

        expect(response).to have_http_status(:service_unavailable)
      end
    end
  end
end
