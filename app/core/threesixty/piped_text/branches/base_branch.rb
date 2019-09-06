# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      class BaseBranch < BaseCommand
        def initialize(path, params, context = {})
          @path = path
          @params = params
          @context = context
        end

        private

        attr_reader :path, :context, :params
      end
    end
  end
end
