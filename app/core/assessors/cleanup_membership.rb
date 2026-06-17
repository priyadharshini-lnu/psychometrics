# frozen_string_literal: true

module Assessors
  class CleanupMembership
    def self.call(user, client)
      new(user, client).call
    end

    def initialize(user, client)
      @user = user
      @client = client
    end

    def call
      return if has_other_assessor_assignments?

      membership&.destroy!
    end

    private

    attr_reader :user, :client

    def has_other_assessor_assignments?
      other_assessors_in_client? || other_workshop_assessors_in_client?
    end

    def other_assessors_in_client?
      Assessor.joins(:campaign).exists?(user_id: user.id,
                                        campaigns: { project_id: client.project_ids })
    end

    def other_workshop_assessors_in_client?
      WorkshopAssessor.exists?(user_id: user.id,
                               workshop: Workshop.joins(:campaign).where(campaigns: { project_id: client.project_ids }))
    end

    def membership
      @membership ||= Membership.find_by(
        user_id: user.id,
        client: client,
        role: Membership::CLIENT_ASSESSOR_ROLE,
        campaign_id: nil
      )
    end
  end
end
