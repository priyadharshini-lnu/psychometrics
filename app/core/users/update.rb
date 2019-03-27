module Users
  class Update < Rectify::Command
    attr_reader :form, :project, :user

    def initialize(form, project, user)
      @form = form
      @project = project
      @user = user
    end

    def call
      return broadcast :invalid, form if form.invalid?
      user.update!(form.attributes)
      broadcast :ok, user
    end
  end
end
