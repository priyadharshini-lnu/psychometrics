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
            file_path = context.dig(:answers, path.second.to_s, 'answers', 0, 'value')

            if context[:assign]
              media_response = MediaResponse.find_by(question_id: path.second, assign_id: context[:assign].id)
            end

            if context[:users_result]
              media_response = MediaResponse.find_by(
                question_id: path.second,
                users_result_id: context[:users_result].id
              )
            end

            if media_response
              file_path = media_response.asset.url
              if get_extname(file_path).in?(PDF_EXTENSIONS)
                broadcast :ok, "<object style=\"#{styles}\" data=\"#{file_path}\" type=\"application/pdf\"></object>"
              else
                broadcast :ok, "<iframe style=\"#{styles}\" src=\"#{src(file_path)}\"></iframe>"
              end
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
