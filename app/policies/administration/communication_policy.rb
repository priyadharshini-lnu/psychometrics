module Administration
  class CommunicationPolicy < Administration::BasePolicy
    def new_form?
      true
    end

    def edit_form?
      true
    end
  end
end
