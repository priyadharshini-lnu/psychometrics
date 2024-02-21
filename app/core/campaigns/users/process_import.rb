# frozen_string_literal: true

module Campaigns
  module Users
    class ProcessImport < BaseCommand
      private_attr_reader :campaign, :current_user, :rows, :operation, :job_record, :imported_users
      private_attr_accessor :users_those_pwd_not_changed

      PROFILE_FIELDS = %i[age gender timezone locale profile_locale].freeze

      def initialize(campaign, current_user, rows, operation, job_record)
        @campaign = campaign
        @current_user = current_user
        @rows = rows
        @operation = operation
        @job_record = job_record
        @users_those_pwd_not_changed = []
        @imported_users = []
      end

      def call # rubocop:disable Metrics/AbcSize
        profile_fields = @campaign.project.profile_setting.profile_fields.includes(:question)
        custom_fields = profile_fields.map { |pf| pf.question.name.to_sym }

        transaction do # rubocop:disable Metrics/BlockLength
          job_record.update!(total_tasks: rows.length)
          rows.each do |attrs| # rubocop:disable Metrics/BlockLength
            user = campaign.users.find_by(email: attrs[:email])
            user_data = attrs.slice(*Users::ParseImportData::HEADER_IMPORT_KEYS)
            profile_data = attrs.slice(*PROFILE_FIELDS)
            custom_fields_data = attrs.slice(*custom_fields).to_h do |name, value|
              field = profile_fields.find_by(questions: { name: name })
              [field.question_id.to_s, value]
            end

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
                                          custom_fields: (user.user_profile.custom_fields || {}).
                                          merge(custom_fields_data)
                                        ))
            else
              form = ::Campaigns::Users::Import::CreateForm.new(user_data.merge(operation: operation))
              ::Campaigns::Users::Create.call(form, campaign, current_user) do
                on(:error) do |error|
                  raise Licenses::NotEnoughError, error
                end
                on(:ok) do |u|
                  u.user_profile.update!(profile_data.merge(
                                           custom_fields: (u.user_profile.custom_fields || {}).
                                           merge(custom_fields_data)
                                         ))
                  imported_users << u
                end
              end
            end
            job_record.increment_completed_tasks!
          end
        end
        broadcast :ok, users_those_pwd_not_changed, imported_users
      end

      def update_user(user, attrs)
        pwd_to_be_not_changed = pwd_to_be_not_changed?(user, attrs)
        strong_attrs = attrs.except(:created_at, :active, :schedule_start_date, :schedule_end_date)
        strong_attrs = strong_attrs.except(:password) if pwd_to_be_not_changed

        attrs_to_update = strong_attrs.merge(modified_by_id: current_user.id).except(:overwrite_password)

        update_campaign_user(user, attrs)

        user.update(attrs_to_update)
        add_user_that_pwd_not_changed(user) if pwd_to_be_not_changed
        imported_users << user
        user
      end

      def update_campaign_user(user, attributes)
        attrs = attributes.slice(:active, :schedule_start_date, :schedule_end_date)
        attrs = attrs.except(:active) if attrs[:active].nil?

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
    end
  end
end
