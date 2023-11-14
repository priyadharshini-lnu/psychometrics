# frozen_string_literal: true

class ActiveStorageCreateVariantJob < ApplicationJob
  def perform(record, attribute, variants)
    variants.each do |variant|
      record.send(attribute).variant(variant)&.processed
    end
  end
end
