# frozen_string_literal: true

class HoganCredentialSerializer < Panko::Serializer
  include Rails.application.routes.url_helpers
  attributes :url, :user_id, :password, :unique_id, :first_name, :last_name, :language_id,
             :direct_assessment_id, :display_informed_consent, :return_url

  delegate :first_name, :last_name, to: :maskable_identity
  delegate :user, to: :object

  def url
    Settings.secrets.hogan[:login_url]
  end

  def user_id
    hogan_credential&.participant_id
  end

  def password
    hogan_credential&.password
  end

  def unique_id
    maskable_identity.email
  end

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
                          port: Settings.port, protocol: Settings.protocol,
                          jwt: jwt_token)
  end

  private

  def maskable_identity
    object.subject.maskable_identity(mask: object.project.mask_identity_for_hogan?)
  end

  def hogan_credential
    context[:hogan_credential]
  end

  def jwt_token
    JWT.encode({ 'sub' => user.id, 'exp' => 2.hours.from_now.to_i }, Settings.secrets.encrypted_key.to_s, 'HS256')
  end
end
