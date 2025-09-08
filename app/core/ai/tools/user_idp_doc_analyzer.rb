# frozen_string_literal: true

# rubocop:disable Layout/LineLength
# TODO: Since we are not using interviewer, we have this dedicated tool, it would be better to make it more generic to use all tool type assistant for future proofing
module AI
  module Tools
    class UserIdpDocAnalyzer < AI::Tools::Base
      description 'Fetches detailed analysis/summary for the document uploaded by user for their Individual Development Plan(IDP) creation purpose.'
      param :context,
            desc: 'Context to be passed to the expert assistant for analysis which would be passed with the uploaded document e.g. Document is resume by user. If no context is provided, the expert will use the default content as context and this can be nil'

      private_attr_reader :user_idp_plan

      def initialize(user_idp_plan, user)
        @user_idp_plan = user_idp_plan
        @user = user
      end

      def execute(context:)
        # TODO: Delegate this action to tool assistant for analysis and save results

        summary = <<~SUMMARY
          The uploaded skill gap report provides a detailed evaluation of current staff competencies in relation to organizational requirements. The analysis highlights several key areas where gaps exist between existing skills and those needed for optimal performance. Technical skills, particularly in emerging software development frameworks, cloud computing, and automation tools, are identified as areas needing significant improvement. While most team members possess foundational knowledge in programming and basic data analysis, advanced capabilities with data visualization platforms and modern analytics tools are limited. Cybersecurity is another area of concern, with general awareness present but specialized expertise in risk management and incident response notably lacking.

          On the business and communication front, the report reveals that while daily coordination and interpersonal communication are generally strong, there is a widespread need for enhanced project management abilities and formal training in structured methodologies such as Agile and Scrum. Many employees struggle to effectively communicate technical information to non-technical stakeholders, and strategic planning skills are underdeveloped across the team.

          Leadership and teamwork are also assessed in the report. Although there is enthusiasm for leading projects and collaborating across departments, the findings suggest limited experience in people management, conflict resolution, and leveraging digital collaboration platforms. Remote teamwork practices, in particular, are highlighted as having room for improvement.

          Based on these findings, the report recommends targeted training initiatives focusing on advanced technical skills, business strategy, and project management certification. It also suggests the implementation of mentorship programs to foster leadership growth and encourages participation in continuous learning opportunities such as workshops and webinars. The overall conclusion is that addressing these skill gaps through structured development efforts will not only enhance individual performance but also contribute to the organization's long-term success.
        SUMMARY

        # Save summary to user IDP plan
        Rails.logger.debug { "Context by IDP Assistant #{context}" }
        summary.strip
      end
    end
  end
end
# rubocop:enable Layout/LineLength
