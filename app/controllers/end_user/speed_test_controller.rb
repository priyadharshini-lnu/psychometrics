# frozen_string_literal: true

module EndUser
  class SpeedTestController < ApplicationController
    skip_before_action :set_client_by_subdomain
    def download
      size = SpeedTest::Config.clamp_size(params[:size])

      response.headers['Content-Type'] = 'application/octet-stream'
      response.headers['Content-Length'] = size.to_s
      response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
      response.headers['X-Test-Size'] = size.to_s
      response.headers['Access-Control-Allow-Origin'] = request.headers['Origin'] || '*'

      self.response_body = SpeedTest::GenerateTestData.call(size)
    end

    def upload
      bytes_received = request.body.read.bytesize

      render json: {
        bytes_received: bytes_received
      }
    end

    def ping
      render json: {
        timestamp: (Time.current.to_f * 1000).to_i,
        server_time: Time.current.iso8601(3)
      }
    end

    def s3_download_url
      size = SpeedTest::Config.clamp_size(params[:size] || SpeedTest::Config::DEFAULT_SIZE)
      render json: SpeedTest::S3TestUrls.download_url(size: size)
    rescue StandardError => e
      render_s3_error(e)
    end

    def s3_upload_url
      render json: SpeedTest::S3TestUrls.upload_url
    rescue StandardError => e
      render_s3_error(e)
    end

    def s3_ping_url
      render json: SpeedTest::S3TestUrls.ping_url
    rescue StandardError => e
      render_s3_error(e)
    end

    private

    def render_s3_error(exception)
      render json: { error: exception.message }, status: :service_unavailable
    end
  end
end
