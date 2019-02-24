module Campaigns
  class AttachToUser < Rectify::Command
    attr_reader :form, :user

    def initialize(form, user)
      @form = form
      @user = user
    end

    def call
      return broadcast :invalid, form if form.invalid?
      form.campaign_ids.each do |client_id|
        user.memberships.create!(role: Membership::MEMBER_ROLE, client_id: client_id)
      end

      broadcast :ok, user
    end
  end
end
