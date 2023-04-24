# frozen_string_literal: true

module ActiveStorageVariants
  extend ActiveSupport::Concern

  VARIANTS = {
    icon: { resize_to_limit: [100, 100] }
  }.freeze

  included do
    # Usage: call :image_variant on an attachment: record.image.blob.image_variant(:thumb) or image_variant([100, 100])
    def image_variant(variant, processed: true)
      transformation =
        case variant
          in Symbol
            variant(VARIANTS.fetch(variant))
          in [Integer, Integer]
            variant(resize_to_limit: variant)
          in Integer
            variant(resize_to_limit: [variant, variant])
        end

      processed ? transformation.processed : transformation
    end
  end
end
