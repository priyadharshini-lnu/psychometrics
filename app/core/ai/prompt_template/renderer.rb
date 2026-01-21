# frozen_string_literal: true

module AI
  module PromptTemplate
    class Renderer < BaseCommand
      private_attr_reader :prompt, :user, :campaign

      def initialize(prompt, user: nil, campaign: nil)
        @prompt = prompt
        @user = user
        @campaign = campaign
      end

      def call
        template = Liquid::Template.parse(prompt)
        template.registers[:filters] = [AI::PromptTemplate::Filters]

        render_context = {
          'user' => AI::PromptTemplate::UserDrop.new(user)
        }

        if campaign
          render_context['campaign'] = AI::PromptTemplate::CampaignDrop.new(campaign)
          render_context['campaign_factors'] = AI::PromptTemplate::CampaignFactorsDrop.new(campaign, user)

          campaign_user = campaign.campaign_users.find_by(user_id: user.id)
          render_context['campaign_user'] = AI::PromptTemplate::CampaignUserDrop.new(campaign_user) if campaign_user
        end

        result = template.render(render_context, filters: [AI::PromptTemplate::Filters])

        if template.errors.any?
          Rails.logger.warn "Liquid template warnings: #{template.errors.join(', ')}"
          # Still return success if we got a result, as these might be non-fatal warnings
        end
        broadcast :ok, result
      rescue Liquid::SyntaxError => e
        broadcast :error, e.message
      end
    end
  end
end
