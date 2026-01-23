# frozen_string_literal: true

module Devtools
  module CLI
    module Commands
      class MockMhsWebhook < Base
        desc 'Mock MHS DataGatherer.Complete webhook by posting mocked payload for a user assessment'

        argument :user_assessment_id, required: true, desc: 'The ID of the UserAssessment to process'

        def call(user_assessment_id:, **)
          user_assessment = UserAssessment.find_by(id: user_assessment_id)
          cli_error "UserAssessment #{user_assessment_id} not found." unless user_assessment

          mhs_user_assessment = user_assessment.mhs_user_assessment
          cli_error "No MhsUserAssessment for #{user_assessment_id}." unless mhs_user_assessment

          cli_log "UserAssessment: #{user_assessment.id} (#{user_assessment.status})"
          cli_log "Session: #{mhs_user_assessment.session_id}"
          cli_log "Data Gatherer: #{mhs_user_assessment.data_gatherer_id}"

          payload = build_webhook_payload(mhs_user_assessment)
          post_webhook(payload)
        end

        private

        def build_webhook_payload(mhs_user_assessment)
          session_id = mhs_user_assessment.session_id || SecureRandom.uuid
          data_gatherer_id = mhs_user_assessment.data_gatherer_id || SecureRandom.uuid
          data_gathering_id = mhs_user_assessment.data_gathering_id || SecureRandom.uuid
          tenant_id = '8077fd97-2850-4429-8e3f-b49cf04e7576'
          measure_id = '9039cce2-6567-4bc5-8655-8792ba9ab936'

          {
            'data' => {
              'details' => [
                {
                  'code' => 200,
                  'description' => "Resource #{data_gathering_id} found successfully.",
                  'locationReference' => '018',
                  'reference' => 'LA0132'
                },
                {
                  'code' => 200,
                  'description' => 'Data Gathering completed successfully',
                  'locationReference' => '021',
                  'reference' => 'LA0132'
                },
                {
                  'code' => 200,
                  'description' => 'Data Gathering run complete.',
                  'locationReference' => '041',
                  'reference' => 'LA0131'
                }
              ],
              'jobRunStartTime' => Time.current.iso8601(7)
            },
            'id' => SecureRandom.uuid,
            'source' => "https://services.mhs.com/JANUS/2022-10/sessions/#{session_id}/dataGatherers/#{data_gatherer_id}/instances/#{data_gathering_id}/save?measureID=#{measure_id}&tenantID=#{tenant_id}",
            'specversion' => '1.0',
            'subject' =>
              "/db7d95b7-705b-45aa-9b7b-a70ba3b1c954 /#{session_id}/#{data_gatherer_id}/#{data_gathering_id}",
            'time' => Time.current.iso8601(7),
            'type' => 'MHS.Janus.DataGatherer.Complete'
          }
        end

        def post_webhook(payload)
          url = Utility::Url.generate(:webhooks_mhs_webhook_url)
          cli_log "Posting to: #{url}"

          response = Faraday.post(url, payload.to_json, {
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Authorization' => Settings.secrets.mhs.webhook_api_key
          })

          cli_log "Response: #{response.status}"

          if response.success?
            cli_log 'Webhook sent.', :success
          else
            cli_log 'Webhook returned non-200 status.', :warn
          end
        rescue Faraday::ConnectionFailed
          cli_error 'Connection refused. Server running?'
        rescue StandardError => e
          cli_error "Failed: #{e.message}"
        end
      end
    end
  end
end
