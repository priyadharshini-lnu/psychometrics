class Administration::SurveysController < Administration::BaseController
  add_breadcrumb I18n.t('administration.breadcrumbs.surveys'), :administration_root_path

  # Skip verify_policy_scoped defined in base controller
  before_action :skip_policy_scope

  def index
    authorize :home
  end
end
