# frozen_string_literal: true

module Utility
  class Hash
    def self.match?(hash, other_hash, attributes)
      hash.slice(*attributes) == other_hash.slice(*attributes)
    end

    def self.set_nested_key(hash, path, value, mode: :concat)
      keys = path.split('.')
      current_hash = hash
      current_value = hash.dig(*keys)

      keys.each_with_index do |key, index|
        unless index == keys.length - 1
          current_hash[key] ||= {}
          current_hash = current_hash[key]
          next
        end

        current_hash[key] = if mode == :concat && current_value.present?
                              current_value.is_a?(::Array) ? current_value << value : [current_value, value]
                            else
                              value
                            end
      end
      hash
    end

    def self.deep_merge(original, updates)
      case original
        when ::Hash
          return original unless updates.is_a?(::Hash)

          original.merge(updates) do |_key, old_val, new_val|
            deep_merge(old_val, new_val)
          end
        when ::Array
          original.each_with_index.map do |value, index|
            if value.is_a?(::Hash) && updates[index].is_a?(::Hash)
              deep_merge(value, updates[index])
            else
              updates[index] || value
            end
          end
        else
          updates.nil? ? original : updates
      end
    end

    def self.sanitize_nested_hash(props, key = nil)
      case props
        when ActionController::Parameters
          sanitize_nested_hash(props.to_unsafe_h)
        when ::Hash
          props.each_with_object({}) do |(param_key, value), sanitized_hash|
            sanitized_hash[param_key] = sanitize_nested_hash(value, param_key)
          end
        when ::Array
          props.map { |value| sanitize_nested_hash(value, key) }
        when ::String
          sanitize_field(key, props)
        else
          props
      end
    end

    def self.sanitize_field(key, value)
      allowed_tags = []
      if key == 'questionText'
        Utility::SanitizeHtml.process(value)
      else
        ActionController::Base.helpers.sanitize(value, tags: allowed_tags, attributes: [])
      end
    end
  end
end
