# frozen_string_literal: true

module Api
  module V2
    module ReportApprovalSetting
      class Schema < Api::Base::Schema
        def self.resource
          'report_approval_settings'
        end

        def self.attributes(attribute, type)
          admin_schema = Dry::Schema.define do
            required(:id).filled(:integer)
            required(:email).filled(:string)
          end

          proc do
            if %i[create update].include?(type)
              attribute[:qc_user_ids].array(:integer)
              attribute[:approver_user_ids].array(:integer)
              attribute[:approval_notification_user_ids].array(:integer)
            else
              attribute[:qcs].array(admin_schema)
              attribute[:approvers].array(admin_schema)
              attribute[:approval_notification_users].array(admin_schema)
            end
          end
        end

        def self.users_definition(_type)
          Dry::Schema.define do
            required(:id).filled(:integer)
            required(:email).filled(:string)
          end
        end

        def self.relationships(_)
          [
            { name: :campaign, resource: :campaigns, relationship: :one },
            { name: :report, resource: :reports, relationship: :one }
          ]
        end
      end
    end
  end
end
