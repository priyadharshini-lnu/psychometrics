# frozen_string_literal: true

module Administration
  module Projects
    module Integrations
      class SkillvueIntegrationSerializer < Panko::Serializer
        attributes :api_key, :completion_webhook_url, :results_webhook_url

        def api_key
          object.skillvue_config['api_key']
        end

        def completion_webhook_url
          object.skillvue_config['assessment_completion_notification_url']
        end

        def results_webhook_url
          object.skillvue_config['assessment_result_notification_url']
        end
      end
    end
  end
end
