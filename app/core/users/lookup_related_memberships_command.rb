module Users
  class LookupRelatedMembershipsCommand < Rectify::Command
    attr_reader :user, :project, :client

    def initialize(user, project, client)
      @user = user
      @project = project
      @client = client
    end

    def call
      result = (memberships.select { |m| m.project_admin? && m.client_id == project&.id } +
      memberships.select { |m| m.client_admin? && m.client_id == client&.id }).uniq

      broadcast :ok, result
    end

    def memberships
      @memberships ||= user.memberships.includes(:grants)
    end
  end
end
