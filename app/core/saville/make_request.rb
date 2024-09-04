# frozen_string_literal: true

module Saville
  class MakeRequest < BaseCommand
    private_attr_reader :action, :xml_file_name, :attributes

    def initialize(action, xml_file_name, attributes)
      @action = action
      @xml_file_name = xml_file_name
      @attributes = attributes
    end

    def call
      response = client.call(action, message: { xml: xml })
      xml_response = response.body.dig(:"#{action}_response", :"#{action}_result")
      response_hash = Hash.from_xml(xml_response)

      broadcast :ok, response_hash
    end

    private

    def xml
      ApplicationController.render(inline: File.read(file_path), layout: false, locals: all_attributes).squish
    end

    def file_path
      File.join(File.dirname(__FILE__), 'xml', xml_file_name)
    end

    def all_attributes
      {
        client_code: Settings.secrets.saville.dig(:credential, :client_code),
        provider: 'The Talent Enterprise'
      }.merge(attributes)
    end

    def client
      Savon.client(
        wsdl: Settings.secrets.saville[:wsdl_url],
        soap_version: 1,
        log_level: :debug,
        logger: Rails.logger,
        soap_header: soap_header
      )
    end

    def soap_header
      %(
        <AuthHeader xmlns="http://ws.sc-oasys.com/">
          <Username>#{CGI.escape_html(Settings.secrets.saville.dig(:credential, :user_name))}</Username>
          <Password>#{CGI.escape_html(Settings.secrets.saville.dig(:credential, :password))}</Password>
        </AuthHeader>
      )
    end
  end
end
