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
                Rails.application.routes.url_helpers.url_for(
                  [:accept, context[:recipient].role_scope, :invitation, options]
                )
              end
            broadcast :ok, url
          end

          private

          def create_raw_invitation_token
            Users::FindOrCreateInvitationToken.call!(context[:recipient])
          end
        end
      end
    end
  end
end
