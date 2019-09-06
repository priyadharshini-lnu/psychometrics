# frozen_string_literal: true

module Administration
  module Threesixty
    class SubjectPolicy < BasePolicy
      def create_all?
        index?
      end

      def search?
        index?
      end

      def spoof?
        index?
      end

      def preview_report?
        index?
      end

      def download_example_import_file?
        index?
      end
    end
  end
end
