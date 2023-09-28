# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      class User < ::PipedText::BaseBranch
        def call
          class_name = "Threesixty::PipedText::Branches::UserFields::#{path.first}".safe_constantize
          broadcast :ok, class_name&.call!(path, params, context)
        end
      end
    end
  end
end
