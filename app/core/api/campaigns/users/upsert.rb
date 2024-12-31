# frozen_string_literal: true

module Api
  module Campaigns
    module Users
      class Upsert < BaseCommand
        private_attr_reader :user, :form, :current_user, :campaigns, :project

        def initialize(form, current_user, campaigns:, project:, user: nil)
          @form = form
          @current_user = current_user
          @campaigns = campaigns
          @project = project
          @user = user
        end

        def call
          transaction do
            update_user if user
            create_or_update_project_datasheet

            if campaigns.present?
              @user = campaigns.map do |campaign_attrs|
                campaign = Campaign.find(campaign_attrs[:id])

                # rubocop:disable Style/OpenStructUse
                struct = OpenStruct.new(
                  email: form.email,
                  first_name: form.first_name,
                  last_name: form.last_name,
                  operation: campaign_attrs[:existing_record],
                  active: campaign_attrs[:active],
                  schedule_start_date: campaign_attrs[:schedule_start_date],
                  schedule_end_date: campaign_attrs[:schedule_end_date]
                )

                struct[:external_id] = campaign_attrs[:external_id] if campaign_attrs.key?(:external_id)
                struct[:datasheet] = campaign_attrs[:datasheet] if campaign_attrs.key?(:datasheet)
                # rubocop:enable all

                response = ::Campaigns::Users::Create.call(
                  struct, campaign, current_user, user: user
                ) do
                  on(:insufficient_license) { |error| raise Api::Errors::NotEnoughLicences, error }
                end

                response[:ok]
              end.sample
            end
          end

          broadcast :ok, user
        rescue Licenses::NotEnoughError => e
          broadcast :insufficient_license, e.message
        end

        private

        def update_user
          return unless user

          user.update!(
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email
          )
        end

        def create_or_update_project_datasheet
          return if form.project_datasheet.blank?

          ::SheetRows::UpsertData.call!(project.datasheet, form.email, form.project_datasheet)
        end
      end
    end
  end
end
