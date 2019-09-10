# frozen_string_literal: true

require 'reform/form/coercion'
module Forms
  module Communications
    class Simple < Base
      include Coercion

      model :communication

      properties :subject, :body, :recipients, :owner, :client, :project, :campaign, :sub_campaign, :end_level,
                 :membership_ids, :kind, :delivery_rule, :delivery_at,
                 :assessment, :delivery_interval, :delivery_interval_number, :delivery_interval_period,
                 :user_ids, :stop_reminder_datetime

      property :assessment_id
      property :owner_id, type: Types::Form::Int
      property :client_id, type: Types::Form::Int
      property :project_id, type: Types::Form::Int
      property :campaign_id, type: Types::Form::Int
      property :sub_campaign_id, type: Types::Form::Int
      property :end_level_id, type: Types::Form::Int
      property :reminder_type, default: 'custom'
      property :stop_reminder, type: Types::Form::Bool

      validates :subject, :body, :client_id, :end_level_id, :recipients, :end_level, :kind, :client, presence: true

      validates :owner_id, :owner, presence: true, allow_nil: true

      validates :project, presence: true, if: proc { project_id.present? }
      validates :campaign, presence: true, if: proc { campaign_id.present? }
      validates :sub_campaign, presence: true, if: proc { sub_campaign_id.present? }
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
                if: :reminder?

      validates :delivery_rule,
                presence: true,
                inclusion: { in: ::Facades::Administration::EmailDelivery::RULES[:invitation] },
                if: :invitation?

      validates :delivery_rule,
                presence: true,
                inclusion: { in: ::Facades::Administration::EmailDelivery::RULES[:other] },
                if: :other?

      validates :delivery_at,
                presence: true,
                date: { after: proc { DateTime.current } },
                if: :specified_date_and_time_invitation?

      validates_with ::Validators::Forms::Communications::SelectedMembers, if: proc { recipients == 'selected' }

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
        Client.find_by(id: campaign_id)
      end

      def sub_campaign
        Client.find_by(id: sub_campaign_id)
      end

      def assessment
        Assessment.find_by(id: assessment_id)
      end

      def end_level_id
        sub_campaign_id || campaign_id || project_id || client_id
      end

      def end_level
        sub_campaign || campaign || project || client
      end

      def prepopulate!(options)
        user = options[:current_user]
        self.owner_id = client_id if user.is?(:client_admin) || user.is?(:project_admin)
        self.client_id = owner_id if user.is?(:superadmin) && owner_id.present?
        self.end_level_id = sub_campaign_id || campaign_id || project_id || client_id
      end

      def stop_reminder_datetime
        Time.zone.parse(super.to_s)&.to_datetime
      end

      def delivery_at
        Time.zone.parse(super.to_s)&.to_datetime
      end

      private

      def reminder?
        kind == 'reminder'
      end

      def invitation?
        kind == 'invitation'
      end

      def other?
        kind == 'other'
      end

      def specified_date_and_time_invitation?
        (invitation? || other?) && delivery_rule == 'specific_datetime'
      end

      def custom_reminder?
        reminder? && reminder_type == 'custom'
      end

      def timeframes_reminder?
        reminder? && reminder_type == 'timeframes'
      end
    end
  end
end
