# frozen_string_literal: true

namespace :one_time do
  task remove_reset_password_permissions: :environment do
    grants = MembershipGrant.joins(:membership).where(memberships: { role: 'campaign_admin' }).
             where("data @> '{\"users\": [\"reset_password\"]}'")
    grants.update_all('data = data - \'users\'')
  end
end
