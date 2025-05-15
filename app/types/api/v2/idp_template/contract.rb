# frozen_string_literal: true

module Api
  module V2
    module IdpTemplate
      class Contract < Api::Base::Contract
        config.messages.namespace = :idp_template

        rule(:data) do
          IdpTemplates::SkillsOrTagsPresenceValidator.call(
            values[:data][:attributes],
            values.dig(:data, :relationships, :skills, :data),
            values.dig(:data, :relationships, :project, :data, :id)
          ) do
            on(:errors) do |error_list|
              error_list.each do |attribute, message|
                key([:data, :attributes, attribute]).failure(message)
              end
            end
          end
        end
      end
    end
  end
end
