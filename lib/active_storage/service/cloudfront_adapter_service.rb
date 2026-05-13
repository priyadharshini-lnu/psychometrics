# frozen_string_literal: true

require 'active_storage/service/s3_service'
require 'aws-sdk-cloudfront'

module ActiveStorage
  class Service::CloudfrontAdapterService < Service::S3Service
    # rubocop:disable Metrics/ParameterLists, Lint/UnusedMethodArgument
    def initialize(
      cloudfront_domain:,
      cloudfront_key_pair_id: nil,
      cloudfront_private_key: nil,
      cloudfront_expires_in: nil,
      public: false,
      cloudfront_access: 'private',
      **
    )
      super(**)

      @cloudfront_domain = cloudfront_domain
      @cloudfront_key_pair_id = cloudfront_key_pair_id
      @cloudfront_private_key = cloudfront_private_key
      @cloudfront_expires_in = cloudfront_expires_in
      @cloudfront_access = cloudfront_access
    end
    # rubocop:enable Metrics/ParameterLists, Lint/UnusedMethodArgument

    # Override S3Service URL behavior to avoid global monkey patches and always use CDN URLs.
    def url(key, **)
      instrument :url, key: key do |payload|
        generated_url = cloudfront_access == 'public' ? public_url(key, **) : private_url(key, **)
        payload[:url] = generated_url
        generated_url
      end
    end

    private

    # rubocop:disable Metrics/ParameterLists
    def private_url(key, expires_in:, filename:, disposition:, content_type:, **)
      return super if cloudfront_domain.blank?

      unsigned_url = build_cloudfront_url(
        key,
        query: {
          'response-content-disposition' => content_disposition_with(type: disposition, filename: filename),
          'response-content-type' => content_type
        }.compact
      )

      cloudfront_signer.signed_url(unsigned_url, expires: Time.current.to_i + effective_expires_in(expires_in))
    end
    # rubocop:enable Metrics/ParameterLists

    def public_url(key, **)
      return super if cloudfront_domain.blank?

      build_cloudfront_url(key)
    end

    attr_reader :cloudfront_domain, :cloudfront_key_pair_id, :cloudfront_private_key, :cloudfront_expires_in,
                :cloudfront_access

    def build_cloudfront_url(key, query: nil)
      target_uri = parse_cloudfront_domain
      encoded_key = encode_key_for_path(key)

      port = if (target_uri.scheme == 'https' && target_uri.port == 443) ||
                (target_uri.scheme == 'http' && target_uri.port == 80)
               nil
             else
               target_uri.port
             end

      uri = URI::Generic.build(
        scheme: target_uri.scheme,
        host: target_uri.host,
        port: port,
        path: "/#{encoded_key}",
        query: query&.to_query
      )

      uri.to_s
    end

    def parse_cloudfront_domain
      candidate = cloudfront_domain.match?(%r{\Ahttps?://}i) ? cloudfront_domain : "https://#{cloudfront_domain}"
      URI.parse(candidate)
    end

    def encode_key_for_path(key)
      key.to_s.split('/').map { |part| CGI.escape(part).gsub('+', '%20') }.join('/')
    end

    def cloudfront_signer
      if cloudfront_key_pair_id.blank? || cloudfront_private_key.blank?
        raise ArgumentError, 'CloudFront signer requires cloudfront_key_pair_id and cloudfront_private_key'
      end

      @cloudfront_signer ||= Aws::CloudFront::UrlSigner.new(
        key_pair_id: cloudfront_key_pair_id,
        private_key: cloudfront_private_key
      )
    end

    def effective_expires_in(expires_in)
      return expires_in.to_i if cloudfront_expires_in.blank?

      cloudfront_expires_in.to_i
    end
  end
end
