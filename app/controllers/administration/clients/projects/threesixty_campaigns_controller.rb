module Administration
  module Clients
    module Projects
      class ThreesixtyCampaignsController < Administration::Clients::CampaignsController
        include Administration::Clients
        before_action :ensure_project

        def show; end

        private

        def init_breadcrumbs
          client_root_breadcrumb
          add_breadcrumb client.decorate.display_name, [:administration, client, :projects]
          add_breadcrumb project.decorate.display_name, administration_client_project_campaigns_path(client, project)
        end
      end
    end
  end
end
