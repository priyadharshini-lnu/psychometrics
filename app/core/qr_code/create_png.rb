# frozen_string_literal: true

require 'rqrcode'

module QrCode
  class CreatePng < BaseCommand
    private_attr_reader :target_url

    def initialize(target_url)
      @target_url = target_url
    end

    def call
      qrcode = RQRCode::QRCode.new(target_url)
      qrcode_as_png = qrcode.as_png(
        bit_depth: 1,
        border_modules: 4,
        color_mode: ChunkyPNG::COLOR_GRAYSCALE,
        color: 'black',
        file: nil,
        fill: 'white',
        module_px_size: 6,
        resize_exactly_to: false,
        resize_gte_to: false,
        size: 240
      )

      file_path = Rails.root.join('tmp', "#{SecureRandom.hex(32)}.png").to_s
      IO.binwrite(file_path, qrcode_as_png.to_s)

      broadcast :ok, file_path
    end
  end
end
