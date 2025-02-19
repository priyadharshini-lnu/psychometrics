# frozen_string_literal: true

module Saville
  class AssessmentOrderRequest < BaseCommand
    include Rails.application.routes.url_helpers

    private_attr_reader :user_assessment, :saville_user_assessment, :subject

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @saville_user_assessment = user_assessment.saville_user_assessment
      @subject = user_assessment.subject
    end

    def call
      response = Saville::MakeRequest.call!(
        :process_assessment_order_request,
        'assessment_order_request.xml.erb',
        attributes
      )['AssessmentOrderAcknowledgement']
      raise response.dig('AssessmentStatus', 'Details') if response.dig('AssessmentStatus', 'Status') == 'Error'

      assessment_url = response.dig('AccessPoint', 'InternetWebAddress')
      request_id = response.dig('ReceiptId', 'IdValue')
      saville_user_assessment.update(url: assessment_url, request_id: request_id)

      broadcast :ok, response
    end

    def attributes
      maskable_identity = subject.maskable_identity(
        mask: user_assessment.project.mask_identity_for_saville?
      )
      {
        assessment_guid: user_assessment.assessment.external_settings[:assessment_id],
        report_guids: user_assessment.user_reports(:saville).includes(:report).map(&:external_report_id),
        norm_id: user_assessment.saville_norm_id,
        data_seprator: saville_user_assessment.data_seprator,
        return_url: campaign_url,
        webhook_url: webhook_url,
        candidate_id: saville_user_assessment.candidate_id,
        subject_email: maskable_identity.email,
        subject_first_name: maskable_identity.first_name,
        subject_last_name: maskable_identity.last_name,
        subject_full_name: maskable_identity.full_name
      }
    end

    def campaign_url
      redirect_saville_user_assessment_url(user_assessment.id, {
        host: Settings.domain,
        subdomain: user_assessment.project.subdomain,
        protocol: Settings.protocol,
        port: Settings.port,
        jwt: jwt_token
      })
    end

    def webhook_url
      webhooks_saville_url(
        host: Settings.domain,
        subdomain: Settings.subdomain,
        protocol: Settings.protocol,
        port: Settings.port
      )
    end

    def jwt_token
      JWT.encode({ 'sub' => subject.id, 'exp' => session_inactivity_timeout.from_now.to_i },
                 Settings.secrets.encrypted_key.to_s, 'HS256')
    end

    delegate :session_inactivity_timeout, to: :subject
  end
end
