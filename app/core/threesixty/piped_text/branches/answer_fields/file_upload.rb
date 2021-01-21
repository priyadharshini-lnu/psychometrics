# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module AnswerFields
        class FileUpload < BaseField
          DEFAULT_WIDTH = '100%'
          DEFAULT_HEIGHT = '400px'
          MS_EXTENSIONS = ['.pptx', '.docx', '.doc', '.ppt', '.xls', '.xlsx'].freeze
          PDF_EXTENSIONS = ['.pdf'].freeze
          VALID_EXTENSIONS = MS_EXTENSIONS + PDF_EXTENSIONS

          def call
            media_response = context[:result].media_responses.find_by(question_id: path.second)
            file_path = media_response&.asset&.url

            return broadcast :ok, nil unless file_path

            if get_extname(file_path).in?(PDF_EXTENSIONS)
              broadcast :ok, "<object style=\"#{styles}\" data=\"#{file_path}\" type=\"application/pdf\"></object>"
            else
              broadcast :ok, "<iframe style=\"#{styles}\" src=\"#{src(file_path)}\"></iframe>"
            end
          end

          private

          def styles
            width = params['w'] || DEFAULT_WIDTH
            height = params['h'] || DEFAULT_HEIGHT
            "width: #{width}; height: #{height}; background: black; border: none;"
          end

          def src(file_path)
            "https://view.officeapps.live.com/op/embed.aspx?src=#{file_path}"
          end

          def valid_file_path?(file_path)
            get_extname(file_path).in?(VALID_EXTENSIONS)
          end

          def get_extname(file_path)
            Pathname(file_path).extname
          end
        end
      end
    end
  end
end
