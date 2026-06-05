# frozen_string_literal: true

module Api
  module V2
    module Assessment
      class Schema < Api::Base::Schema
        def self.resource
          'assessments'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
            attribute[:type].filled(:string, included_in?: ::Assessment::TYPES.keys.map(&:to_s))
            attribute[:category].filled(:string)
            optional(:description).maybe(:string)
            optional(:timing).maybe(:string)
            optional(:status).maybe(:string, included_in?: ::Assessment::STATUSES.map(&:to_s) + [nil])
            optional(:enable_video_check).maybe(:bool)
            optional(:enable_audio_check).maybe(:bool)
            optional(:enable_network_check).maybe(:bool)
            optional(:translations_migrated).maybe(:bool)
            optional(:icon_color).maybe(:string)
            optional(:external_settings).maybe(:hash) do
              optional(:assessment_id).maybe(:string)
              optional(:norm_id).maybe(:string)
              optional(:schedule_config).maybe(:string)
              optional(:question_mappings).maybe(:string)
            end
            optional(:tag_list).maybe(:array).each(:string)
          end
        end

        def self.relationships(_)
          [
            { name: :owner, resource: :clients, relationship: :one, required: false, allowed_blank: true },
            { name: :project, resource: :clients, relationship: :one, required: false, allowed_blank: true },
            { name: :dimension, resource: :dimensions, relationship: :one },
            { name: :linked_assessment, resource: :assessments, relationship: :one,
              required: false, allowed_blank: true }
          ]
        end
      end
    end
  end
end
