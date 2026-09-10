# frozen_string_literal: true

module Administration
  module Assessors
    class ParticipantSchema < BaseSchema
      def self.schema(_, _)
        Dry::Schema.JSON do
          config.validate_keys = true

          required(:id).filled(:int?)
          required(:campaign_id).filled(:int?)
          required(:campaign_name).maybe(:str?)
          required(:project_name).maybe(:str?)
          required(:candidate_name).maybe(:str?)
          required(:candidate_email).maybe(:str?)
          required(:evaluation_status).filled(:str?)
          required(:evaluation_completed).filled(:int?)
          required(:evaluation_total).filled(:int?)
          required(:moderation_status).filled(:str?)
        end
      end
    end
  end
end
