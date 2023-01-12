# frozen_string_literal: true

module Private
  class PdfUploader < BaseUploader
    include PrivatableUploader

    def store_dir
      return model.pdf_path if model.is_a?(UserReport) && model.pdf_path.present?

      "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
    end

    def extension_whitelist
      %w[pdf]
    end
  end
end
