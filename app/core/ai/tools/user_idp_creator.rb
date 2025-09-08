# frozen_string_literal: true

# rubocop:disable Layout/LineLength
module AI
  module Tools
    class UserIdpCreator < AI::Tools::Base
      description 'Creates a new Individual Development Plan (IDP) for the user with skills and development actions.'

      # TODO: Create a proper validation structure when building the plan
      param :skills,
            desc: 'Array of skills to include in the development plan. e.g. ["Leadership", "Communication"]'
      param :development_actions,
            desc: 'Array of development actions associated with the skills. e.g. [["Attend leadership workshop", "Read communication books"], ["Join public speaking club"]]'

      private_attr_reader :user_idp_plan

      def initialize(user_idp_plan)
        @user_idp_plan = user_idp_plan
      end

      def execute(skills:, development_actions:)
        # TODO: validate and add data to plan

        # Update the plan status to draft when tool execution finishes

        Rails.logger.debug { "Skills: #{skills}, Development Actions: #{development_actions}" }
        @user_idp_plan.update!(status: :draft)

        {
          message: 'Development plan created successfully',
          skills_count: skills&.length || 0,
          actions_count: development_actions&.length || 0,
          status: 'draft'
        }
      rescue StandardError => e
        { error: e.message }
      end
    end
  end
end
# rubocop:enable Layout/LineLength
