# frozen_string_literal: true

module Mindmill
  class GetSsoUrl < BaseApi
    private_attr_reader :user_result, :user, :mindmill_credential, :assessment, :locale

    def initialize(user_result, user_locale = 'en')
      @user_result = user_result
      @user = user_result.user
      @mindmill_credential = user_result.mindmill_credential
      @assessment = user_result.assessment
      @locale = Mindmill::Constants::AVAILABLE_LANGUAGES.include?(user_locale) ? user_locale : 'en'
    end

    # Return url Single Sign On into MindMill
    # Example: http://evotest.mindmill.co.uk/MyMindMill/SSO/?id=[uniqID]
    # Return false If happens error
    def call
      sso_url = add_new_user

      return broadcast :ok, sso_url if sso_url

      broadcast :error
    rescue Savon::SOAPFault => e
      Rails.logger.error e.http.code
      Rails.logger.error 'Error-' * 10
      broadcast :error, e
    end

    private

    # Add new user to Mindmill system
    # Invoke :add_new_user API
    # Invoke :request_ssourl API If user is already exist
    # Return url Single Sign On into MindMill
    # Example: http://evotest.mindmill.co.uk/MyMindMill/SSO/?id=[uniqID]
    # Return false If happens error
    def add_new_user
      response = api.call(
        :add_new_user,
        message: { strCompanyKey: Mindmill::Constants::KEY, strApplicant: str_applicant }
      )
      result = response.body[:add_new_user_response][:add_new_user_result]
      return result if result.start_with?('http')
      return request_ssourl if result == 'D'

      Rails.logger.error 'add_new_user - ' * 5
      Rails.logger.error 'Result doesn\'t contains url or D'
      false
    end

    # Request link to Mindmill Account
    # Return url Single Sign On into MindMill
    # Example: http://evotest.mindmill.co.uk/MyMindMill/SSO/?id=[uniqID]
    # Return false If happens error
    def request_ssourl
      response = api.call(
        :request_ssourl,
        message: { strCompanyKey: Mindmill::Constants::KEY, strUsername: mindmill_credential.user_name }
      )
      result = response.body[:request_ssourl_response][:request_ssourl_result]
      return result if result.start_with?('http')

      Rails.logger.error 'request_ssourl - ' * 5
      Rails.logger.error 'Result doesn\'t contains url'
      false
    end

    def str_applicant
      %(
        <applicant>
          <appid>#{mindmill_credential.user_name}</appid>
          <firstname>#{user.first_name}</firstname>
          <lastname>#{user.last_name}</lastname>
          <age></age>
          <gender>N</gender>
          <email>#{user.email}</email>
          <mobile></mobile>
          <userpassword>#{mindmill_credential.password}</userpassword>
          <usertype>User</usertype>
          <reportlang>#{locale}</reportlang>
          <progtorun>#{assessment.mindmill_id}</progtorun>
          <companyid>#{Mindmill::Constants::COMPANY_ID}</companyid>
        </applicant>
      )
    end
  end
end
