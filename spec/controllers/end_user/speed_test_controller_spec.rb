# frozen_string_literal: true

require 'rails_helper'

describe EndUser::SpeedTestController, type: :controller do
  let(:user) { create(:user, :with_project_membership) }
  let(:project) { user.project }
  let(:url_response) { { url: 'https://s3.example.com/test', size: 5_000_000, key: 'test/key.bin' } }

  before do
    allow(GetProjectBySubdomain).to receive(:call!).and_return(project)
    login_user(user)
  end

  describe 'GET #download_url' do
    before { allow(SpeedTest::S3TestUrls).to receive(:download_url).and_return(url_response) }

    it 'returns presigned URL data' do
      get :download_url

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['url']).to eq(url_response[:url])
    end

    it 'returns service unavailable on error' do
      allow(SpeedTest::S3TestUrls).to receive(:download_url).and_raise(StandardError.new('Storage error'))

      get :download_url

      expect(response).to have_http_status(:service_unavailable)
      expect(response.parsed_body['error']).to eq('Storage error')
    end
  end

  describe 'GET #upload_url' do
    before { allow(SpeedTest::S3TestUrls).to receive(:upload_url).and_return(url_response) }

    it 'returns presigned URL for upload' do
      get :upload_url

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['url']).to eq(url_response[:url])
    end

    it 'returns service unavailable on error' do
      allow(SpeedTest::S3TestUrls).to receive(:upload_url).and_raise(StandardError.new('Storage error'))

      get :upload_url

      expect(response).to have_http_status(:service_unavailable)
    end
  end

  describe 'GET #ping_url' do
    before { allow(SpeedTest::S3TestUrls).to receive(:ping_url).and_return(url_response) }

    it 'returns presigned URL for ping' do
      get :ping_url

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body['url']).to eq(url_response[:url])
    end

    it 'returns service unavailable on error' do
      allow(SpeedTest::S3TestUrls).to receive(:ping_url).and_raise(StandardError.new('Storage error'))

      get :ping_url

      expect(response).to have_http_status(:service_unavailable)
    end
  end
end
