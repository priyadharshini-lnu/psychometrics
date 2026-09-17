# frozen_string_literal: true

module Api
  module Administration
    # Shared base for the new Communication Center policies (templates, deliveries, delivery emails).
    # All three gate on the same :communications view/manage permissions and the same
    # use_new_communication_center client feature -- what differs is only how a record resolves to a
    # project/campaign (#record_scope) and how each Scope turns the permitted ids into a query.
    class CommunicationCenterPolicy < BasePolicy
      def index?
        feature_enabled? && (@user.is?(:superadmin) || @user.has_grant?(:communications, :view))
      end

      def create?
        return false unless feature_enabled?(project_id: project_id, campaign_id: campaign_id)
        return true if @user.is?(:superadmin)

        has_permission?(:communications, :manage)
      end

      class Scope < BasePolicy::Scope
        private

        # Campaigns and projects the user may view communications for, already filtered down to clients
        # with the new Communication Center enabled. Returns [campaign_ids, project_ids] -- subclasses
        # turn those into their own query, since each model reaches campaign/project by a different join.
        def permitted_campaign_and_project_ids
          campaign_ids = campaign_admin_campaign_ids
          project_ids = filter_projects_by_active_client(project_admin_project_ids)

          client_project_ids, client_campaign_ids =
            client_admin_project_and_campaign_ids(permitted_client_admin_client_ids)

          [(campaign_ids + client_campaign_ids).uniq, (project_ids + client_project_ids).uniq]
        end

        def campaign_admin_campaign_ids
          return [] unless user.is?(:campaign_admin)

          user.campaign_admin_campaigns.to_a.select { |c| active_client_ids.include?(c.project&.parent_id) }
        end

        def project_admin_project_ids
          user.project_admin_client_ids.select do |project_id|
            user.has_permission?(:communications, :view, project_id: project_id)
          end
        end

        def permitted_client_admin_client_ids
          user.client_admin_client_ids.select do |client_id|
            user.has_permission?(:communications, :view, project_id: client_id)
          end & active_client_ids
        end

        # Neither CommunicationDelivery nor CommunicationEmail has a client_id column (unlike
        # CommunicationTemplate) -- resolve a client_admin's permitted client ids down to the concrete
        # project/campaign ids under each client so they fold into the filters above.
        def client_admin_project_and_campaign_ids(client_ids)
          return [[], []] if client_ids.empty?

          project_ids = Client.where(id: client_ids).flat_map { |client| client.projects.pluck(:id) }
          campaign_ids = Campaign.where(project_id: project_ids).pluck(:id)
          [project_ids, campaign_ids]
        end

        # Root-depth clients with the new Communication Center enabled -- the set every non-superadmin
        # campaign/project/client id must be filtered down to before it can appear in a scope.
        def active_client_ids
          @active_client_ids ||= ClientFeature.joins(:client).
                                 where(clients: { ancestry: nil }, use_new_communication_center: true).
                                 pluck(:client_id)
        end

        # project_ids here are project-depth Client rows -- resolve each to its owning root client
        # (Client#client) to check against active_client_ids, since use_new_communication_center only
        # carries meaning on the root row.
        def filter_projects_by_active_client(project_ids)
          return [] if project_ids.empty?

          Client.where(id: project_ids).select { |project| active_client_ids.include?(project.client.id) }.map(&:id)
        end
      end

      private

      # Subclasses define #record_scope, and override #record_feature_enabled? when the record can
      # resolve its own client more directly than Client.communication_center_active? can.
      def record_permitted?(grant)
        return false unless record_feature_enabled?
        return true if @user.is?(:superadmin)

        @user.has_permission?(:communications, grant, **record_scope)
      end

      def record_feature_enabled?
        feature_enabled?(**record_scope)
      end

      def feature_enabled?(project_id: nil, campaign_id: nil)
        Settings.features.communication_center_enabled &&
          Client.communication_center_active?(project_id: project_id, campaign_id: campaign_id)
      end
    end
  end
end
