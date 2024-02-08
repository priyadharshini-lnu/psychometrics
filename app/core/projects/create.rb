# frozen_string_literal: true

module Projects
  class Create < BaseCommand
    private_attr_accessor :attrs, :current_user

    def initialize(attrs, current_user)
      @attrs = attrs
      @current_user = current_user
    end

    def call
      project = Client.create!(attrs.
        merge(
          creator: current_user,
          modifier: current_user,
          operator: current_user,
          migrated: true,
          applicable_level: :campaign
        ).except(:enforce_strong_password, :tfa_enabled))
      project.security_setting.update(enforce_strong_password: attrs[:enforce_strong_password],
                                      tfa_enabled: attrs[:tfa_enabled])
      broadcast :ok, project
    end
  end
end
