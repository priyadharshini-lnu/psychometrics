module Features
  module Helpers
    module Norms
      def create_norm(opts = {})
        visit '/administration/norms'
        find('.panel-heading a', text: t('administration.norms.index.new')).click
        find('.modal-header').click
        within '#new_resource' do
          fill_in 'resource_name', with: opts[:name]
          select opts[:dimension_name], from: 'resource_dimension_id', visible: false
          click_on 'Create'
        end
      end

      def toggle_norm(norm, enable = true)
        visit '/administration/norms'
        find("#norm_#{norm.id} .toggle-status").click
        message = 'Enable'
        message = 'Disable' unless enable
        expect(page).to have_content message
        find(:button, text: 'Yes').click
        wait_for_ajax
      end

      def copy_norm(norm)
        visit '/administration/norms'
        find("#norm_#{norm.id} .copy").click
      end

      def export_norm(norm)
        visit '/administration/norms'
        click_norm norm
        click_on t('administration.norms.sidebar.export')
        DownloadHelpers.wait_for_download
        DownloadHelpers.download
      end

      def import_norm(file)
        visit '/administration/norms'
        find('.panel-heading a', text: t('administration.norms.index.import')).click
        find('.modal-header').click
        within '#new_import' do
          attach_file('import_file', file)
          click_on t('administration.imports.form.import')
        end
        wait_for_ajax
        Norm.last
      end

      def click_norm(norm)
        first("#norm_#{norm.id} td", text: norm.decorate.created_at).click
      end
    end
  end
end
