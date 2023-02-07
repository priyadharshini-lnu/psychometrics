# frozen_string_literal: true

module ActiveStorageCreateVariant
  extend ActiveSupport::Concern

  prepended do
    after_create_commit :create_variant, if: :not_a_variant?
  end

  def create_variant
    if record.class.respond_to?(:attachment_variants)
      record.class.attachment_variants[name.to_sym].each do |variant|
        image_variant(variant)
      end
    end
  end

  private

  def not_a_variant?
    record_type != 'ActiveStorage::VariantRecord'
  end
end
