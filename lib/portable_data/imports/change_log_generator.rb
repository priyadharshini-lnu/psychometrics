# frozen_string_literal: true

module PortableData
  module Imports
    class ChangeLogGenerator
      def initialize(hash1, hash2, excluded_keys = %w[schema model meta])
        @hash1 = hash1.with_indifferent_access
        @hash2 = hash2.with_indifferent_access
        @excluded_keys = excluded_keys.map { |k| normalize_key(k) }
      end

      def generate
        ChangeLogEntryTracker.new(compare_hashes(@hash1, @hash2)).format
      end

      private

      def compare_hashes(hash1, hash2)
        diff = {}

        keys = (normalize_keys(hash1.keys) | normalize_keys(hash2.keys)) - @excluded_keys

        keys.each do |key|
          val1 = get_value(hash1, key)
          val2 = get_value(hash2, key)

          if val1.is_a?(Hash) && val2.is_a?(Hash)
            nested_diff = compare_hashes(val1, val2)
            diff[key] = nested_diff unless nested_diff.empty?
          elsif val1.is_a?(Array) && val2.is_a?(Array)
            array_diff = compare_arrays(val1, val2)
            diff[key] = array_diff unless array_diff.empty?
          elsif val1 != val2
            diff[key] = [val1, val2]
          end
        end

        diff
      end

      def compare_arrays(arr1, arr2)
        diff = {}
        id_map1 = create_id_map(arr1)
        id_map2 = create_id_map(arr2)

        # Compare ID-based objects
        (id_map1.keys | id_map2.keys).each do |id|
          next if id.nil?

          el1 = id_map1[id]
          el2 = id_map2[id]

          if el1 && el2
            nested_diff = compare_hashes(el1, el2)
            diff[id] = nested_diff unless nested_diff.empty?
          else
            diff[id] = [el1, el2]
          end
        end

        # Compare non-ID elements in order
        unordered_elements_diff(arr1.reject { |e| id_present?(e) }, arr2.reject { |e| id_present?(e) }).each do |k, v|
          diff[k] = v
        end

        diff
      end

      def unordered_elements_diff(arr1, arr2)
        {}.tap do |diff|
          max_length = [arr1.size, arr2.size].max

          (0...max_length).each do |i|
            v1 = arr1[i]
            v2 = arr2[i]

            if v1.is_a?(Hash) && v2.is_a?(Hash)
              nested_diff = compare_hashes(v1, v2)
              diff[i] = nested_diff unless nested_diff.empty?
            elsif v1.is_a?(Array) && v2.is_a?(Array)
              nested_diff = compare_arrays(v1, v2)
              diff[i] = nested_diff unless nested_diff.empty?
            elsif v1 != v2
              diff[i] = [v1, v2]
            end
          end
        end
      end

      def create_id_map(array)
        array.each_with_object({}) do |el, map|
          next unless el.is_a?(Hash)

          id = el[:id] || el['id']
          map[id] = el if id
        end
      end

      def normalize_keys(keys)
        keys.map { |k| normalize_key(k) }
      end

      def normalize_key(key)
        key.is_a?(String) ? key.to_sym : key
      end

      def get_value(hash, normalized_key)
        hash[normalized_key] || hash[normalized_key.to_s]
      end

      def id_present?(element)
        element.is_a?(Hash) && (element[:id] || element['id'])
      end
    end
  end
end
