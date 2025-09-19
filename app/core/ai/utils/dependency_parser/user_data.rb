# frozen_string_literal: true

module AI
  module Utils
    module DependencyParser
      class UserData
        private_attr_reader :user, :enable_masking_pii, :custom_field_names

        def initialize(user, enable_masking_pii: false, custom_fields: [])
          @user = user
          @enable_masking_pii = enable_masking_pii
          @custom_field_names = Array(custom_fields).map(&:to_s)
        end

        def parse
          format_user_data_output
        end

        def masked_data_resolutions
          return {} unless enable_masking_pii

          resolutions = {
            dummy_first_name => user.first_name,
            dummy_last_name => user.last_name,
            dummy_email => user.email,
            dummy_full_name => user.name
          }.compact

          requested_custom_fields.each do |field|
            masked_value = masked_custom_field_value(field[:name])
            actual_value = field[:value]
            resolutions[masked_value] = actual_value if masked_value && actual_value
          end

          resolutions
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

        def display_gender
          enable_masking_pii ? "USRGN#{user.id}" : user.gender
        end

        def requested_custom_fields
          return [] if custom_field_names.empty?

          all_custom_fields = Users::GetCustomProfileFields.call!(user)
          all_custom_fields.select { |field| custom_field_names.include?(field[:name].to_s.downcase) }
        end

        def masked_custom_field_value(field_name)
          return nil unless enable_masking_pii

          "USRCF#{user.id}_#{field_name.upcase.gsub(/\s+/, '_')}"
        end

        def display_custom_field_value(field)
          if enable_masking_pii
            masked_custom_field_value(field[:name])
          else
            field[:value]
          end
        end

        def custom_fields_xml
          return '' if requested_custom_fields.empty?

          requested_custom_fields.map do |field|
            field_name = field[:name].to_s.downcase.gsub(/\s+/, '_')
            field_value = display_custom_field_value(field)
            "<#{field_name}>#{field_value}</#{field_name}>"
          end.join("\n")
        end

        def format_user_data_output
          custom_fields_section = custom_fields_xml

          <<~USER_DATA
            <subject id="#{user.id}">
            <name>#{display_full_name}</name>
            <first_name>#{display_first_name}</first_name>
            <last_name>#{display_last_name}</last_name>
            <gender>#{display_gender}</gender>
            #{custom_fields_section}
            </subject>
          USER_DATA
        end
      end
    end
  end
end
