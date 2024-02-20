# frozen_string_literal: true

module Api
  module V2
    module User
      class Schema < Api::Base::Schema
        def self.resource
          'users'
        end

        def self.attributes(attribute, type)
          if type == :create
            create_attributes(attribute)
          else
            base_attributes(attribute)
          end
        end

        def self.create_attributes(attribute)
          proc do
            attribute[:email].filled(:string)
            attribute[:first_name].filled(:string)
            attribute[:last_name].filled(:string)
          end
        end

        def self.update_attributes(attribute)
          proc do
            attribute[:email].filled(:string)
            attribute[:first_name].filled(:string)
            attribute[:last_name].filled(:string)
            optional(:user_profile_data).hash do
              optional(:locale).maybe(:string)
              optional(:timezone).maybe(:string)
            end
          end
        end

        def self.base_attributes(attribute)
          proc do
            attribute[:email].filled(:string)
            attribute[:name].filled(:string)
            attribute[:full_name].filled(:string)
            attribute[:first_name].filled(:string)
            attribute[:last_name].filled(:string)
            optional(:updated_at).filled(:string)
            attribute[:disabled].filled(:bool)
            attribute[:enable_2fa].filled(:bool)
            optional(:created_by).maybe(:string)
            optional(:modified_by).maybe(:string)
            attribute[:role].filled(:string)
            optional(:photo_url).maybe(:string)
          end
        end

        def self.individual_record_meta_schema
          Dry::Schema.define do
            required(:permissions).hash do
              required(:reset_password).filled(:bool)
              required(:remove).filled(:bool)
              required(:toggle_enable_2fa).filled(:bool)
            end
          end
        end

        def self.reset_password_request
          json_api_attributes do
            required(:automatically_generate_password).filled(:bool)
            optional(:password).value(:string)
            optional(:send_password_email).value(:bool)
            optional(:change_password_on_login).value(:bool)
          end
        end

        def self.reset_password_response
          json_api_attributes do
            optional(:password).maybe(:string)
          end
        end

        def self.change_password_request
          json_api_attributes do
            required(:current_password).filled(:string)
            required(:password).filled(:string)
            required(:password_confirmation).filled(:string)
          end
        end

        def self.change_password_response
          json_api_attributes do
            required(:message).maybe(:string)
          end
        end

        def self.assessors_scores_response
          json_api_records do
            Dry::Schema.define do
              required(:id).filled(:string)
              required(:type).filled(:string)
              required(:attributes).hash do
                required(:id).maybe(:str?)
                required(:evaluator).hash do
                  optional(:id).maybe(:str?)
                  optional(:first_name).maybe(:str?)
                  optional(:last_name).maybe(:str?)
                  optional(:email).maybe(:str?)
                end
                required(:assessment).hash do
                  optional(:id).maybe(:str?)
                  optional(:name).maybe(:str?)
                end
                optional(:scores).hash {} # rubocop:disable Lint/EmptyBlock
              end
            end
          end
        end
      end
    end
  end
end
