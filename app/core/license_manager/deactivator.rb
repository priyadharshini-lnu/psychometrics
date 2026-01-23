# frozen_string_literal: true

module LicenseManager
  class Deactivator < BaseCommand
    private_attr_reader :campaign, :updater_id, :user_ids_for_deactivation

    def initialize(campaign:, updater_id:, user_ids_for_deactivation:)
      @campaign = campaign
      @updater_id = updater_id
      @user_ids_for_deactivation = user_ids_for_deactivation
    end

    def call
      ::ActiveRecord::Base.transaction do
        active_license_usages.includes(:license, :project_license).find_each do |license_usage|
          license = license_usage.license
          license.decrement!(:used_number) if license.used_number.positive?
          project_license = license_usage.project_license
          project_license&.decrement!(:used_number) if project_license&.used_number&.positive?
        end

        active_license_usages.update_all(
          status_updated_by_id: updater_id,
          status_updated_at: Time.zone.now,
          status: 'inactive'
        )
      end

      broadcast :ok
    end

    def active_license_usages
      campaign.license_usages.where(
        status: 'active', user_id: user_ids_for_deactivation
      )
    end
  end
end
