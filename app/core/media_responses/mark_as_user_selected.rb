# frozen_string_literal: true

module MediaResponses
  class MarkAsUserSelected < BaseCommand
    private_attr_reader :media_response

    def initialize(media_response)
      @media_response = media_response
    end

    def call
      media_response.question.media_responses.where(
        users_result_id: media_response.users_result_id
      ).update_all(user_selected: false)
      media_response.update_column(:user_selected, true)
    end
  end
end
