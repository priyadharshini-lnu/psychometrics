def create_and_assign_assessment_to(membership)
  assessment = create(:assessment)
  assessment.assigns.create(membership: membership)
  assessment.assign_clients.create(client: membership.client)
  assessment
end
