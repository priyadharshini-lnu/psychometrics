# frozen_string_literal: true

module ActiveStorageAttachable
  extend ActiveSupport::Concern

  # rubocop:disable Style/ClassVars
  class_methods do
    @@attachment_variants ||= Hash.new([])

    # TODO: refactor after rails 7 update
    # NOTE: rails 7 has possibility to create pre-defined variants oob
    def has_one_image_attached( # rubocop:disable Naming/PredicateName
      attribute,
      service: Settings.storage.public_storage_service,
      variants: nil
    )
      has_one_attached attribute, service: service
      validates attribute, content_type: %w[jpg jpeg gif png bmp svg]
      @@attachment_variants[attribute] |= variants
    end

    def attachment_variants
      @@attachment_variants
    end
  end
end
# rubocop:enable all
