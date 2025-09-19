# frozen_string_literal: true

module AI
  module Tools
    module Idp
      class AvailableSkillsAndDevelopmentActions < AI::Tools::Base
        description 'Fetches available skills and development actions to be used while creating ' \
                    'an Individual Development Plan (IDP) from the IDP Template.'

        param :page,
              desc: 'Page number for pagination. Default value is set to 1. e.g. 1'

        private_attr_reader :idp_template

        DEFAULT_PAGE_SIZE = 100

        def initialize(idp_template)
          @idp_template = idp_template
        end

        def execute(page: 1)
          page_number = [page.to_i, 1].max

          {
            skills: fetch_skills_with_development_actions(page_number, DEFAULT_PAGE_SIZE),
            meta: meta_info(page_number, DEFAULT_PAGE_SIZE)
          }
        end

        private

        def fetch_skills_with_development_actions(page, per_page)
          skills = available_skills.order(:skill_type, :name).page(page).per(per_page)

          skills.map do |skill|
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

        def meta_info(page, per_page)
          total_skills = available_skills.count
          total_pages = (total_skills.to_f / per_page).ceil
          skills_by_type = available_skills.group(:skill_type).count

          {
            total_skills: total_skills,
            skills_by_type: skills_by_type,
            pagination: {
              current_page: page,
              total_pages: total_pages,
              next_page: page < total_pages ? page + 1 : nil
            }
          }
        end

        def available_skills
          @available_skills ||= idp_template.available_skills.
                                includes(:development_actions)
        end
      end
    end
  end
end
