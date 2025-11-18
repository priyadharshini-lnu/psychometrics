# frozen_string_literal: true

module Administration
  module Projects
    module Integrations
      class YoodliIntegrationSerializer < Panko::Serializer
        include Rails.application.routes.url_helpers

        attributes :platform_id, :client_id, :deployment_id, :platform_public_keyset_url,
                   :platform_access_token_url, :platform_authentication_request_url, :platform_host_name,
                   :launch_url, :login_url, :keyset_url

        def platform_id
          Utility::Url.generate(:root_url, subdomain: object.project.subdomain).chomp('/')
        end

        def client_id
          object.project.id
        end

        def deployment_id
          object.id
        end

        def platform_public_keyset_url
          Utility::Url.generate(:lti_jwks_url, subdomain: object.project.subdomain)
        end

        def platform_access_token_url
          Utility::Url.generate(:lti_oauth2_token_url, subdomain: object.project.subdomain)
        end

        def platform_authentication_request_url
          Utility::Url.generate(:lti_auth_url, subdomain: object.project.subdomain)
        end

        def platform_host_name
          Utility::Url.generate(:root_url, subdomain: object.project.subdomain).chomp('/').sub(%r{^https?://}, '')
        end

        def launch_url
          object.config['launch_url']
        end

        def login_url
          object.config['login_url']
        end

        def keyset_url
          object.config['keyset_url']
        end
      end
    end
  end
end
