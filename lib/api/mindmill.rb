module Api
  class Mindmill
    COMPANY_ID = 70
    KEY = ENV['MINDMILL_KEY']
    WSDL_URL = 'https://evo-api.mindmill.co.uk/ICAS/ICAS1.asmx?WSDL'.freeze
    AVAILABLE_LANGUAGES = %w(en ar fr).freeze

    attr_accessor :api, :appid, :assessment, :current_membership, :locale, :assign
    attr_accessor :report, :ssourl, :has_in_progress_assign

    def initialize(assign, current_membership, user_locale = 'en')
      @api = Savon.client(wsdl: WSDL_URL, soap_version: 2, log_level: :debug, logger: Rails.logger)
      @assign = assign
      @appid = assign.id.to_s.prepend(assign.mindmill_prefix || '') # '2782' #
      @assessment = assign.assessment
      @current_membership = current_membership
      @locale = user_locale && AVAILABLE_LANGUAGES.include?(user_locale) ? user_locale : 'en'
      @has_in_progress_assign = current_membership.assigns.mindmill.in_progress.where.not(id: assign.id).exists?
    end

    # Return url Single Sign On into MindMill
    # Example: http://evotest.mindmill.co.uk/MyMindMill/SSO/?id=[uniqID]
    # Return false If happens error
    def assign_user
      @ssourl = has_in_progress_assign ? new_assign_user : add_new_user
    rescue Savon::SOAPFault => error
      p error.http.code
      p 'Error-' * 10
      return false
    end

    # Return url Single Sign On into MindMill
    # Example: http://evotest.mindmill.co.uk/MyMindMill/SSO/?id=[uniqID]
    def new_assign_user
      # TODO: Check request - always return Error
      api.call(:reset_test_taken, message: { strCompanyKey: KEY, strUsername: appid })
      api.call(:edit_applicant, message: { strCompanyKey: KEY, strApplicant: str_applicant })
      request_ssourl
    end

    # Add new user to Mindmill system
    # Invoke :add_new_user API
    # Invoke :request_ssourl API If user is already exist
    # Return url Single Sign On into MindMill
    # Example: http://evotest.mindmill.co.uk/MyMindMill/SSO/?id=[uniqID]
    # Return false If happens error
    def add_new_user
      response = api.call(:add_new_user, message: { strCompanyKey: KEY, strApplicant: str_applicant })
      result = response.body[:add_new_user_response][:add_new_user_result]
      return result if result.start_with?('http')
      return request_ssourl if result == 'D'
      p 'add_new_user - ' * 5
      p 'Result doesn\'t contains url or D'
      false
    end

    # Request link to Mindmill Account
    # Return url Single Sign On into MindMill
    # Example: http://evotest.mindmill.co.uk/MyMindMill/SSO/?id=[uniqID]
    # Return false If happens error
    def request_ssourl
      response = api.call(:request_ssourl, message: { strCompanyKey: KEY, strUsername: appid })
      result = response.body[:request_ssourl_response][:request_ssourl_result]
      return result if result.start_with?('http')
      p 'request_ssourl - ' * 5
      p 'Result doesn\'t contains url'
      false
    end

    # Check if Applicat pass assessment
    # Return Boolean
    # TODO: Check request - always return F
    def test_taken?
      @test_taken_response ||= api.call(:check_if_test_taken, message: { strCompanyKey: KEY, strUsername: appid })
      result = @test_taken_response.body[:check_if_test_taken_response][:check_if_test_taken_result]
      result == 'T'
    end

    #
    def load_results
      # return false unless test_taken?
      response = api.call(:send_cognitive_report, message: { strCompanyKey: KEY, strUsername: appid })
      # TODO (atanych): remove hardcoded path
      xml = File.read('lib/imports/external/samples/mind_mill_import.xml')
      # xml = File.write('lib/imports/external/samples/mind_mill_import11.xml', response.xml)
      # Imports::External::BaseExternalImport.build(:mindmill).process!(response.body, assign)
      binding.pry
      Imports::External::BaseExternalImport.build(:mindmill).process!(xml, assign)
      @report ||= response.body[:send_cognitive_report_response][:send_cognitive_report_result]
    end

    protected

    def str_applicant
      %{
        <applicant>
          <appid>#{appid}</appid>
          <firstname>#{current_membership.user.first_name}</firstname>
          <lastname>#{current_membership.user.last_name}</lastname>
          <age></age>
          <gender>N</gender>
          <email>#{current_membership.user.email}</email>
          <mobile></mobile>
          <userpassword>default</userpassword>
          <usertype>User</usertype>
          <reportlang>#{locale}</reportlang>
          <progtorun>#{assessment.mindmill_id}</progtorun>
          <companyid>#{COMPANY_ID}</companyid>
        </applicant>
      }
    end
  end
end
