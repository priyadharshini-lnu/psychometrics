# frozen_string_literal: true

module Campaigns
  module Users
    class ProcessImport < BaseCommand
      ImportFailed = Class.new(StandardError)

      private_attr_reader :campaign, :current_user, :rows, :operation, :job_record, :imported_users
      private_attr_accessor :users_those_pwd_not_changed

      PROFILE_FIELDS = %i[age gender timezone locale profile_locale].freeze
      CHUNK_SIZE = 500

      def initialize(campaign, current_user, rows, operation, job_record)
        @campaign = campaign
        @current_user = current_user
        @rows = rows
        @operation = operation
        @job_record = job_record
        @users_those_pwd_not_changed = []
        @imported_users = []
      end

      def call # rubocop:disable Metrics/AbcSize,Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
        profile_fields = @campaign.project.profile_setting.profile_fields.includes(:question)
        custom_fields = profile_fields.map { |pf| pf.question.name.to_sym }

        job_record.update!(total_tasks: rows.length)

        rows.each_slice(CHUNK_SIZE) do |rows_chunk| # rubocop:disable Metrics/BlockLength
          transaction do # rubocop:disable Metrics/BlockLength
            rows_chunk.each do |attrs| # rubocop:disable Metrics/BlockLength
              user = campaign.users.find_by(email: attrs[:email])
              user_data = attrs.slice(*Users::ParseImportData::HEADER_IMPORT_KEYS)
              profile_data = attrs.slice(*PROFILE_FIELDS)
              custom_fields_data = attrs.slice(*custom_fields).to_h do |name, value|
                field = profile_fields.find_by(questions: { name: name })
                [field.question_id.to_s, value]
              end

              manager = find_manager(attrs[:manager_email])
              user_data[:manager_id] = manager&.id

              if user
                user = update_user(user, user_data)
                unless user.valid?
                  job_record.complete!(
                    [
                      I18n.t(
                        'activemodel.errors.models.user.attributes.import_data.user_update_failed',
                        email: user.email, error: user.errors.full_messages.join(',')
                      )
                    ]
                  )
                  raise ActiveRecord::Rollback
                end
                user.user_profile.update!(profile_data.merge(
                                            custom_fields: (
                                              user.user_profile.custom_fields || {}
                                            ).transform_keys(&:to_s).merge(custom_fields_data)
                                          ))
              else
                form = ::Campaigns::Users::Import::CreateForm.new(user_data.merge(operation: operation))
                ::Campaigns::Users::Create.call(form, campaign, current_user) do
                  on(:insufficient_license) do |error|
                    raise Licenses::NotEnoughError, error
                  end
                  on(:ok) do |u|
                    u.user_profile.update!(profile_data.merge(
                                             custom_fields: (u.user_profile.custom_fields || {}).transform_keys(&:to_s).
                                             merge(custom_fields_data)
                                           ))
                    imported_users << u
                  end
                end
              end
              job_record.increment_completed_tasks!
            end
          end
        end

        broadcast :ok, users_those_pwd_not_changed, imported_users
      rescue ImportFailed, Licenses::NotEnoughError => e
        job_record.complete!([e.message])
        broadcast :ok, users_those_pwd_not_changed, imported_users
      end

      private

      def update_user(user, attrs)
        pwd_to_be_not_changed = pwd_to_be_not_changed?(user, attrs)
        strong_attrs = attrs.except(:created_at, :active, :schedule_start_date, :schedule_end_date, :manager_email,
                                    :current_job_role, :target_job_role, :level)
        strong_attrs = strong_attrs.except(:password) if pwd_to_be_not_changed
        strong_attrs = strong_attrs.merge(mobile_verified: false) if mobile_number_changed?(user, attrs)

        attrs_to_update = strong_attrs.merge(modified_by_id: current_user.id).except(:overwrite_password)

        update_campaign_user(user, attrs)

        user.update(attrs_to_update)
        add_user_that_pwd_not_changed(user) if pwd_to_be_not_changed
        imported_users << user
        user
      end

      def update_campaign_user(user, attributes)
        attrs = attributes.slice(:active, :schedule_start_date, :schedule_end_date, :level)
        attrs = attrs.except(:active) if attrs[:active].nil?
        attrs[:current_job_role_id] = find_job_role(attributes[:current_job_role])&.id
        attrs[:target_job_role_id] = find_job_role(attributes[:target_job_role])&.id

        campaign.campaign_users.find_by(user_id: user.id).update!(attrs)
      end

      def add_user_that_pwd_not_changed(user)
        users_those_pwd_not_changed << {
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        }
      end

      def pwd_to_be_not_changed?(user, attrs)
        attrs[:password].present? && user.encrypted_password.present? && attrs[:overwrite_password] != 'Yes'
      end

      def find_manager(email)
        return if email.blank?

        manager = campaign.users.find_by(email: email)
        return manager if manager

        manager_row = @rows.find { |row| row[:email] == email }
        create_manager(manager_row) if manager_row
      end

      def create_manager(manager_row)
        return unless manager_row

        user_data = manager_row.slice(*Users::ParseImportData::HEADER_IMPORT_KEYS)
        form = ::Campaigns::Users::Import::CreateForm.new(user_data.merge(operation: operation))

        ::Campaigns::Users::Create.call(form, campaign, current_user) do |result|
          result.on(:insufficient_license) do |error|
            raise Licenses::NotEnoughError, error
          end
          result.on(:ok) do |manager|
            return manager
          end
        end
      end

      def find_job_role(role_name)
        return nil if role_name.blank?

        JobRole.find_by(name: role_name, project_id: campaign.project_id)
      end

      def mobile_number_changed?(user, attrs)
        user.mobile_number != attrs[:mobile_number]
      end
    end
  end
end
