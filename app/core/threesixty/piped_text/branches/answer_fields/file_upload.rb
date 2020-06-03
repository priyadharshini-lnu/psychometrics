# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module AnswerFields
        class FileUpload < BaseField
          DEFAULT_WIDTH = '100%'
          DEFAULT_HEIGHT = '400px'
          VALID_EXTENSIONS = ['.pptx', '.docx', '.pdf', '.doc', '.ppt', '.xls', '.xlsx'].freeze

          def call
            file_path = context.dig(:answers, path.second.to_s, 'answers', 0, 'value')
            if file_path && valid_file_path?(file_path)
              broadcast :ok, "<iframe style='#{styles}' src='#{src(file_path)}'></iframe>"
            else
              broadcast :ok, nil
            end
          end

          private

          def styles
            width = params['w'] || DEFAULT_WIDTH
            height = params['h'] || DEFAULT_HEIGHT
            "width: #{width}; height: #{height}; background: black; border: none;"
          end

          def src(file_path)
            "https://docs.google.com/viewer?url=#{file_path}&embedded=true"
          end

          def valid_file_path?(file_path)
            Pathname(file_path).extname.in?(VALID_EXTENSIONS)
          end
        end
      end
    end
  end
end
