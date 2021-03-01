# frozen_string_literal: true

module CampaignUsers
  class BeginProctoredCampaign < BaseCommand
    private_attr_reader :campaign_user, :campaign
    attr_accessor :jwt_token

    def initialize(campaign_user)
      @campaign_user = campaign_user
      @campaign = campaign_user.campaign
    end

    def call
      jwt_token, session_id = transaction do
        campaign_user.update_attributes(attributes)
        proctoring_session = ProctoringSession.create!({
          campaign_user_id: campaign_user.id,
          started_at: campaign_user.started_at
        })

        [Examus::JWTTokenizer.encode(proctoring_session.reload.payloadify), proctoring_session.session_id]
      end

      if jwt_token
        broadcast :ok, { token: jwt_token, session_id: session_id }
      else
        broadcast :error, message: 'Something went wrong' # something went wrong?
      end
    end

    private

    def attributes
      {
        started_at: Time.now,
        status: :in_progress,
        expiry_date: campaign.fixed_time? ? campaign.fixed_time_duration&.seconds&.from_now : nil
      }
    end
  end
end
