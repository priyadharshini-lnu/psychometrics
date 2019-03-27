module Features
  module Helpers
    module Clients
      def import_countries
        Rake::Task['geo:import'].invoke
      end

      def create_tenancy(opts = {})
        visit administration_clients_path
        find('.panel-heading a', text: t('administration.clients.index.new')).click
        find('.modal-header').click
        within '#new_resource' do
          fill_in 'resource_name', with: opts[:name]
          fill_in 'resource_number', with: opts[:number]
          select opts[:country], from: 'resource_country', visible: false
          select opts[:year], from: 'resource_year', visible: false
          select opts[:account_manager], from: 'resource_account_manager_id', visible: false
          select opts[:project_manager], from: 'resource_project_manager_id', visible: false
          click_on t('administration.create')
        end
        wait_for_ajax
        if block_given?
          yield
        else
          tenancy = Client.last
          expect(page).to have_content t('administration.clients.create.successfully', name: opts[:name])
          expect(page).to have_css('#clients_list td', text: opts[:name])
          expect(tenancy.tte).to be nil
          expect(tenancy.end_level?).to be false
          tenancy
        end
      end

      def create_project(tenancy, opts = {})
        visit administration_client_projects_path(tenancy)
        find('.panel-heading a', text: t('administration.clients.projects.index.new')).click
        find('.modal-header').click
        within '#project_form' do
          fill_in 'resource_name', with: opts[:name]
          fill_in 'resource_subdomain', with: opts[:subdomain]
          fill_in 'resource_number', with: opts[:number]
          select opts[:applicable_level], from: 'resource_applicable_level', visible: false
          click_on t('administration.create')
        end
        wait_for_ajax
        if block_given?
          yield
        else
          project = Client.last
          expect(page).to have_content t('administration.clients.projects.create.successfully', name: opts[:name])
          expect(page).to have_css('#clients_list td', text: opts[:name])
          expect(project.tte).to eql tenancy
          expect(project.parent).to eql tenancy
          expect(project.end_level?).to be false
          project
        end
      end

      def create_campaign(tenancy, project, opts = {})
        visit administration_client_project_campaigns_path(tenancy, project)
        find('.panel-heading a', text: t('administration.clients.projects.campaigns.index.new')).click
        find('.modal-header').click
        within '#project_form' do
          fill_in 'resource_name', with: opts[:name]
          click_on t('administration.create')
        end
        wait_for_ajax
        if block_given?
          yield
        else
          campaign = Client.last
          expect(page).to have_content t('administration.clients.campaigns.create.successfully', name: opts[:name])
          expect(page).to have_css('#clients_list td', text: opts[:name])
          expect(campaign.tte).to eql tenancy
          expect(campaign.parent).to eql project
          expect(campaign.end_level?).to be false
          campaign
        end
      end

      def create_sub_campaign(tenancy, project, campaign, opts = {})
        visit administration_client_project_campaigns_path(tenancy, project)
        find("#client_#{campaign.id} a", text: t('administration.clients.campaigns.resource.sub_campaign.create')).click
        find('.modal-header').click
        within '#project_form' do
          fill_in 'resource_name', with: opts[:name]
          click_on t('administration.create')
        end
        wait_for_ajax
        if block_given?
          yield
        else
          sub_campaign = Client.last
          expect(page).to have_content t('administration.clients.campaigns.create.successfully', name: opts[:name])
          expect(page).to have_css("#client_#{campaign.id} td", text: opts[:name])
          expect(sub_campaign.tte).to eql tenancy
          expect(sub_campaign.parent).to eql campaign
          expect(sub_campaign.project).to eql project
          expect(sub_campaign.end_level?).to be true
          sub_campaign
        end
      end
    end
  end
end
