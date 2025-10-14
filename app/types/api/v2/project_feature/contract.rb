# frozen_string_literal: true

module Api
  module V2
    module ProjectFeature
      class Contract < Api::Base::Contract
        config.messages.namespace = :project_feature
        schema Api::V2::ProjectFeature::Schema.update_request

        rule(data: { attributes: :global_skills }) do
          next unless values.dig(:data, :attributes, :global_skills) == true

          project_feature_id = values.dig(:data, :id)

          is_global_skills_feature_enabled_on_client = ::ProjectFeature.
                                                       joins(project: { client: :client_feature }).
                                                       exists?(id: project_feature_id,
                                                               client_feature: { global_skills: true })

          key.failure(:global_skills_not_enabled_on_client) unless is_global_skills_feature_enabled_on_client
        end
      end
    end
  end
end
