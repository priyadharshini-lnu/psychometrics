# frozen_string_literal: true

module Hogan
  class CreateHoganParticipant < BaseCommand
    private_attr_reader :user

    def initialize(user)
      @user = user
    end

    def call
      create_group
      add_participant_to_group

      broadcast(:ok)
    end

    private

    def create_group
      Services::Hogan::Api::Json::GroupDetails.call(group: hogan_group_name, provider: hogan_provider) do
        on(:error) do
          Services::Hogan::Api::Json::CreateGroup.call!(group: hogan_group_name, provider: hogan_provider)
        end
      end
    end

    def add_participant_to_group
      lock_key = "locks/hogan_credential/#{user.id}"
      lock_manager.lock!(lock_key, 2.minutes.in_milliseconds) do
        password = Devise.friendly_token.first(10)
        participant_id = Services::Hogan::Api::Json::AddParticipantToGroup.call!(
          group: hogan_group_name, password: password, provider: hogan_provider
        )

        @credentials = HoganCredential.create!(
          password: password,
          participant_id: participant_id,
          user_id: user.id,
          provider: hogan_provider,
          norm: HoganCredential::DEFAULT_NORM,
          hogan_group_name: hogan_group_name
        )
      end
    end

    def lock_manager
      @lock_manager ||= Redlock::Client.new([$redis]) # rubocop:disable Style/GlobalVars
    end

    def hogan_group_name
      @hogan_group_name ||= project.hogan_group_name
    end

    def project
      @project ||= user.project
    end

    def credentials
      @credentials ||= user.hogan_credential
    end

    def hogan_provider
      credentials&.provider || project.hogan_provider
    end
  end
end
