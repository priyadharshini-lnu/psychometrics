# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module DashboardFields
        class Url < BaseField
          def call
            url =
              if context[:recipient].invitation_accepted?
                options = {
                  domain: Settings.domain,
                  host: Settings.domain,
                  protocol: Settings.protocol,
                  port: Settings.port,
                  subdomain: context[:recipient].project.subdomain
                }
                Rails.application.routes.url_helpers.url_for([:root, options])
              else
                token = create_raw_invitation_token
                options = {
                  id: context[:recipient].id,
                  invitation_token: token,
                  domain: Settings.domain,
                  host: Settings.domain,
                  subdomain: context[:recipient].project.subdomain,
                  protocol: Settings.protocol,
                  port: Settings.port
                }
                Rails.application.routes.url_helpers.url_for([:accept, context[:recipient].role_scope, :invitation, options])
              end
            broadcast :ok, url
          end

          private
          def create_raw_invitation_token
            if context[:recipient].encrypted_invitation_raw.nil?
              context[:recipient].skip_invitation = true
              context[:recipient].send(:generate_invitation_token!)
              context[:recipient].update_column(:invitation_sent_at, ::DateTime.current)
            end
            Rails.application.message_verifier(Rails.application.secrets.secret_token_for_generate).verify(context[:recipient].encrypted_invitation_raw)
          end
        end
      end
    end
  end
end
