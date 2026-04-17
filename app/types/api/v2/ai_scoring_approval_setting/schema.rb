# frozen_string_literal: true

module Api
  module V2
    module AIScoringApprovalSetting
      class Schema < Api::Base::Schema
        def self.resource
          'ai_scoring_approval_settings'
        end

        def self.attributes(attribute, type)
          admin_schema = Dry::Schema.define do
            required(:id).filled(:string)
            required(:email).filled(:string)
          end

          proc do
            if %i[create update].include?(type)
              attribute[:assessor_ids].array(:integer)
              attribute[:approver_ids].array(:integer)
              optional(:approval_notification_user_ids).array(:integer)
            else
              attribute[:assessors].array(admin_schema)
              attribute[:approvers].array(admin_schema)
              attribute[:approval_notification_users].array(admin_schema)
            end
            attribute[:allow_bulk_approve].filled(:bool?)
            attribute[:allow_bulk_approve_scores].filled(:bool?)
            optional(:do_not_send_notifications).filled(:bool?)
            optional(:send_digest_emails).filled(:bool?)
            optional(:digest_delivery_mode).maybe(:string)
            optional(:digest_frequency).maybe(:string)
            optional(:digest_time).maybe(:string)
            optional(:digest_timezone).maybe(:string)
            optional(:digest_weekdays).array(:integer)
          end
        end

        def self.relationships(type)
          relations = [{ name: :assessment, resource: :assessments, relationship: :one }]
          relations << { name: :campaign, resource: :campaigns, relationship: :one } if type == :multiple_response
          relations
        end
      end
    end
  end
end
