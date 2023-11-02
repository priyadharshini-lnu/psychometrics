# frozen_string_literal: true

module Communications
  module PipedText
    module Branches
      module UserFields
        class Field < ::PipedText::BaseField
          include Rails.application.routes.url_helpers

          def call
            method = possible_fields[path.last]

            broadcast :ok, method ? send(method) : ''
          end

          private

          def user
            context[:user]
          end

          def magic_url
            Utility::Url.generate(
              :users_sign_in_link_url,
              id: user.id,
              subdomain: user.subdomain,
              user: { email: user.email, token: user.encode_passwordless_token, remember_me: false }
            )
          end

          def magic_link
            "<a href='#{magic_url}'>#{params['text'] || 'Click to Login'}</a>"
          end

          def possible_fields
            {
              'MagicLink' => :magic_link,
              'MagicURL' => :magic_url
            }
          end
        end
      end
    end
  end
end
