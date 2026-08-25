# frozen_string_literal: true

module LicenseManager
  class Deductor < BaseCommand
    private_attr_accessor :campaign, :user, :license_type, :context, :client, :project, :report_family, :user_idp_plan

    def initialize(campaign:, user:, license_type:, context: {})
      @campaign = campaign
      @user = user
      @license_type = license_type
      @context = context
      @client = campaign.client
      @project = campaign.project
      validate_license_type
      validate_context_keys
      @report_family = ReportFamily.find(context[:report_family_id]) if context.key?(:report_family_id)
      @user_idp_plan = context[:idp_plan] if context.key?(:idp_plan)
    end

    def call
      return broadcast :ok if uat_user?
      return broadcast :ok if report_family.present? && already_used?

      license_usage_details = get_license_usage_details

      unless license_usage_details
        raise Licenses::NotEnoughError,
              I18n.t(
                'licenses.not_enough_license',
                client_name: client.name,
                report_name: report_family&.name || license_type.capitalize
              )
      end

      broadcast :ok, license_usage_details[:license_usage]
    end

    def uat_user?
      subject = user.is_a?(CampaignUser) ? user.user : user
      subject.respond_to?(:is_uat) && subject.is_uat
    end

    def already_used?
      case license_type
        when 'common'
          report_family.license_usages.exists?(campaign: campaign, user: user)
        when 'idp'
          LicenseUsage.exists?(
            campaign: campaign,
            user: user,
            consumer: user_idp_plan,
            status: :active
          )
        else
          false
      end
    end

    def validate_license_type
      unless License.types.include?(license_type)
        raise ArgumentError, "Invalid license_type #{license_type}. Valid types are #{valid_types.join(', ')}"
      end
    end

    def validate_context_keys
      if license_type == 'common' && !context.key?(:report_family_id)
        raise ArgumentError, 'report_family_id is required in context for common license type'
      elsif license_type == 'idp' && !context.key?(:idp_plan)
        raise ArgumentError, 'idp_plan is required in context for idp license type'
      end
    end

    def get_license_usage_details
      LicenseManager.get_applicable_licenses(license_type, client, context).each do |license|
        result = LicenseManager.get_valid_license_manager(license).new(
          license: license,
          campaign: campaign,
          user: user,
          **context
        ).deduct_license!(**context)
        return result if result
      end
      nil
    end

    def valid_types
      LicenseManager::LICENSE_MANAGERS.keys
    end
  end
end
