# frozen_string_literal: true

module Communications
  module PipedText
    module Branches
      module PlatformUrlAndLinksFields
        class Field < ::PipedText::BaseField
          def call
            method = possible_fields[path.last]
            broadcast :ok, method ? send(method) : ''
          end

          private

          def campaign
            context[:campaign]
          end

          def insight_page_url
            Utility::Url.generate(
              :campaign_insights_url,
              subdomain: campaign.project.try(:subdomain),
              campaign_id: campaign.id
            )
          end

          def insight_page_link
            "<a href='#{insight_page_url}'>#{params['text'] || 'Go to Insights'}</a>"
          end

          def possible_fields
            {
              'InsightPageURL' => :insight_page_url,
              'InsightPageLink' => :insight_page_link
            }
          end
        end
      end
    end
  end
end
