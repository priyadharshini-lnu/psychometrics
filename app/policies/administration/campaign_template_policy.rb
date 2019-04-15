module Administration
  class CampaignTemplatePolicy < Administration::BasePolicy
    def sidebar?
      @user.is?(:superadmin)
    end
  end
end
