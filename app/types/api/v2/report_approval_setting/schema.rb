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
            required(:id).filled(:string)
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
            attribute[:approvers_can_edit].filled(:bool?)
            attribute[:approvers_not_required].filled(:bool?)
            attribute[:do_not_send_notifications].filled(:bool?)
          end
        end

        def self.relationships(type)
          relations = [{ name: :report, resource: :reports, relationship: :one }]
          relations << { name: :campaign, resource: :campaigns, relationship: :one } if type == :multiple_response
          relations
        end
      end
    end
  end
end
