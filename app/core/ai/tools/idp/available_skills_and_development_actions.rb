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

        private_attr_reader :idp_template

        def initialize(idp_template)
          @idp_template = idp_template
        end

        def execute(query_text:, limit: 5)
          result_limit = [limit.to_i, 5].min
          query_by_similarity_service = Skills::EmbeddingQuery.new(
            template_skills,
            query_text:,
            limit: result_limit
          )

          query_by_similarity_service.
            on(:ok) do |query_result|
              return {
                skills: format_skills_with_development_actions(query_result),
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

        def format_skills_with_development_actions(query_result)
          query_result.map do |skill|
            {
              id: skill.id,
              name: skill.name,
              description: skill.description,
              skill_type: skill.skill_type,
              development_actions: format_development_actions(skill.development_actions)
            }
          end
        end

        def format_development_actions(development_actions)
          # Limit to 5 development actions per skill
          # Instead of limiting development actions,
          # better way would be adding a query/filter which can fetch apt actions
          # We want to ensure that we only pass the necessary data which assistant can use
          recommended_actions = development_actions.limit(5)
          recommended_actions.map do |action|
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
              type: action.development_action_type
            }
          end
        end

        def meta_info(query_result)
          all_skills = query_result
          result_count = all_skills.size
          skills_by_type = all_skills.group_by(&:skill_type).transform_values(&:count)

          {
            result_count: result_count,
            query_result_by_type: skills_by_type,
            total_skills_in_template: template_skills.count
          }
        end

        def template_skills
          @template_skills ||= idp_template.available_skills.with_embeddings.
                               includes(:development_actions)
        end
      end
    end
  end
end
