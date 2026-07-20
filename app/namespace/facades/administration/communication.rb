# frozen_string_literal: true

module Facades
  module Administration
    class Communication
      attr_reader :projects, :campaigns, :communication, :memberships, :form, :delivery_rules,
                  :assessments, :assessment_center_groups

      include EmailDelivery

      delegate :assessment_selection, to: :form

      def initialize(current_user, communication)
        @form = ::Forms::Communications::Simple.new(communication)
        @form.prepopulate!(current_user: current_user)
        @communication = communication
        @projects = fetch_projects(current_user)
        @campaigns = fetch_campaigns(current_user)
        @delivery_rules = fetch_delivery_rules
        @memberships = fetch_memberships
        @assessments = fetch_assessments
        @assessment_center_groups = fetch_assessment_center_groups
      end

      def show_projects?
        form.client_id.present?
      end

      def project_level_email?
        %w[magic_link_email].include?(form.kind)
      end

      def show_campaigns?
        return false if project_level_email?

        show_projects? && form.project_id.present? && !form.project.end_level?
      end

      def show_recipients?
        return false if workshop_communication? || project_level_email? || form.kind == 'report_available' ||
                        form.kind == 'assessment_center_booking_summary'

        form.end_level_id.present?
      end

      def show_memberships?
        show_recipients? && form.model.selected_recipients?
      end

      def cc_users
        fetch_admin_users
      end

      def show_cc_users?
        form.end_level_id.present?
      end

      def show_kind?
        form.end_level_id.present?
      end

      def show_assessment_center_groups?
        workshop_communication?
      end

      def show_delivery_rules?
        return false if workshop_communication? || project_level_email?

        form.kind.present? &&
          %w[new_users new_assignment].exclude?(form.recipients) &&
          form.kind != 'completion' &&
          form.kind != 'report_available' &&
          form.kind != 'assessment_center_booking_summary'
      end

      def show_assessments?
        show_kind? && form.kind == 'completion'
      end

      def show_delivery_intervals?
        %w[reminder workshop_invite_reminder].include?(form.kind)
      end

      def show_stop_reminder?
        !workshop_communication?
      end

      def show_stop_reminder_datetime?
        form.stop_reminder
      end

      def show_custom_reminder?
        form.reminder_type == 'custom'
      end

      def show_timeframes_reminder?
        form.reminder_type == 'timeframes'
      end

      def client_behavior
        'communication-changeable client_id'
      end

      def project_behavior
        'communication-changeable project_id client-resettable'
      end

      def campaign_behavior
        'communication-changeable campaign_id client-resettable project-resettable'
      end

      def sub_campaign_behavior
        'communication-changeable sub_campaign_id client-resettable project-resettable ' \
          'campaign-resettable'
      end

      def memberships_behavior
        'client-resettable project-resettable campaign-resettable sub_campaign-resettable'
      end

      def cc_behavior
        'client-resettable project-resettable campaign-resettable sub_campaign-resettable'
      end

      def admin_recipients_behavior
        'client-resettable project-resettable campaign-resettable sub_campaign-resettable'
      end

      def assessment_center_group_behavior
        'communication-changeable sub_campaign_id client-resettable project-resettable ' \
          'campaign-resettable'
      end

      def show_inputs_for_date_and_time?
        return false if %w[invitation other].exclude?(form.kind)

        form.delivery_rule == 'specific_datetime'
      end

      def delivery_interval_periods
        array = [%w[Hours hours], %w[Days days], %w[Weeks weeks], %w[Months months]]
        array.unshift(%w[Minutes minute]) unless Rails.env.production?
        array
      end

      def reminder_types
        [%w[Timeframes timeframes], %w[Custom custom]]
      end

      def show_assessment_selection?
        form.delivery_rule == 'not_competed' && form.kind == 'reminder'
      end

      def show_assessment_multiselect?
        show_assessment_selection? && form.assessment_selection == 'selected'
      end

      def show_delivery_schedule_config?
        form.kind == 'assessment_center_booking_summary'
      end

      def admin_recipients
        fetch_admin_users
      end

      private

      def workshop_communication?
        ::Communication::WORKSHOP_COMMUNICATION_KINDS.include?(form.kind)
      end

      def fetch_projects(user)
        return Client.none if form.client_id.blank?

        client_policy_scope(user).where(ancestry: form.client_id).enabled
      end

      def fetch_campaigns(user)
        return Client.none if form.project_id.blank?

        ::Administration::CampaignPolicy::Scope.new(user, Campaign).resolve.where(project_id: form.project_id)
      end

      def fetch_assessment_center_groups
        return CampaignAssessmentGroup.none if form.campaign_id.blank?

        CampaignAssessmentGroup.assessment_center.where(campaign_id: form.campaign_id).order(:name)
      end

      def client_policy_scope(user)
        @client_policy_scope ||= ::Administration::ClientPolicy::Scope.new(user, Client).resolve
      end

      def fetch_assessments
        return Assessment.none if form.end_level.blank?

        form.campaign&.assessments
      end

      def fetch_memberships
        return User.none if form.end_level.blank? || !form.model.selected_recipients? || form.campaign.blank?

        form.campaign.users.
          where(campaign_users: { active: true }, users: { disabled: false })
      end

      def fetch_delivery_rules
        return if form.kind.blank?

        ::Communication.delivery_rules.keys.select { |key| EmailDelivery::RULES[kind_type_symbol]&.include?(key) }
      end

      def kind_type_symbol
        form.kind&.to_sym
      end

      def fetch_admin_users
        return [] if form.end_level_id.blank?

        User.distinct.
          joins(:memberships).
          where(disabled: false).
          where(memberships: { disabled: false }).
          where(
            '(
              memberships.client_id = :client_id AND
              memberships.role = :client_admin_role
            ) OR (
              memberships.client_id = :project_id AND
              memberships.role = :project_admin_role
            ) OR (
              memberships.campaign_id = :campaign_id AND
              memberships.role = :campaign_admin_role
            )',
            client_id: form.client_id,
            project_id: form.project_id,
            campaign_id: form.campaign_id,
            client_admin_role: Membership.roles[:client_admin],
            project_admin_role: Membership.roles[:project_admin],
            campaign_admin_role: Membership.roles[:campaign_admin]
          )
      end
    end
  end
end
