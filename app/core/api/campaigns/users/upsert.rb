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
                  email: form.email,
                  first_name: form.first_name,
                  last_name: form.last_name,
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
            email: form.email,
            external_id: form.try(:user_external_id) || user.external_id
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
