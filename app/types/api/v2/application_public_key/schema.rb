# frozen_string_literal: true

module Api
  module V2
    module ApplicationPublicKey
      class Schema < Api::Base::Schema
        def self.resource
          'public_keys'
        end

        def self.links?
          false
        end

        def self.attributes(attribute, type)
          proc do
            if %i[create update].include?(type)
              optional(:description).maybe(:string)
              attribute[:public_key].filled(:string) if type == :create
              attribute[:disabled].maybe(:bool) if type == :update
            else
              attribute[:key_id].filled(:string)
              attribute[:fingerprint].maybe(:string)
              attribute[:disabled].filled(:bool)
              attribute[:created_at].maybe(:string)
              attribute[:updated_at].maybe(:string)
              optional(:description).maybe(:string)
              optional(:created_by).maybe(:string)
            end
          end
        end
      end
    end
  end
end
