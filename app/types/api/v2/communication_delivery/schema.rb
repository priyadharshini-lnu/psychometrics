# frozen_string_literal: true

module Api
  module V2
    module CommunicationDelivery
      class Schema < Api::Base::Schema
        def self.resource
          'communication_deliveries'
        end

        def self.attributes(attribute, _type)
          this = self
          proc do
            instance_eval(&this.core_attributes(attribute))
            instance_eval(&this.schedule_attributes)
          end
        end

        def self.core_attributes(attribute)
          proc do
            attribute[:trigger_type].filled(:string, included_in?: ::CommunicationDelivery.trigger_types.keys)

            optional(:status).maybe(:string, included_in?: ::CommunicationDelivery.statuses.keys)
            optional(:delivery_rule).maybe(:string, included_in?: ::CommunicationDelivery.delivery_rules.keys)
            optional(:recipients).maybe(:string, included_in?: ::CommunicationDelivery.recipients.keys)
            optional(:delivery_at).maybe(:string)
            optional(:delivery_interval_number).maybe(:integer)
            optional(:delivery_interval_period).maybe(:string)

            optional(:subject).maybe(:string)
            optional(:body).maybe(:string)

            optional(:communication_delivery_assessments_attributes).maybe(:array)

            optional(:created_at).maybe(:string)
            optional(:updated_at).maybe(:string)
          end
        end

        def self.schedule_attributes
          proc do
            optional(:delivery_start_date).maybe(:string)
            optional(:delivery_end_date).maybe(:string)
            optional(:delivery_time_of_day).maybe(:string)
            optional(:delivery_timezone).maybe(:string)
            optional(:delivery_frequency).maybe(:string,
                                                included_in?: %w[daily weekly specific_weekdays])
            optional(:delivery_weekdays).maybe(:array)
            optional(:delivery_delay_hours).maybe(:integer)
            optional(:assessment_completion_status_code).maybe(:string)
            optional(:campaign_assessment_group_id).maybe(:integer)
          end
        end

        def self.update_translation_request
          json_api_attributes do
            required(:subject).filled(:string)
            required(:body).filled(:string)
            required(:locale).filled(:string)
          end
        end

        def self.relationships(_type)
          [
            { name: :communication_template, resource: :communication_templates, relationship: :one,
              required: true, allowed_blank: false },
            { name: :campaign, resource: :campaigns, relationship: :one, required: false, allowed_blank: true },
            { name: :project, resource: :clients, relationship: :one, required: false, allowed_blank: true }
          ]
        end

        def self.links?
          false
        end
      end
    end
  end
end
