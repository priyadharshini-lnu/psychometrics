# frozen_string_literal: true

module PortableData
  module Imports
    class ChangeLogEntryTracker
      def initialize(diff_result)
        @diff_result = diff_result
      end

      def format
        results = []
        build_actions(@diff_result, [], results)
        results
      end

      private

      # Recursively builds actions from the diff result
      def build_actions(node, current_path, results)
        case node
          when Hash
            process_hash_node(node, current_path, results)
          when Array
            add_action_entry(current_path, node, results)
        end
      end

      # Processes a hash node and recursively builds actions for its keys/values
      def process_hash_node(node, current_path, results)
        node.each do |key, value|
          new_path = current_path.dup
          new_path << key.to_s unless current_path.empty? && key == :resources

          case value
            when Hash
              build_actions(value, new_path, results)
            when Array
              add_action_entry(new_path, value, results)
          end
        end
      end

      # Adds an action entry to the results based on the changes in values
      def add_action_entry(path_parts, values, results)
        old_val, new_val = values
        return if (old_val.blank? && new_val.blank?) || old_val == new_val

        action_type = determine_action_type(old_val, new_val)

        entry = [
          action_type,
          path_parts.join(' → ').gsub(/^resources\ → /, '').gsub(/\ → data/, ''),
          format_changes(action_type, old_val, new_val)
        ].flatten

        results << entry
      end

      # Determines the type of action (created/updated/deleted) based on old and new values
      def determine_action_type(old_val, new_val)
        return 'Added' if old_val.nil? && (new_val.is_a?(Hash) && new_val[:id].present?)
        return 'Deleted' if new_val.nil? && (old_val.is_a?(Hash) && old_val[:id].present?)

        'Updated'
      end

      # Formats the changes based on the action type and handles nested structures for created/deleted actions
      def format_changes(action_type, old_val, new_val)
        case action_type
          when 'Added' then [nil, flatten_nested_changes(new_val)]
          when 'Deleted' then [flatten_nested_changes(old_val), nil]
          else [old_val, new_val]
        end
      end

      # Flattens nested changes in a hash structure for better readability in the output
      def flatten_nested_changes(hash)
        return hash unless hash.is_a?(Hash)

        hash.transform_values do |value|
          if value.is_a?(Hash)
            flatten_nested_changes(value)
          elsif value.is_a?(Array)
            value.last || value.first
          else
            value
          end
        end
      end
    end
  end
end
