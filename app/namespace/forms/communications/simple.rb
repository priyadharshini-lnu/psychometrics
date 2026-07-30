# frozen_string_literal: true

require 'reform/form/coercion'
# require "reform/form/dry"
module Forms
  module Communications
    class Simple < Base
      include Coercion

      model :communication

      properties :subject, :body, :recipients, :client, :project, :campaign, :end_level,
                 :membership_ids, :kind, :delivery_rule, :delivery_at,
                 :assessment, :delivery_interval, :delivery_interval_number, :delivery_interval_period,
                 :user_ids, :stop_reminder_datetime, :assessment_completion_status_code, :delivery_delay_hours,
                 :cc_user_ids

      property :assessment_id
      property :client_id, type: Types::Params::Integer | Types::Params::Nil
      property :project_id, type: Types::Params::Integer | Types::Params::Nil
      property :campaign_id, type: Types::Params::Integer | Types::Params::Nil
      property :end_level_id, type: Types::Params::Integer | Types::Params::Nil
      property :reminder_type, default: 'custom'
      property :stop_reminder, type: Types::Params::Bool | Types::Params::Nil
      property :campaign_assessment_group_id, type: Types::Params::Integer | Types::Params::Nil
      property :assessment_selection
      property :selected_assessment_ids, type: Types::Params::Array, default: []
      property :cc_user_ids, type: Types::Params::Array, default: []

      property :delivery_start_date, type: Types::Params::Date | Types::Params::Nil
      property :delivery_end_date, type: Types::Params::Date | Types::Params::Nil
      property :delivery_time_of_day, type: Types::Params::Time | Types::Params::Nil
      property :delivery_timezone, type: Types::Params::String | Types::Params::Nil
      property :delivery_frequency, type: Types::Params::String | Types::Params::Nil
      property :delivery_weekdays, type: Types::Params::Array, default: []

      validates :delivery_start_date, :delivery_end_date, :delivery_time_of_day, :delivery_timezone,
                :delivery_frequency, presence: true, if: :assessment_center_booking_summary?
      validate :validate_end_date_after_start_date, if: :assessment_center_booking_summary?
      validate :validate_weekdays_presence, if: :assessment_center_booking_summary?
      validate :validate_delivery_start_datetime_not_in_past, if: :assessment_center_booking_summary?

      def validate_delivery_start_datetime_not_in_past
        return if delivery_start_date.blank? || delivery_time_of_day.blank?

        normalized_tz = TimezoneHelper.normalize(delivery_timezone)
        tz = ActiveSupport::TimeZone[normalized_tz] || Time.zone
        start_datetime = tz.local(
          delivery_start_date.year,
          delivery_start_date.month,
          delivery_start_date.day,
          delivery_time_of_day.hour,
          delivery_time_of_day.min
        )

        return unless start_datetime < Time.current

        today = Date.current
        if delivery_start_date < today
          errors.add(:delivery_start_date, :in_past,
                     message: I18n.t('administration.communications.form.error_msgs.delivery_start_date_in_past'))
        elsif delivery_start_date == today
          errors.add(:delivery_time_of_day, :in_past,
                     message: I18n.t('administration.communications.form.error_msgs.delivery_time_in_past'))
        end
      end

      def assessment_center_booking_summary?
        kind == 'assessment_center_booking_summary'
      end

      def validate_end_date_after_start_date
        return if delivery_start_date.blank? || delivery_end_date.blank?

        if delivery_end_date < delivery_start_date
          errors.add(:delivery_end_date, :after,
                     message: I18n.t(
                       'administration.communications.form.error_msgs.delivery_end_date_after_start_date'
                     ))
        end
      end

      def validate_weekdays_presence
        return unless delivery_frequency == 'specific_weekdays'

        if delivery_weekdays.blank? || delivery_weekdays.compact_blank.empty?
          errors.add(:delivery_weekdays,
                     I18n.t('administration.communications.form.error_msgs.delivery_weekdays_required'))
        end
      end

      validates :subject, :body, :client_id, :end_level_id, :recipients, :end_level, :kind, :client, presence: true

      validates :project, presence: true, if: proc { project_id.present? }
      validates :campaign, presence: true, if: :campaign_validation_required?
      validates :assessment_id, presence: true, if: proc { kind == 'completion' }
      validates :assessment, presence: true, if: proc { assessment_id.present? }
      validates :campaign_assessment_group_id, presence: true, if: proc {
        ::Communication::WORKSHOP_COMMUNICATION_KINDS.include?(kind)
      }

      validates :stop_reminder_datetime, presence: true,
                date: { after: proc { DateTime.current } },
                if: proc { reminder? && stop_reminder }

      validates :delivery_interval_number,
                :delivery_interval_period,
                presence: true, if: :custom_reminder?

      validates :delivery_interval_number,
                numericality: { only_integer: true, greater_than_or_equal_to: 1 },
                if: :custom_reminder?

      validates :delivery_interval,
                presence: true,
                inclusion: { in: ::Helpers::Communications.reminder_timeframes },
                if: :timeframes_reminder?

      validates :delivery_rule,
                presence: true,
                inclusion: { in: ::Facades::Administration::EmailDelivery::RULES[:reminder] },
                if: proc { reminder? && %w[new_users new_assignment].exclude?(recipients) }

      validates :delivery_rule,
                presence: true,
                inclusion: { in: ::Facades::Administration::EmailDelivery::RULES[:invitation] },
                if: -> { invitation? && %w[new_users new_assignment].exclude?(recipients) }

      validates :delivery_rule,
                presence: true,
                inclusion: { in: ::Facades::Administration::EmailDelivery::RULES[:other] },
                if: -> { other? && %w[new_users new_assignment].exclude?(recipients) }

      validates :delivery_at,
                presence: true,
                date: { after: proc { DateTime.current } },
                if: :specified_date_and_time_invitation?

      validates_with ::Validators::Forms::Communications::SelectedMembers, if: proc { recipients == 'selected' }

      validate :body_content
      validate :selected_assessments_presence, if: -> { assessment_selection == 'selected' }

      def client
        Client.find_by(id: client_id)
      end

      def project
        Client.find_by(id: project_id)
      end

      def campaign
        Campaign.find_by(id: campaign_id)
      end

      def assessment
        Assessment.find_by(id: assessment_id)
      end

      def end_level_id
        campaign_id || project_id || client_id
      end

      def end_level
        campaign || project || client
      end

      def prepopulate!(_options)
        self.end_level_id = campaign_id || project_id || client_id
        self.assessment_selection ||= model.selected_assessments.any? ? 'selected' : 'all'
      end

      def stop_reminder_datetime
        Time.zone.parse(super.to_s)&.to_datetime
      end

      def delivery_at
        Time.zone.parse(super.to_s)&.to_datetime
      end

      private

      def selected_assessments_presence
        if assessment_selection == 'selected' && selected_assessment_ids.compact_blank.empty?
          errors.add(:selected_assessment_ids, :blank)
        end
      end

      def body_content
        Mustache.render(body)
      rescue Mustache::Parser::SyntaxError
        errors.add(:body, I18n.t('enums.communication.body.error'))
      end

      def reminder?
        kind == 'reminder'
      end

      def workshop_invite_reminder?
        kind == 'workshop_invite_reminder'
      end

      def invitation?
        kind == 'invitation'
      end

      def other?
        kind == 'other'
      end

      def project_level_communication?
        %w[magic_link_email].include?(kind)
      end

      def campaign_validation_required?
        !project_level_communication? && campaign_id.present?
      end

      def specified_date_and_time_invitation?
        (invitation? || other?) && delivery_rule == 'specific_datetime'
      end

      def custom_reminder?
        (reminder? || workshop_invite_reminder?) && reminder_type == 'custom'
      end

      def timeframes_reminder?
        (reminder? || workshop_invite_reminder?) && reminder_type == 'timeframes'
      end
    end
  end
end
