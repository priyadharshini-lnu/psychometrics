# frozen_string_literal: true

module Devtools
  module CLI
    module Commands
      class SendEmail < Base
        private_attr_reader :to_emails, :subject, :text_body, :html_body, :attachment_path, :attachment_name,
                            :from_email, :from_name, :mailjet_auth_token

        desc 'Send an email with attachment using Mailjet API'
        option :to_emails,
               desc: 'Comma-separated list of recipient email addresses',
               required: true
        option :subject,
               desc: 'Email subject',
               required: true
        option :text_body,
               desc: 'Email body in plain text',
               default: ''
        option :html_body,
               desc: 'Email body in HTML format',
               default: ''
        option :attachment_path,
               desc: 'Path to_emails file to_emails be attached',
               default: nil
        option :attachment_name,
               desc: 'Name to_emails use for the attachment',
               default: nil
        option :from_email,
               desc: 'Sender email address'
        option :from_name,
               desc: 'Sender name'

        def call(to_emails:, subject:, text_body: '', html_body: '', attachment_path: nil, **) # rubocop:disable Metrics/ParameterLists
          @to_emails = to_emails
          @subject = subject
          @text_body = text_body
          @html_body = html_body
          @attachment_path = attachment_path
          @attachment_name = attachment_name
          @from_email = from_email || ENV.fetch('MAILJET_FROM_EMAIL', nil)
          @from_name = from_name || ENV.fetch('MAILJET_FROM_NAME', nil)
          @mailjet_auth_token = ENV.fetch('MAILJET_AUTH_TOKEN', nil)

          return false unless valid_configuration?

          send_email
        rescue StandardError => e
          cli_log "Error sending email: #{e.message}"
          false
        end

        private

        def valid_configuration?
          return false unless validate_auth_token
          return false unless validate_sender_info
          return false unless validate_recipients
          return false unless validate_attachment

          true
        end

        def validate_auth_token
          if mailjet_auth_token.blank?
            cli_log 'Error: MAILJET_AUTH_TOKEN environment variable not set'
            return false
          end
          true
        end

        def validate_sender_info
          if from_email.blank?
            cli_log 'Error: MAILJET_FROM_EMAIL environment variable not set'
            return false
          end

          if from_name.blank?
            cli_log 'Error: MAILJET_FROM_EMAIL environment variable not set'
            return false
          end

          true
        end

        def validate_recipients
          if to_emails.blank?
            cli_log 'Error: No recipients specified'
            return false
          end

          true
        end

        def validate_attachment
          if attachment_path && !File.exist?(attachment_path)
            cli_log "Error: Attachment file not found: #{attachment_path}"
            return false
          end

          true
        end

        def send_email
          cli_log "Sending email notification to #{to_emails}"

          payload = build_payload
          response = send_request(payload)

          if response.success?
            cli_log 'Email sent successfully.'
            true
          else
            cli_log "Failed to_emails send email: #{response.status} - #{response.body}"
            false
          end
        end

        def send_request(payload)
          connection = Faraday.new(url: 'https://api.mailjet.com') do |conn|
            conn.headers['Content-Type'] = 'application/json'
            conn.headers['Authorization'] = "Basic #{mailjet_auth_token}"
          end

          connection.post('/v3.1/send') do |req|
            req.body = payload.to_json
          end
        end

        def build_payload
          payload = {
            'Messages' => [
              {
                'From' => {
                  'Email' => from_email,
                  'Name' => from_name
                },
                'To' => build_recipients_list,
                'Subject' => subject,
                'TextPart' => text_body
              }
            ]
          }

          payload['Messages'][0]['HTMLPart'] = html_body unless html_body.empty?

          add_attachment_to_payload(payload) if attachment_path && File.exist?(attachment_path)

          payload
        end

        def build_recipients_list
          to_emails.split(',').map do |email|
            { 'Email' => email.strip }
          end
        end

        def add_attachment_to_payload(payload)
          attachment_content = File.read(attachment_path)
          attachment_base64 = Base64.strict_encode64(attachment_content)
          file_name = attachment_name || File.basename(attachment_path)
          content_type = get_content_type(attachment_path)

          payload['Messages'][0]['Attachments'] = [
            {
              'ContentType' => content_type,
              'Filename' => file_name,
              'Base64Content' => attachment_base64
            }
          ]
        end

        # Get content type based on file extension
        def get_content_type(file_path)
          case File.extname(file_path).downcase
            when '.csv'
              'text/csv'
            when '.pdf'
              'application/pdf'
            when '.txt'
              'text/plain'
            when '.jpg', '.jpeg'
              'image/jpeg'
            when '.png'
              'image/png'
            when '.html'
              'text/html'
            when '.json'
              'application/json'
            when '.xlsx', '.xls'
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            when '.docx', '.doc'
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            else
              'application/octet-stream'
          end
        end
      end
    end
  end
end
