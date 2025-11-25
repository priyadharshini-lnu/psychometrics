# frozen_string_literal: true

module Yoodli
  class DeterminePrincipal < BaseCommand
    private_attr_reader :user_assessment

    def initialize(user_assessment:)
      @user_assessment = user_assessment
    end

    def call
      yoodli_assessment = user_assessment.yoodli_user_assessment

      principal = if mask_identity_for_yoodli?
                    create_masked_principal_object(yoodli_assessment.email)
                  else
                    create_principal_object(yoodli_assessment.email, subject.name)
                  end

      broadcast(:ok, principal)
    end

    private

    def mask_identity_for_yoodli?
      user_assessment.project.mask_identity_for_yoodli?
    end

    def create_principal_object(email, name)
      OpenStruct.new( # rubocop:disable Style/OpenStructUse
        email: email,
        name: name,
        first_name: subject.first_name,
        last_name: subject.last_name,
        id: subject.id,
        groups: [user_assessment.campaign.name]
      )
    end

    def create_masked_principal_object(email)
      masked_identity = subject.maskable_identity(mask: true)

      OpenStruct.new( # rubocop:disable Style/OpenStructUse
        email: email,
        name: masked_identity.name,
        first_name: masked_identity.first_name,
        last_name: masked_identity.last_name,
        id: subject.id,
        groups: [user_assessment.campaign.name]
      )
    end

    def subject
      user_assessment.subject
    end
  end
end
