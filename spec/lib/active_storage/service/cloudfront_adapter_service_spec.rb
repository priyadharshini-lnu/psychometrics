# frozen_string_literal: true

require 'rails_helper'
require 'active_storage/service/cloudfront_adapter_service'

RSpec.describe ActiveStorage::Service::CloudfrontAdapterService do
  let(:s3_client) { instance_double(Aws::S3::Client) }
  let(:s3_resource) { instance_double(Aws::S3::Resource) }
  let(:bucket) { instance_double(Aws::S3::Bucket, name: 'test-bucket') }
  let(:signer) { instance_double(Aws::CloudFront::UrlSigner) }
  let(:private_key) { "-----BEGIN RSA PRIVATE KEY-----\nabc\n-----END RSA PRIVATE KEY-----" }

  before do
    allow(Aws::S3::Resource).to receive(:new).and_return(s3_resource)
    allow(s3_resource).to receive(:client).and_return(s3_client)
    allow(s3_resource).to receive(:bucket).with('test-bucket').and_return(bucket)
    allow(Aws::CloudFront::UrlSigner).to receive(:new).and_return(signer)
  end

  describe '#url' do
    let(:filename) { ActiveStorage::Filename.new('report.csv') }

    context 'when service is private' do
      let(:service) do
        described_class.new(
          bucket: 'test-bucket',
          access_key_id: 'key',
          secret_access_key: 'secret',
          region: 'eu-west-1',
          public: false,
          cloudfront_domain: 'https://cdn.example.com',
          cloudfront_key_pair_id: 'key_pair',
          cloudfront_private_key: private_key,
          cloudfront_expires_in: 600
        )
      end

      it 'returns a signed CloudFront URL' do
        allow(signer).to receive(:signed_url).and_return('https://cdn.example.com/signed')

        url = service.url(
          'private/reports/report.csv',
          expires_in: 10.minutes,
          filename: filename,
          disposition: :attachment,
          content_type: 'text/csv'
        )

        expect(url).to eq('https://cdn.example.com/signed')
        expect(signer).to have_received(:signed_url).with(
          a_string_including('https://cdn.example.com/private/reports/report.csv?'),
          hash_including(:expires)
        )
      end

      it 'raises when signer config is missing' do
        misconfigured = described_class.new(
          bucket: 'test-bucket',
          access_key_id: 'key',
          secret_access_key: 'secret',
          region: 'eu-west-1',
          public: false,
          cloudfront_domain: 'https://cdn.example.com'
        )

        expect do
          misconfigured.url(
            'private/reports/report.csv',
            expires_in: 10.minutes,
            filename: filename,
            disposition: :attachment,
            content_type: 'text/csv'
          )
        end.to raise_error(ArgumentError, /CloudFront signer requires/)
      end
    end

    context 'when service is public' do
      let(:service) do
        described_class.new(
          bucket: 'test-bucket',
          access_key_id: 'key',
          secret_access_key: 'secret',
          region: 'eu-west-1',
          public: true,
          cloudfront_domain: 'https://cdn.example.com',
          cloudfront_key_pair_id: 'key_pair',
          cloudfront_private_key: private_key
        )
      end

      it 'returns an unsigned CloudFront URL' do
        url = service.url(
          'public/library/file.png',
          expires_in: 10.minutes,
          filename: filename,
          disposition: :inline,
          content_type: 'image/png'
        )

        expect(url).to eq('https://cdn.example.com/public/library/file.png')
        expect(url).not_to include('Signature')
      end
    end
  end

  describe 'rails upgrade contract' do
    it 'matches S3Service private_url signature contract' do
      expect(ActiveStorage::Service::S3Service.instance_method(:private_url).parameters).to eq(
        [
          %i[req key],
          %i[keyreq expires_in],
          %i[keyreq filename],
          %i[keyreq disposition],
          %i[keyreq content_type],
          %i[keyrest client_opts]
        ]
      )
    end

    it 'matches S3Service public_url signature contract' do
      expect(ActiveStorage::Service::S3Service.instance_method(:public_url).parameters).to eq(
        [
          %i[req key],
          %i[keyrest client_opts]
        ]
      )
    end
  end
end
