# frozen_string_literal: true

# Securely send a file if it is within the allowed directory

module Utility
  module FileSecurity
    def self.safe_file_path?(file_path, allowed_dir)
      return false if file_path.blank? || allowed_dir.blank?

      expanded_file_path = File.expand_path(file_path.to_s)
      expanded_allowed_dir = File.expand_path(allowed_dir.to_s)

      expanded_file_path.start_with?(expanded_allowed_dir)
    end

    def self.safe_send_file(controller, file_path, allowed_dir, **send_file_options)
      if safe_file_path?(file_path, allowed_dir)
        controller.send_file(file_path, **send_file_options)
        true
      else
        controller.head(:forbidden)
        false
      end
    end
  end
end
