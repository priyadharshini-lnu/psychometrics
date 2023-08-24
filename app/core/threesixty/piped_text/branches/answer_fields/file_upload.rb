# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module AnswerFields
        class FileUpload < ::PipedText::BaseField
          DEFAULT_WIDTH = '100%'
          DEFAULT_HEIGHT = '400px'
          MS_EXTENSIONS = ['.pptx', '.docx', '.doc', '.ppt', '.xls', '.xlsx'].freeze
          IMAGE_EXTENSIONS = ['.svg', '.png', '.gif', '.jpg', '.jpeg'].freeze
          PDF_EXTENSIONS = ['.pdf'].freeze
          VALID_EXTENSIONS = MS_EXTENSIONS + PDF_EXTENSIONS + IMAGE_EXTENSIONS

          def call
            media_response = context[:result].media_responses.find_by(question_id: path.second)
            file_url = media_response&.asset&.url

            return broadcast :ok, nil unless file_url && valid_file_url?(file_url)

            file_ext = get_extname(file_url)
            encoded_file_url = URI.encode_www_form_component(file_url)
            if file_ext.in?(PDF_EXTENSIONS)
              broadcast :ok, "<object style=\"#{styles}\" data=\"#{file_url}\" type=\"application/pdf\"></object>"
            elsif file_ext.in?(IMAGE_EXTENSIONS)
              broadcast :ok, "<img src=\"#{file_url}\" class=\"user-upload-image\" />"
            else
              broadcast :ok, "<iframe style=\"#{styles}\" src=\"#{src(encoded_file_url)}\"></iframe>"
            end
          end

          private

          def styles
            width = params['w'] || DEFAULT_WIDTH
            height = params['h'] || DEFAULT_HEIGHT
            "width: #{width}; height: #{height}; background: black; border: none;"
          end

          def src(file_url)
            "https://view.officeapps.live.com/op/embed.aspx?src=#{file_url}"
          end

          def valid_file_url?(file_url)
            get_extname(file_url).in?(VALID_EXTENSIONS)
          end

          def get_extname(file_url)
            # Remove query string from file_url
            Pathname(file_url.split('?')[0]).extname.downcase
          end
        end
      end
    end
  end
end
