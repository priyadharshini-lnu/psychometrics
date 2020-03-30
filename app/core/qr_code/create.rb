# frozen_string_literal: true

module QrCode
  class Create < BaseCommand
    private_attr_reader :type, :target_url

    def initialize(target_url, type)
      @target_url = target_url
      @type = type
    end

    def call
      file_path = if type.eql?(I18n.t('administration.clients.registration_codes.resource.svg'))
                    QrCode::CreateSvg.call!(target_url)
                  else
                    QrCode::CreatePng.call!(target_url)
                  end

      file = File.open(file_path)

      broadcast :ok, file
    end
  end
end
