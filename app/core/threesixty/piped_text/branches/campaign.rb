# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      class Campaign < ::PipedText::BaseBranch
        def call
          class_name = "Threesixty::PipedText::Branches::CampaignFields::#{path.last}".safe_constantize
          broadcast :ok, class_name&.call!(path, params, context)
        end
      end
    end
  end
end
