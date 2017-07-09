module Features
  module Helpers
    module Assessments
      def create_assessment(opts = {})
        visit '/administration/assessments'
        find('.panel-heading a', text: t('administration.assessments.index.new')).click
        find('.modal-header').click
        within '#new_resource' do
          fill_in 'resource_name', with: opts[:name]
          select opts[:dimension_name], from: 'resource_dimension_id', visible: false
          click_on 'Create'
        end
        wait_for_ajax
      end

      def toggle_assessment(assessment, enable = true)
        visit '/administration/assessments'
        find("#assessment_#{assessment.id} .toggle-status").click
        message = 'Enable'
        message = 'Disable' unless enable
        expect(page).to have_content message
        find(:button, text: 'Yes').click
        wait_for_ajax
      end

      def copy_assessment(assessment)
        visit '/administration/assessments'
        find("#assessment_#{assessment.id} .copy").click
        wait_for_ajax
      end

      def preview_assessment(assessment)
        visit '/administration/assessments'
        first("#assessment_#{assessment.id} td", text: assessment.decorate.created_at).click
        click_on t('administration.assessments.sidebar.preview')
      end
    end
  end
end
