# frozen_string_literal: true

module AI
  module Tools
    module Idp
      class AvailableSkillsAndDevelopmentActions < AI::Tools::Base
        description 'Search for skills that needs to be added to user development plan using AI-powered ' \
                    'semantic similarity matching. Returns skills ranked by relevance with all ' \
                    'their associated expert curated development actions available on the platform.'

        param :query_text,
              desc: 'Personalized skill search query based on prior user interaction and analysis. ' \
                    'Formulate a targeted search for skills that align with the user\'s specific development ' \
                    'needs, current competencies, role requirements, and identified gaps. Include multiple ' \
                    'related skills and contextual information from the user analysis. ' \
                    'Examples: "advanced Python programming and system architecture for senior backend developer ' \
                    'transitioning to tech lead", "stakeholder communication and strategic planning for product ' \
                    'manager with technical background moving to director level", "data storytelling and ' \
                    'executive presentation skills for analyst seeking promotion to senior consultant"'
        param :limit,
              desc: 'Maximum number of top skills to return against the semantic search. Default is 5. Maximum is 5.'

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
          development_actions.map do |action|
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
