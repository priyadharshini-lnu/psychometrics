# frozen_string_literal: true

module Mindmill
  class GetResults < BaseApi
    private_attr_reader :user_result, :mindmill_credential, :locale

    def initialize(user_result)
      @user_result = user_result
      @mindmill_credential = user_result.mindmill_credential
    end

    def call
      broadcast :ok, results: get_results, report: get_report
    end

    private

    def get_results
      response = api.call(:send_results2, message: {
        strCompanyKey: Mindmill::Constants::KEY,
        strUserName: mindmill_credential.user_name,
        strOptions: 'ALL',
        strReportLang: 'EN'
      })
      response.body[:send_results2_response][:send_results2_result]
    rescue Savon::Error => e
      Rails.logger.error(e.inspect)
      nil
    end

    def get_report
      response = api.call(
        :send_cognitive_report,
        message: { strCompanyKey: Mindmill::Constants::KEY, strUsername: mindmill_credential.user_name }
      )
      response.body[:send_cognitive_report_response][:send_cognitive_report_result]
    rescue Savon::Error => e
      Rails.logger.error(e.inspect)
      nil
    end
  end
end
