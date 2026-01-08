# frozen_string_literal: true

module AI
  module Tools
    module Idp
      class AvailableSkillsAndDevelopmentActions < AI::Tools::Base
        description 'AI-powered semantic search for skills to add to user development plans. ' \
                    'Returns ranked skills with curated development actions.'

        param :query_text,
              desc: 'Keywords and skills for semantic search. Use specific skill names, technologies, ' \
                    'and role-related terms. Examples: "Python microservices leadership mentoring", ' \
                    '"data visualization SQL stakeholder management", "agile scrum team coordination"'

        param :limit,
              desc: 'Max skills to return (default: 5, max: 5)'

        param :development_action_tags,
              desc: 'Optional comma-separated tags to prioritize development actions. ' \
                    'Development actions matching these tags appear first, followed by non-matching ones. ' \
                    'Should only be used when instructed. Example: "low, GUIDE, mentorship"'

        private_attr_reader :idp_template, :user_idp_plan

        def initialize(user_idp_plan)
          @user_idp_plan = user_idp_plan
          @idp_template = user_idp_plan.idp_template
        end

        def execute(query_text:, limit: 5, development_action_tags: nil)
          result_limit = [limit.to_i, 5].min
          parsed_tags = parse_development_action_tags(development_action_tags)
          query_by_similarity_service = Skills::EmbeddingQuery.new(
            skills,
            query_text:,
            limit: result_limit
          )

          query_by_similarity_service.
            on(:ok) do |query_result|
              return {
                skills: format_skills_with_development_actions(query_result, parsed_tags),
                meta: meta_info(query_result)
              }
            end.
            on(:error) do |error_message|
              return { error: error_message }
            end.
            call
        rescue StandardError => e
          Rails.logger.error("Error in #{self.class.name}: #{e.message}")
          { error: 'An unexpected error occurred while processing the request. Contact administration' }
        end

        private

        def format_skills_with_development_actions(query_result, tags = [])
          query_result.map do |skill|
            {
              id: skill.id,
              name: skill.name,
              description: skill.description,
              skill_type: skill.skill_type,
              development_actions: format_development_actions(skill.development_actions, tags)
            }
          end
        end

        def format_development_actions(development_actions, tags = [])
          # Order development actions by tag matches, then limit to 5
          # Actions matching more tags appear first, followed by non-matching ones,
          # this ensures wrong tags also results in some data for assistant to work with
          ordered_actions = ::Idp::DevelopmentAction::OrderByTagsQuery.new(
            development_actions,
            tags,
            limit: 5
          ).query

          ordered_actions.map do |action|
            {
              id: action.id,
              name: action.name,
              description: action.description,
              learning_style: action.learning_style,
              development_action_type: action.development_action_type,
              duration: action.duration,
              course_url: action.course_url,
              course_start_date: action.course_start_date,
              course_end_date: action.course_end_date,
              type: action.development_action_type,
              tags: action.tag_list.to_a.first(5)
            }
          end
        end

        def parse_development_action_tags(development_action_tags)
          return [] if development_action_tags.blank?

          development_action_tags.split(',').map { |tag| tag.strip.downcase }.compact_blank
        end

        def meta_info(query_result)
          all_skills = query_result
          result_count = all_skills.size
          skills_by_type = all_skills.group_by(&:skill_type).transform_values(&:count)

          {
            result_count: result_count,
            query_result_by_type: skills_by_type,
            total_available_skills: skills.count
          }
        end

        def available_skills
          ::Idp::IdpPlan::AvailableSkillsQuery.new(user_idp_plan).query
        end

        def skills
          available_skills.with_embeddings.includes(:development_actions)
        end
      end
    end
  end
end
