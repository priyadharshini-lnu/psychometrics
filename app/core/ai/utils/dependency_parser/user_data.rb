# frozen_string_literal: true

module AI
  module Utils
    module DependencyParser
      class UserData
        private_attr_reader :user, :enable_masking_pii

        def initialize(user, enable_masking_pii: false)
          @user = user
          @enable_masking_pii = enable_masking_pii
        end

        def parse
          format_user_data_output
        end

        def masked_data_resolutions
          return {} unless enable_masking_pii

          {
            dummy_first_name => user.first_name,
            dummy_last_name => user.last_name,
            dummy_email => user.email,
            dummy_full_name => user.name
          }.compact
        end

        private

        def dummy_first_name
          "USRFN#{user.id}"
        end

        def dummy_last_name
          "USRLN#{user.id}"
        end

        def dummy_email
          "USR#{user.id}@masked.local"
        end

        def dummy_full_name
          "#{dummy_first_name} #{dummy_last_name}"
        end

        def display_first_name
          enable_masking_pii ? dummy_first_name : user.first_name
        end

        def display_last_name
          enable_masking_pii ? dummy_last_name : user.last_name
        end

        def display_email
          enable_masking_pii ? dummy_email : user.email
        end

        def display_full_name
          enable_masking_pii ? dummy_full_name : user.name
        end

        def format_user_data_output
          <<~USER_DATA
            <subject id="#{user.id}">
            <name>#{display_full_name}</name>
            <first_name>#{display_first_name}</first_name>
            <last_name>#{display_last_name}</last_name>
            </subject>
          USER_DATA
        end
      end
    end
  end
end
