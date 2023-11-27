# frozen_string_literal: true

module EndUser
  class HoganCredentialSerializer < Panko::Serializer
    include Rails.application.routes.url_helpers
    attributes :url, :user_id, :password, :unique_id, :first_name, :last_name, :language_id,
               :direct_assessment_id, :display_informed_consent, :return_url

    def url
      Rails.application.secrets.hogan[:login_url]
    end

    def user_id
      hogan_credential&.participant_id
    end

    def password
      hogan_credential&.password
    end

    def unique_id
      current_user.email
    end

    delegate :first_name, to: :current_user

    delegate :last_name, to: :current_user

    def language_id
      'en'
    end

    def direct_assessment_id
      object.assessment.external_settings[:assessment_id]
    end

    def display_informed_consent
      'YES'
    end

    def return_url
      redirect_hogan_user_assessment_url(object, email: 'CandID',
                            participant_id: 'HASUserID', status: 'AssessmentStatus',
                            assessment_id: 'AssessmentID', domain: Settings.domain,
                            host: Settings.domain, subdomain: object.campaign.project.subdomain,
                            port: Settings.port, protocol: Settings.protocol)
    end

    private

    def current_user
      @current_user ||= context[:current_user]
    end

    def hogan_credential
      @hogan_credential ||= context[:hogan_credential]
    end
  end
end
