# frozen_string_literal: true

class ActiveStorageCreateVariantJob < ApplicationJob
  def perform(blob, variants)
    Array.wrap(variants).each do |variant|
      # TODO: refactor variants fetch
      variation = ActiveStorage::Variant.new(blob, ActiveStorageVariants::VARIANTS.fetch(variant))
      variant_record = ActiveStorage::VariantRecord.find_or_create_by!(
        blob: blob, variation_digest: variation.variation.digest
      )
      ActiveStorage::Attachment.find_or_create_by!(name: "#{variant}_variant", record: variant_record, blob: blob)
      variation.processed
    end
  end
end
