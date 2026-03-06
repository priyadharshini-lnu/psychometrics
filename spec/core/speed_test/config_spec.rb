# frozen_string_literal: true

require 'rails_helper'

describe SpeedTest::Config do
  describe '.clamp_size' do
    it 'returns MIN_SIZE when input is below minimum' do
      expect(described_class.clamp_size(500)).to eq(described_class::MIN_SIZE)
    end

    it 'returns MAX_SIZE when input exceeds maximum' do
      expect(described_class.clamp_size(100_000_000)).to eq(described_class::MAX_SIZE)
    end

    it 'returns the input value when within valid range' do
      valid_size = 2 * 1024 * 1024
      expect(described_class.clamp_size(valid_size)).to eq(valid_size)
    end

    it 'converts string input to integer' do
      expect(described_class.clamp_size('5000000')).to eq(5_000_000)
    end

    it 'handles nil by returning MIN_SIZE' do
      expect(described_class.clamp_size(nil)).to eq(described_class::MIN_SIZE)
    end
  end

  describe '.generate_presigned_url' do
    let(:mock_presigner) { instance_double(Aws::S3::Presigner) }

    before do
      allow(described_class).to receive(:s3_presigner).and_return(mock_presigner)
      allow(described_class).to receive(:bucket_name).and_return('test-bucket')
    end

    it 'generates a presigned URL with correct parameters' do
      expect(mock_presigner).to receive(:presigned_url).with(
        :get_object,
        bucket: 'test-bucket',
        key: 'test/key.bin',
        expires_in: described_class::URL_EXPIRATION.to_i
      ).and_return('https://presigned-url.example.com')

      result = described_class.generate_presigned_url(method: :get_object, key: 'test/key.bin')
      expect(result).to eq('https://presigned-url.example.com')
    end
  end

  describe '.bucket_name' do
    it 'returns the private bucket from settings' do
      expect(described_class.bucket_name).to eq(Settings.secrets.s3_compatible_storage[:private_bucket])
    end
  end
end
