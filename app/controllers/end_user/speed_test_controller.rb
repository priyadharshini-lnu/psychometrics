# frozen_string_literal: true

module EndUser
  class SpeedTestController < ApplicationController
    skip_before_action :set_client_by_subdomain

    def download_url
      size = SpeedTest::Config.clamp_size(params[:size] || SpeedTest::Config::DEFAULT_SIZE)
      render json: SpeedTest::S3TestUrls.download_url(size: size)
    rescue StandardError => e
      render_error(e)
    end

    def upload_url
      render json: SpeedTest::S3TestUrls.upload_url
    rescue StandardError => e
      render_error(e)
    end

    def ping_url
      render json: SpeedTest::S3TestUrls.ping_url
    rescue StandardError => e
      render_error(e)
    end

    private

    def render_error(exception)
      render json: { error: exception.message }, status: :service_unavailable
    end
  end
end
