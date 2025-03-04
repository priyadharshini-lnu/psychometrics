# frozen_string_literal: true

module Hogan
  class CreateNewHoganCredential < BaseCommand
    private_attr_reader :user, :campaign

    def initialize(user, campaign)
      @user = user
      @campaign = campaign
    end

    def call
      transaction do
        ::Hogan::CreateHoganParticipant.call!(user) do
          on(:ok) do
            delete_hogan_user_reports
            delete_hogan_user_assessments
          end
        end
      end

      broadcast(:ok)
    rescue StandardError => e
      Rails.logger.error(e)
      broadcast(:error,  e.message)
    end

    private

    def delete_hogan_user_reports
      user.
        user_reports.
        joins(:report).
        where(report: { provider: :hogan }, campaign_id: campaign.id).
        find_each(&:destroy!)
    end

    def delete_hogan_user_assessments
      user.
        user_assessments.
        joins(:assessment).
        where(assessment: { type: ::Assessment::TYPES[:hogan] }, campaign_id: campaign.id).
        destroy_all
    end
  end
end
