# frozen_string_literal: true

module Api
  module V2
    module ApiKey
      class Schema < Api::Base::Schema
        def self.resource
          'api_keys'
        end

        def self.attributes(attribute, type)
          proc do
            if %i[create update].include?(type)
              optional(:description).maybe(:string)
            else
              attribute[:key].filled(:string)
              attribute[:token].filled(:string)
              attribute[:disabled].filled(:bool)
              attribute[:created_at].filled(:string)
              attribute[:updated_at].filled(:string)
              optional(:description).maybe(:string)
              optional(:created_by_id).maybe(:integer)
              optional(:updated_by_id).maybe(:integer)
            end
          end
        end

        def self.extra_index_meta_schema
          proc do
            optional(:user).hash do
              optional(:email).filled(:string)
            end
          end
        end
      end
    end
  end
end
