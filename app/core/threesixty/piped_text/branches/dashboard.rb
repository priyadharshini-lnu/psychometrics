# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      class Dashboard < BaseBranch
        def call
          return broadcast :ok, '' unless path.second

          class_name = BaseUtils.safe_constantize("Threesixty::PipedText::Branches::DashboardFields::#{path.second}")
          result = class_name ? class_name.call!(path, params, context) : ''
          broadcast :ok, result
        end
      end
    end
  end
end
