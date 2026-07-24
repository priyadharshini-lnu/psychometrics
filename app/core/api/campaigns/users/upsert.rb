# frozen_string_literal: true

module Api
  module Campaigns
    module Users
      class Upsert < BaseCommand
        private_attr_reader :user, :form, :current_user, :params, :project

        def initialize(form, current_user, params:, project:, user: nil)
          @form = form
          @current_user = current_user
          @params = params
          @campaigns = params[:campaigns]
          @project = project
          @user = user
        end

        # rubocop:disable Metrics/BlockLength
        def call
          transaction do
            update_user if user
            create_or_update_project_datasheet

            if params[:campaigns].present?
              @user = params[:campaigns].map do |campaign_attrs|
                campaign = Campaign.find(campaign_attrs[:id])

                # rubocop:disable Style/OpenStructUse
                struct = OpenStruct.new(
                  email: user_attributes[:email],
                  first_name: user_attributes[:first_name],
                  last_name: user_attributes[:last_name],
                  gender: form.gender,
                  operation: campaign_attrs[:existing_record],
                  active: campaign_attrs[:active],
                  schedule_start_date: campaign_attrs[:schedule_start_date],
                  schedule_end_date: campaign_attrs[:schedule_end_date]
                )

                struct[:user_external_id] = form.user_external_id if params.key?(:user_external_id)

                if campaign_attrs.key?(:campaign_user_external_id)
                  struct[:campaign_user_external_id] = campaign_attrs[:campaign_user_external_id]
                end
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

            update_user_profile
          end

          broadcast :ok, user
        rescue Licenses::NotEnoughError => e
          broadcast :insufficient_license, e.message
        end

        private

        def update_user
          return unless user

          user.update!(user_attributes)
          user.user_profile.update!(gender: form.gender) if form.gender.present?
        end

        def update_user_profile
          return unless user
          return if form.locale.blank? && form.custom_profile_fields.blank?

          user.user_profile.update!(locale: form.locale) if form.locale.present?
          user.user_profile.custom_fields = form.resolved_custom_profile_fields if form.custom_profile_fields.present?
        end

        def create_or_update_project_datasheet
          return if form.project_datasheet.blank?

          ::SheetRows::UpsertData.call!(project.datasheet, user_attributes[:email], form.project_datasheet)
        end

        def user_attributes
          @user_attributes ||= {
            first_name: form.first_name || user&.first_name,
            last_name: form.last_name || user&.last_name,
            email: form.email || user&.email,
            external_id: form.try(:user_external_id) || user&.external_id
          }
        end
      end
    end
  end
end
