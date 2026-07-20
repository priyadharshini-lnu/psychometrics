# frozen_string_literal: true

module Api
  module V2
    module ApplicationIpWhitelistEntry
      class Schema < Api::Base::Schema
        def self.resource
          'application_ip_whitelist_entries'
        end

        def self.attributes(attribute, type)
          proc do
            case type
              when :create
                optional(:description).maybe(:string)
                attribute[:ip_or_cidr].filled(:string)
              when :update
                optional(:description).maybe(:string)
                optional(:enabled).maybe(:bool)
            end
          end
        end

        def self.bulk_create
          Dry::Schema.define do
            required(:data).hash do
              required(:attributes).hash do
                required(:entries).array(:hash) do
                  required(:ip_or_cidr).filled(:string)
                  optional(:description).maybe(:string)
                end
              end
            end
          end
        end
      end
    end
  end
end
