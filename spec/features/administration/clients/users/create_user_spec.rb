require 'rails_helper'

feature 'Create User' do
  given(:client) { create(:client) }
  given(:subclient) { create(:client, parent: client) }

  before { enter_as :superadmin }

  # TODO: fix
  scenario 'Memberships for client/subclient' do
    # user = create_subclient_user(subclient, email: 'user@email.com', first_name: 'Mike', last_name: 'Wazowski')
    # expect(page).to have_text(t('administration.memberships.create.successfully', name: user.decorate.display_name))
    #
    # visit administration_client_users_path(client.id)
    # membership = user.memberships.where(client_id: client.id).first
    # expect(page).to have_css("tr#membership_#{membership.id} td", text: 'Mike')
  end
end
