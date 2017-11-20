require 'reform/form/coercion'
module Forms
  module Communications
    class Simple < Base
      include Coercion

      model :communication

      properties :subject, :body, :recipients, :owner, :client, :project, :campaign, :sub_campaign, :end_level,
                 :membership_ids, :kind

      property :owner_id, type: Types::Form::Int
      property :client_id, type: Types::Form::Int
      property :project_id, type: Types::Form::Int
      property :campaign_id, type: Types::Form::Int
      property :sub_campaign_id, type: Types::Form::Int
      property :end_level_id, type: Types::Form::Int

      validates :subject, :body, :client_id, :end_level_id, :recipients, :end_level, :kind, :client,
                presence: true

      validates :owner_id, :owner, presence: true, allow_nil: true

      validates :project, presence: true, if: proc { project_id.present? }
      validates :campaign, presence: true, if: proc { project_id.present? }
      validates :sub_campaign, presence: true, if: proc { project_id.present? }

      def owner
        Client.find_by(id: owner_id) if owner_id.present?
      end

      def client
        Client.find_by(id: client_id) if client_id.present?
      end

      def project
        Client.find_by(id: project_id) if project_id.present?
      end

      def campaign
        Client.find_by(id: campaign_id) if campaign_id.present?
      end

      def sub_campaign
        Client.find_by(id: sub_campaign_id) if sub_campaign_id.present?
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
    end
  end
end
