# frozen_string_literal: true

module Campaigns
  module Users
    class ProcessImport < BaseCommand
      private_attr_reader :campaign, :current_user, :rows, :operation, :job_record, :imported_users
      private_attr_accessor :users_those_pwd_not_changed

      def initialize(campaign, current_user, rows, operation, job_record)
        @campaign = campaign
        @current_user = current_user
        @rows = rows
        @operation = operation
        @job_record = job_record
        @users_those_pwd_not_changed = []
        @imported_users = []
      end

      def call
        transaction do
          job_record.update!(total_tasks: rows.length)
          rows.each do |attrs|
            user = campaign.users.find_by(email: attrs[:email])
            if user
              update_user!(user, attrs)
            else
              form = ::Campaigns::Users::Import::CreateForm.new(attrs.merge(operation: operation))
              ::Campaigns::Users::Create.call(form, campaign, current_user) do
                on(:error) do |error|
                  raise Licenses::NotEnoughError, error
                end
                on(:ok) do |u|
                  imported_users << u
                end
              end
            end
            job_record.increment_completed_tasks!
          end
        end
        broadcast :ok, users_those_pwd_not_changed, imported_users
      end

      def update_user!(user, attrs)
        pwd_to_be_not_changed = pwd_to_be_not_changed?(user, attrs)
        strong_attrs = attrs.except(:created_at, :active)
        strong_attrs = strong_attrs.except(:password) if pwd_to_be_not_changed

        attrs_to_update = strong_attrs.merge(modified_by_id: current_user.id)

        update_active_value(user, attrs[:active])

        user.update!(attrs_to_update)
        add_user_that_pwd_not_changed(user) if pwd_to_be_not_changed
        imported_users << user
        user
      end

      def update_active_value(user, active)
        return if active.nil?

        campaign.campaign_users.where(user_id: user.id).update_all(active: active)
      end

      def add_user_that_pwd_not_changed(user)
        users_those_pwd_not_changed << {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        }
      end

      def pwd_to_be_not_changed?(user, attrs)
        attrs[:password].present? && user.encrypted_password.present?
      end
    end
  end
end
