# frozen_string_literal: true

require 'rqrcode'

module Threesixty
  module PipedText
    module Branches
      module DashboardFields
        class QrCode < ::PipedText::BaseField
          def call
            url = Threesixty::PipedText::Branches::DashboardFields::Url.call!([], params, context)

            encoded_img = generate_base64_qrcode_img(url)
            broadcast :ok, "<img src='#{encoded_img}' />"
          end

          private

          def generate_base64_qrcode_img(url)
            qrcode = RQRCode::QRCode.new(url)
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
              size: 180
            )
            qrcode_as_png.to_data_url
          end
        end
      end
    end
  end
end
