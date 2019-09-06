# frozen_string_literal: true

module Administration
  module Threesixty
    class EvaluatorPolicy < BasePolicy
      def create_all?
        index?
      end

      def download_example_import_file?
        index?
      end
    end
  end
end
