# frozen_string_literal: true

require 'rails_helper'

describe SpeedTest::S3TestUrls do
  let(:mock_s3_client) { instance_double(Aws::S3::Client) }
  let(:presigned_url) { 'https://s3.example.com/presigned' }

  before do
    allow(SpeedTest::Config).to receive(:s3_client).and_return(mock_s3_client)
    allow(SpeedTest::Config).to receive(:generate_presigned_url).and_return(presigned_url)
    allow(mock_s3_client).to receive(:head_object).and_return(true)
  end

  describe '.download_url' do
    it 'returns hash with url, size, and key' do
      result = described_class.download_url(size: 1_000_000)

      expect(result).to include(:url, :size, :key)
      expect(result[:url]).to eq(presigned_url)
      expect(result[:size]).to eq(1_000_000)
    end

    it 'uses default size when not specified' do
      result = described_class.download_url

      expect(result[:size]).to eq(SpeedTest::Config::DEFAULT_SIZE)
    end

    it 'creates test file if it does not exist' do
      allow(mock_s3_client).to receive(:head_object).and_raise(Aws::S3::Errors::NotFound.new(nil, 'Not Found'))
      allow(mock_s3_client).to receive(:put_object)

      described_class.download_url(size: 1_000_000)

      expect(mock_s3_client).to have_received(:put_object)
    end
  end

  describe '.upload_url' do
    it 'returns hash with url and key' do
      result = described_class.upload_url

      expect(result).to include(:url, :key)
      expect(result[:url]).to eq(presigned_url)
    end

    it 'generates unique keys for each call' do
      result1 = described_class.upload_url
      result2 = described_class.upload_url

      expect(result1[:key]).not_to eq(result2[:key])
    end

    it 'includes upload prefix in key' do
      result = described_class.upload_url

      expect(result[:key]).to start_with(SpeedTest::Config::UPLOAD_PREFIX)
    end
  end

  describe '.ping_url' do
    it 'returns hash with url and key' do
      result = described_class.ping_url

      expect(result).to include(:url, :key)
      expect(result[:url]).to eq(presigned_url)
    end
  end
end
