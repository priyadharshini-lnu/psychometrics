# frozen_string_literal: true

module Communications
  module PipedText
    module Branches
      module CampaignFields
        class Field < ::PipedText::BaseField
          def call
            broadcast :ok, campaign.name
          end

          private

          def campaign
            context[:campaign]
          end
        end
      end
    end
  end
end
