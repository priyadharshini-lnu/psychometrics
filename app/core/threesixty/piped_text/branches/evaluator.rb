# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      class Evaluator < BaseBranch
        def call
          class_name = BaseUtils.safe_constantize("Threesixty::PipedText::Branches::EvaluatorFields::#{path.first}")
          result = class_name ? class_name.call!(path, params, context) : ''
          broadcast :ok, result
        end
      end
    end
  end
end
