# frozen_string_literal: true

class SkipRecaptcha < BaseCommand
  private_attr_reader :request

  def initialize(request)
    @request = request
  end

  def call
    return broadcast :ok, true if Settings.features.disable_recaptcha

    broadcast :ok, Settings.skip_recaptcha_for_ips.include?(request.remote_ip)
  end
end
