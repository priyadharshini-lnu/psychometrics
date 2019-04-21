import Campaign from './Campaign'
import Sidebar from './Sidebar'
import connect from './connect'

export default connect(Campaign)

export const CampaignSidebar = connect(Sidebar)
