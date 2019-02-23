module Users
  class Create < Rectify::Command
    attr_reader :form, :project

    def initialize(form, project)
      @form = form
      @project = project
    end

    def call
      return broadcast :invalid, form if form.invalid?
      user = ::Users::Regular.create!(form.attributes.merge(project_id: project.id))
      ([project.id] + form.campaign_ids).each do |client_id|
        user.memberships.create!(role: Membership::MEMBER_ROLE, client_id: client_id)
      end

      broadcast :ok, user
    end
  end
end
