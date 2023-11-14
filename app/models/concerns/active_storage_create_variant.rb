# frozen_string_literal: true

module ActiveStorageCreateVariant
  extend ActiveSupport::Concern

  prepended do
    after_create_commit :create_variant, if: :not_a_variant?
  end

  def create_variant
    variants = record.class.attachment_reflections[name].variants&.keys

    if variants.present?
      ActiveStorageCreateVariantJob.perform_later(record, name, variants)
    end
  end

  private

  def not_a_variant?
    return false unless variable?

    record_type != 'ActiveStorage::VariantRecord'
  end
end
