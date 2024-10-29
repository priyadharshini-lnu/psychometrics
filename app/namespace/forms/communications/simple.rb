# frozen_string_literal: true

require 'reform/form/coercion'
# require "reform/form/dry"
module Forms
  module Communications
    class Simple < Base
      include Coercion

      model :communication

      properties :subject, :body, :recipients, :owner, :client, :project, :campaign, :end_level,
                 :membership_ids, :kind, :delivery_rule, :delivery_at,
                 :assessment, :delivery_interval, :delivery_interval_number, :delivery_interval_period,
                 :user_ids, :stop_reminder_datetime, :assessment_completion_status_code, :delivery_delay_hours

      property :assessment_id
      property :owner_id, type: Types::Params::Integer | Types::Params::Nil
      property :client_id, type: Types::Params::Integer | Types::Params::Nil
      property :project_id, type: Types::Params::Integer | Types::Params::Nil
      property :campaign_id, type: Types::Params::Integer | Types::Params::Nil
      property :end_level_id, type: Types::Params::Integer | Types::Params::Nil
      property :reminder_type, default: 'custom'
      property :stop_reminder, type: Types::Params::Bool | Types::Params::Nil

      validates :subject, :body, :client_id, :end_level_id, :recipients, :end_level, :kind, :client, presence: true

      validates :owner_id, :owner, presence: true, allow_nil: true

      validates :project, presence: true, if: proc { project_id.present? }
      validates :campaign, presence: true, if: :campaign_validation_required?
      validates :assessment_id, presence: true, if: proc { kind == 'completion' }
      validates :assessment, presence: true, if: proc { assessment_id.present? }

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
                if: :other?

      validates :delivery_at,
                presence: true,
                date: { after: proc { DateTime.current } },
                if: :specified_date_and_time_invitation?

      validates_with ::Validators::Forms::Communications::SelectedMembers, if: proc { recipients == 'selected' }

      validate :body_content

      def owner
        Client.find_by(id: owner_id)
      end

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

      def prepopulate!(options)
        user = options[:current_user]
        self.client_id = owner_id if user.is?(:superadmin) && owner_id.present?
        self.owner_id = client_id unless user.is?(:superadmin)
        self.end_level_id = campaign_id || project_id || client_id
      end

      def stop_reminder_datetime
        Time.zone.parse(super.to_s)&.to_datetime
      end

      def delivery_at
        Time.zone.parse(super.to_s)&.to_datetime
      end

      private

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
