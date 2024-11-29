# frozen_string_literal: true

require 'oj'

module CachingSerializer
  extend ActiveSupport::Concern

  included do
    class_attribute :cache_exclusions, default: []
    class_attribute :cache_key_proc, default: ->(object) { object.serializer_cache_key }
  end

  class_methods do
    def cache_serializer(except:, cache_key:)
      self.cache_exclusions = except
      self.cache_key_proc = cache_key
    end
  end

  def serialize(object)
    @object = object
    if Settings.features.cache_serializer
      cache_key = self.class.cache_key_proc.call(object)
      cached_result = Rails.cache.read(cache_key)
      if cached_result.present?
        cached_result = Oj.load(cached_result)
        dynamic_attributes = self.class.cache_exclusions.each_with_object({}) do |attr, hash|
          hash[attr.to_s] = send(attr)
        end
        cached_result.merge!(dynamic_attributes)
        cached_result
      else
        serialized_result = super(object)
        Rails.cache.write(cache_key, Oj.dump(serialized_result))
        serialized_result
      end
    else
      serialized_result = super(object)
    end
    serialized_result
  end

  private

  attr_reader :object
end
