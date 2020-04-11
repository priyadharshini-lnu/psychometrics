# frozen_string_literal: true

require 'rqrcode'

module QrCode
  class CreateSvg < BaseCommand
    private_attr_reader :target_url

    def initialize(target_url)
      @target_url = target_url
    end

    def call
      qrcode = RQRCode::QRCode.new(target_url)
      qr_code_as_svg = qrcode.as_svg(
        offset: 0,
        color: '000',
        shape_rendering: 'crispEdges',
        module_size: 6,
        standalone: true
      )

      file_path = Rails.root.join('tmp', "#{SecureRandom.hex(32)}.svg").to_s
      File.write(file_path, qr_code_as_svg)

      broadcast :ok, file_path
    end
  end
end
