# frozen_string_literal: true

module Communications
  module PipedText
    module Branches
      module CampaignFields
        class Field < ::PipedText::BaseField
          def call
            Mobility.with_locale(params['locale'] || I18n.locale) do
              broadcast :ok, campaign.name
            end
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
