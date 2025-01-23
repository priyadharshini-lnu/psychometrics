# frozen_string_literal: true

module Api
  module V2
    module Report
      class Schema < Api::Base::Schema
        def self.resource
          'reports'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
            attribute[:provider].filled(:string)
            optional(:description).maybe(:string)
            optional(:disabled).maybe(:bool)
            optional(:data_only).maybe(:bool)
            optional(:icon_color).maybe(:string)
            optional(:default_language).maybe(:string)
            optional(:other_languages).maybe(:array?).each(:str?)
            optional(:external_settings).maybe(:hash) do
              optional(:report_id).maybe(:string)
            end
            optional(:tag_list).maybe(:array).each(:string)
          end
        end

        def self.relationships(_)
          [
            { name: :owner, resource: :clients, relationship: :one, required: false, allowed_blank: true },
            { name: :assessments, resource: :assessments, relationship: :many, required: false, allowed_blank: true }
          ]
        end
      end
    end
  end
end
