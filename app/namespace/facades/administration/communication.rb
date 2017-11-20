module Facades
  module Administration
    class Communication
      attr_reader :owners, :projects, :campaigns, :sub_campaigns, :communication, :memberships, :form

      def initialize(current_user, communication)
        @form = ::Forms::Communications::Simple.new(communication)
        @form.prepopulate!(current_user: current_user)
        @communication = communication
        @owners = fetch_owners(current_user)
        @projects = fetch_projects(current_user)
        @campaigns = fetch_campaigns(current_user)
        @sub_campaigns = fetch_sub_campaigns(current_user)
        @memberships = fetch_memberships
      end

      def show_projects?
        form.client_id.present?
      end

      def show_campaigns?
        show_projects? && form.project_id.present?
      end

      def show_sub_campaigns?
        show_campaigns? && form.campaign_id.present?
      end

      def show_recipients?
        form.end_level_id.present?
      end

      def show_memberships?
        show_recipients? && form.model.selected_recipients?
      end

      def show_kind?
        form.end_level_id.present?
      end

      def owner_behavior
        'communication-changeable owner_id'
      end

      def client_behavior
        'communication-changeable client_id owner-resettable'
      end

      def project_behavior
        'communication-changeable project_id owner-resettable client-resettable'
      end

      def campaign_behavior
        'communication-changeable campaign_id owner-resettable client-resettable project-resettable'
      end

      def sub_campaign_behavior
        'communication-changeable sub_campaign_id owner-resettable client-resettable project-resettable '\
        'campaign-resettable'
      end

      def memberships_behavior
        'owner-resettable client-resettable project-resettable campaign-resettable sub_campaign-resettable'
      end

      private

      def fetch_owners(user)
        client_policy_scope(user).roots
      end

      def fetch_projects(user)
        return Client.none if form.client_id.blank?
        client_policy_scope(user).projects_of(form.client_id)
      end

      def fetch_campaigns(user)
        return Client.none if form.project_id.blank?
        client_policy_scope(user).campaigns_of(form.project_id)
      end

      def fetch_sub_campaigns(user)
        return Client.none if form.campaign_id.blank?
        client_policy_scope(user).sub_campaigns_of(form.campaign_id)
      end

      def client_policy_scope(user)
        @client_policy_scope ||= ::Administration::ClientPolicy::Scope.new(user, Client).resolve
      end

      def fetch_memberships
        return Membership.none if form.end_level.blank? || !form.model.selected_recipients?
        Membership.member.
          where(client_id: [*form.model.end_level.descendant_ids, form.end_level.id]).join_user
      end
    end
  end
end
